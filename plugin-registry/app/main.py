from pathlib import Path
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
from datetime import datetime
from typing import List, Dict, Any
from contextlib import asynccontextmanager
from pydantic import BaseModel
import uuid
import threading
import logging
import requests
import httpx
from .models import (
    Plugin, PluginCreate, PluginResponse,
    PluginBuild, PluginBuildResponse,
    BuildStatus, SessionLocal
)
from .database import get_db, init_db
from .build import PluginBuilder
from .minio_client import get_minio_client
from .utils import call_pennsieve_api
from .logger import get_logger, configure_logging

configure_logging()
logger = get_logger(__name__)

class PromptRequest(BaseModel):
    prompt: str

PROMPTME_BASE_URL = "http://promptme:80"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    pass

app = FastAPI(title="Plugin Registry API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

builder = PluginBuilder()

@app.get("/")
async def root():
    return {"message": "Plugin Registry API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/plugins/", response_model=PluginResponse)
async def create_plugin(plugin: PluginCreate, db: Session = Depends(get_db)):
    existing_plugin = db.query(Plugin).filter(Plugin.name == plugin.name).first()
    if existing_plugin:
        raise HTTPException(status_code=400, detail="Plugin with this name already exists")
    
    db_plugin = Plugin(**plugin.model_dump())
    db.add(db_plugin)
    db.commit()
    db.refresh(db_plugin)
    return db_plugin

@app.get("/plugins/", response_model=List[PluginResponse])
async def get_plugins(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plugins = db.query(Plugin).offset(skip).limit(limit).all()
    return plugins

@app.get("/plugins/{plugin_id}", response_model=PluginResponse)
async def get_plugin(plugin_id: str, db: Session = Depends(get_db)):
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return plugin

@app.delete("/plugins/{plugin_id}")
async def delete_plugin(plugin_id: str, db: Session = Depends(get_db)):
    db_plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if db_plugin is not None :
        db.delete(db_plugin)
        db.commit()
    # delete the record form the metadata.json file
    metadata_file = Path("/app/portal/public/metadata.json")
    if metadata_file.exists():
        with open(metadata_file, "r") as f:
            metadata = json.load(f)
        metadata["components"] = [component for component in metadata["components"] if component["id"] != plugin_id]
        with open(metadata_file, "w") as f:
            json.dump(metadata, f)
    else:
        raise HTTPException(status_code=404, detail="Metadata file not found")
    return {"message": "Plugin deleted successfully"}

@app.post("/plugins/{plugin_id}/build/")
async def execute_build(
    plugin_id: str, 
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Execute a plugin build using git CLI and npm"""
    
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    # Convert Plugin object to dict for JSON serialization
    plugin_dict = {
        "id": plugin.id,
        "name": plugin.name,
        "version": plugin.version,
        "description": plugin.description,
        "author": plugin.author,
        "repository_url": plugin.repository_url,
        "plugin_metadata": plugin.plugin_metadata,
        "created_at": plugin.created_at.isoformat() if plugin.created_at else None,
        "updated_at": plugin.updated_at.isoformat() if plugin.updated_at else None
    }
    logger.info(f"Building plugin: {json.dumps(plugin_dict, indent=4)}")
    
    build_id = str(uuid.uuid4())
    
    db_build = PluginBuild(
        plugin_id=plugin_id,
        build_id=build_id,
        status=BuildStatus.PENDING.value
    )
    db.add(db_build)
    db.commit()
    db.refresh(db_build)
    
    def run_build():
        try:
            with SessionLocal() as session:
                build_record = session.query(PluginBuild).filter(PluginBuild.build_id == build_id).first()
                if build_record:
                    build_record.status = BuildStatus.BUILDING.value
                    session.commit()
            
            builder = PluginBuilder()
            result = builder.build_plugin(plugin_dict)
            
            with SessionLocal() as session:
                build_record = session.query(PluginBuild).filter(PluginBuild.build_id == build_id).first()
                if build_record:
                    if result["success"]:
                        build_record.status = BuildStatus.COMPLETED.value
                        build_record.s3_path = result.get("s3_path")  # Store S3 path if available
                    else:
                        build_record.status = BuildStatus.FAILED.value
                        build_record.error_message = result["error_message"]
                    
                    build_record.build_logs = result["build_logs"]
                    build_record.updated_at = datetime.utcnow()
                    session.commit()
        
        except Exception as e:
            # Update build record with error
            with SessionLocal() as session:
                build_record = session.query(PluginBuild).filter(PluginBuild.build_id == build_id).first()
                if build_record:
                    build_record.status = BuildStatus.FAILED.value
                    build_record.error_message = str(e)
                    build_record.updated_at = datetime.utcnow()
                    session.commit()
    
    if background_tasks:
        background_tasks.add_task(run_build)
    else:
        thread = threading.Thread(target=run_build)
        thread.start()
    
    return {
        "build_id": build_id,
        "status": "pending",
        "message": "Build started in background",
        "repo_url": plugin.repository_url
    }


@app.get("/plugins/{plugin_id}/builds/", response_model=List[PluginBuildResponse])
async def get_plugin_builds(plugin_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Check if plugin exists
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    builds = db.query(PluginBuild).filter(PluginBuild.plugin_id == plugin_id).offset(skip).limit(limit).all()
    return builds

@app.get("/builds/{build_id}", response_model=PluginBuildResponse)
async def get_build(build_id: str, db: Session = Depends(get_db)):
    build = db.query(PluginBuild).filter(PluginBuild.build_id == build_id).first()
    if build is None:
        raise HTTPException(status_code=404, detail="Build not found")
    return build

@app.get("/builds/", response_model=List[PluginBuildResponse])
async def get_all_builds(skip: int = 0, limit: int = 100, status: BuildStatus = None, db: Session = Depends(get_db)):
    query = db.query(PluginBuild)
    if status:
        query = query.filter(PluginBuild.status == status)
    
    builds = query.offset(skip).limit(limit).all()
    return builds


@app.get("/builds/{build_id}/download-url")
async def get_build_download_url(build_id: str, db: Session = Depends(get_db)):
    """Get a presigned download URL for a build's artifacts"""
    
    build_record = db.query(PluginBuild).filter(PluginBuild.build_id == build_id).first()
    if build_record is None:
        raise HTTPException(status_code=404, detail="Build not found")
    
    if not build_record.s3_path:
        raise HTTPException(status_code=404, detail="No artifacts available for this build")
    
    if build_record.status != BuildStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Build is not completed")
    
    try:
        s3_path = build_record.s3_path
        if not s3_path.startswith("s3://"):
            raise HTTPException(status_code=500, detail="Invalid S3 path format")
        
        object_key = s3_path.replace("s3://", "").split("/", 1)[1]
        
        minio_client = get_minio_client()
        download_url = minio_client.get_public_url(object_key)
        
        return {
            "build_id": build_id,
            "download_url": download_url,
            "expires_in": None,  # No expiration for public URLs
            "s3_path": s3_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")

@app.get("/builds/{build_id}/direct-url")
async def get_build_direct_url(build_id: str, db: Session = Depends(get_db)):
    """Get a direct public URL for a build's artifacts (no expiration)"""
    
    # Get build record
    build_record = db.query(PluginBuild).filter(PluginBuild.build_id == build_id).first()
    if build_record is None:
        raise HTTPException(status_code=404, detail="Build not found")
    
    if not build_record.s3_path:
        raise HTTPException(status_code=404, detail="No artifacts available for this build")
    
    if build_record.status != BuildStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Build is not completed")
    
    try:
        s3_path = build_record.s3_path
        if not s3_path.startswith("s3://"):
            raise HTTPException(status_code=500, detail="Invalid S3 path format")
        
        object_key = s3_path.replace("s3://", "").split("/", 1)[1]
        
        minio_client = get_minio_client()
        direct_url = minio_client.get_public_url(object_key)
        
        return {
            "build_id": build_id,
            "direct_url": direct_url,
            "s3_path": s3_path,
            "note": "This URL has no expiration and is publicly accessible"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate direct URL: {str(e)}")

@app.post("/generate-plugin")
async def generate_plugin_with_prompt(request: PromptRequest, background_tasks: BackgroundTasks):
    """Forward prompt to promptme service and handle the response"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PROMPTME_BASE_URL}/generate",
                params={"prompt": request.prompt},
                timeout=30.0
            )
            
            if response.status_code == 200:
                promptme_response = response.json()
                logger.info(f"Promptme response: {promptme_response}")
                return {
                    "message": "Plugin generation initiated",
                    "status": "running",
                    "promptme_response": promptme_response
                }
            else:
                logger.error(f"Promptme returned error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Promptme service error: {response.text}"
                )
        
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to promptme service: {e}")
        raise HTTPException(
            status_code=503,
            detail="Promptme service unavailable"
        )
    except Exception as e:
        logger.error(f"Error in generate_plugin_with_prompt: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.api_route("/pennsieve/{path:path}", methods=["GET", "OPTIONS"])
async def proxy_to_pensive(request: Request, path: str):
    """Proxy requests to Pennsieve API using call_pennsieve_api"""
    try:

        data = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
            if body:
                try:
                    data = json.loads(body)
                except json.JSONDecodeError:
                    raise HTTPException(status_code=400, detail="Invalid JSON in request body")
        
        result = call_pennsieve_api(path, method=request.method, data=data)
        
        return {
            "message": f"Successfully proxied {request.method} request to Pennsieve API",
            "path": path,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error in pensive proxy to Pennsieve: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Pennsieve API proxy error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
