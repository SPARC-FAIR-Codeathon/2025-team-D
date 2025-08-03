from agents import Agent, Runner
from agents.tracing import trace
from pydantic import BaseModel
from typing import List
from .tools import sparc_metadata_search, pennsieve_search, pennsieve_list_files, pennsieve_list_filenames, pennsieve_list_records

from dotenv import load_dotenv

load_dotenv()

AGENT_INSTRUCTIONS = """
You are a helpful assistant to help users with SPARC related questions.

Capabilities:
- You can search sparc metadata and  datasets.

  
Tools:
- search_sparc_datasets_metadata: search sparc metadata
- search_pennsieve_datasets: search sparc (pennsieve) datasets  
- list_pennsieve_files: list files in a pennsieve dataset
- list_pennsieve_filenames: list file names in a pennsieve dataset
- list_pennsieve_records: list records in a pennsieve dataset

"""

tools = [
    sparc_metadata_search,
    pennsieve_search,
    pennsieve_list_files,
    pennsieve_list_filenames,
    pennsieve_list_records,
]

class DatasetCardInfo(BaseModel):
      name: str
      version: int
      date: str
      doi: str
      banner: str
      id: int
      size: int
      license: str
      tags: List[str]


class DatasetResponse(BaseModel):
      message: str
      datasets: List[DatasetCardInfo]


agent = Agent(name="Assistant", instructions=AGENT_INSTRUCTIONS, tools=tools, output_type=DatasetResponse)


async def chat_with_agent(messages, thread_id):
    with trace(workflow_name="Conversation", group_id=thread_id):
        result = await Runner.run(agent, messages)
        return {"message": result.final_output.message, "datasets": result.final_output.datasets}


