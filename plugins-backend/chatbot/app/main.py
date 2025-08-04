from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict
import json
import logging
import uuid
from datetime import datetime
from dotenv import load_dotenv
from .agent import chat_with_agent, DatasetCardInfo

load_dotenv()
app = FastAPI(title="SPARC Chatbot API")

class ChatMessage(BaseModel):
    message: str
    model: str

class ChatResponse(BaseModel):
    response: str
    error: Optional[str] = None
    datasets: Optional[List[DatasetCardInfo]] = None

class ChatHistoryEntry(BaseModel):
    timestamp: datetime
    role: str  # "user" or "assistant"
    content: str
    model: Optional[str] = None

class ConnectionInfo:
    def __init__(self, websocket: WebSocket, chat_history: List[ChatHistoryEntry], connected_at: datetime, thread_id: str):
        self.websocket = websocket
        self.chat_history = chat_history
        self.connected_at = connected_at
        self.thread_id = thread_id


connections: Dict[str, ConnectionInfo] = {}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    connection_id = str(uuid.uuid4())
    thread_id = str(uuid.uuid4())
    connections[connection_id] = ConnectionInfo(
        websocket=websocket,
        chat_history=[],
        connected_at=datetime.now(),
        thread_id=thread_id
    )
    
    logging.info(f"New WebSocket connection: {connection_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                chat_message = ChatMessage(**message_data)
                
                user_entry = ChatHistoryEntry(
                    timestamp=datetime.now(),
                    role="user",
                    content=chat_message.message,
                    model=chat_message.model
                )
                connections[connection_id].chat_history.append(user_entry)
                
                messages = [
                    {"role": entry.role, "content": entry.content}
                    for entry in connections[connection_id].chat_history
                ]
                
                agent_response = await chat_with_agent(messages, connections[connection_id].thread_id)
                
                assistant_entry = ChatHistoryEntry(
                    timestamp=datetime.now(),
                    role="assistant", 
                    content=agent_response["message"],
                    model=chat_message.model
                )
                connections[connection_id].chat_history.append(assistant_entry)
                
                response = ChatResponse(response=agent_response["message"], datasets=agent_response["datasets"], error=None)
                await websocket.send_text(response.model_dump_json())
                
            except json.JSONDecodeError:
                error_response = ChatResponse(response="", error="Invalid JSON format")
                await websocket.send_text(error_response.model_dump_json())
            except Exception as e:
                error_response = ChatResponse(response="", error=str(e))
                await websocket.send_text(error_response.model_dump_json())
                
    except WebSocketDisconnect:
        logging.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logging.error(f"WebSocket error for {connection_id}: {e}")
    finally:
        if connection_id in connections:
            chat_history_count = len(connections[connection_id].chat_history)
            logging.info(f"Removing connection {connection_id}, had {chat_history_count} messages")
            del connections[connection_id]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
