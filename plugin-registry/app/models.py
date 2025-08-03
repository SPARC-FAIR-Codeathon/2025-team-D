from sqlalchemy import create_engine, Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from enum import Enum
import os
import uuid

DATABASE_PATH = os.getenv("DATABASE_PATH", "./plugin_registry.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class BuildStatus(Enum):
    PENDING = "pending"
    BUILDING = "building"
    COMPLETED = "completed"
    FAILED = "failed"

class Plugin(Base):
    __tablename__ = "plugins"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False)
    version = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    author = Column(String, nullable=True)
    repository_url = Column(String, nullable=True)
    plugin_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    builds = relationship("PluginBuild", back_populates="plugin")

class PluginBuild(Base):
    __tablename__ = "plugin_builds"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    plugin_id = Column(String, ForeignKey("plugins.id"), nullable=False)
    build_id = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default=BuildStatus.PENDING.value, nullable=False)
    build_logs = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    s3_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    plugin = relationship("Plugin", back_populates="builds")

class PluginBase(BaseModel):
    name: str
    version: str
    description: Optional[str] = None
    author: Optional[str] = None
    repository_url: Optional[str] = None
    plugin_metadata: Optional[dict] = None

class PluginCreate(PluginBase):
    pass

class PluginUpdate(PluginBase):
    name: Optional[str] = None
    version: Optional[str] = None
    plugin_metadata: Optional[dict] = None

class PluginResponse(PluginBase):
    id: str
    plugin_metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PluginBuildBase(BaseModel):
    build_id: Optional[str] = None
    status: Optional[str] = BuildStatus.PENDING.value
    build_logs: Optional[str] = None
    error_message: Optional[str] = None
    s3_path: Optional[str] = None

class PluginBuildCreate(PluginBuildBase):
    pass

class PluginBuildUpdate(BaseModel):
    status: Optional[str] = None
    build_logs: Optional[str] = None
    error_message: Optional[str] = None
    s3_path: Optional[str] = None

class PluginBuildResponse(PluginBuildBase):
    id: str
    plugin_id: str
    build_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 