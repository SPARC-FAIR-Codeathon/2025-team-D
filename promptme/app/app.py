from fastapi import FastAPI, BackgroundTasks, HTTPException
from .agent import run_agent
import logging

logging.basicConfig(level=logging.INFO)
app = FastAPI()
logger = logging.getLogger(__name__)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.post("/generate")
async def generate(prompt: str, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(run_agent, prompt)
        return {"message": "Agent started successfully", "status": "running"}
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to start agent", "error": str(e)}
        )

    