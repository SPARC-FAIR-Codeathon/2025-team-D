import asyncio
import os
import json
import requests
import subprocess
import logging
from pathlib import Path
from openai import OpenAI

from app.prompts import tools, AGENT_INSTRUCTIONS
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


api_key = os.getenv("AI_API_KEY")
model =  os.getenv("MODEL")
base_url = os.getenv("BASE_URL")

client = OpenAI(
    api_key = api_key,
    base_url = base_url
)

PLUGIN_REGISTRY_BASE_URL = "http://plugin-registry:80"

def run_agent(prompt: str = "create an app to show the banner of a dataset"):
    messages = [{"role": "system", "content": AGENT_INSTRUCTIONS},
                {"role": "user", "content": prompt}]
    is_done = False
    count = 0
    while not is_done and count < 150:
        count += 1
        logger.info(f"Iteration: {count}")
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice="required",
        )
        
        assistant_message = response.choices[0].message
        messages.append({
            "role": "assistant",
            "content": assistant_message.content,
            "tool_calls": [
                {
                    "id": tool_call.id,
                    "type": "function",
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments
                    }
                }
                for tool_call in assistant_message.tool_calls
            ] if assistant_message.tool_calls else None
        })
        
        # Process tool calls
        if assistant_message.tool_calls:
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)
                tool_call_id = tool_call.id
                
                logger.info(f"Tool called: {tool_name} with args: {tool_args}")
                
                if tool_name == "done":
                    logger.info(f"Done: All tasks are completed")
                    is_done = True
                    # Add tool response for done
                    messages.append({
                        "role": "tool",
                        "content": json.dumps({"status": "completed", "message": tool_args.get("message", "Tasks completed")}),
                        "tool_call_id": tool_call_id
                    })
                elif tool_name == "shell_tool":
                    logger.info(f"Shell tool: running shell command")
                    command = tool_args["command"]
                    
                    try:
                        # Execute command in the restricted directory
                        result = subprocess.run(
                            command,
                            shell=True,
                            cwd="/plugins",
                            capture_output=True,
                            text=True,
                            timeout=30  # 30 second timeout
                        )
                        
                        output = f"Command: {command}\nWorking directory: /plugins\n"
                        if result.stdout:
                            output += f"STDOUT:\n{result.stdout}"
                        if result.stderr:
                            output += f"STDERR:\n{result.stderr}"
                        output += f"Return code: {result.returncode}"
                        
                    except subprocess.TimeoutExpired:
                        output = f"Command timed out after 30 seconds: {command}"
                    except Exception as e:
                        output = f"Error executing command '{command}': {str(e)}"
                    
                    logger.info(f"Shell output: {output}")
                    # Add tool response for shell_tool
                    messages.append({
                        "role": "tool",
                        "content": output,
                        "tool_call_id": tool_call_id
                    })
                elif tool_name == "register_plugin":
                    logger.info(f"Registering plugin: {tool_args}")
                    try:
                        # Call plugin registry to register the plugin
                        plugin_data = {
                            "name": tool_args["name"],
                            "description": tool_args["description"],
                            "version": tool_args.get("version", "1.0.0"),
                            "author": tool_args.get("author", "PromptMe Agent"),
                            "repository_url": tool_args["repository_url"],
                            "plugin_metadata": tool_args.get("metadata", {})
                        }
                        
                        response = requests.post(
                            f"{PLUGIN_REGISTRY_BASE_URL}/plugins/",
                            json=plugin_data,
                            timeout=30
                        )
                        
                        if response.status_code == 200:
                            plugin_info = response.json()
                            result = f"Registering plugin: Plugin registered successfully with ID: {plugin_info['id']}"
                        else:
                            result = f"Registering plugin: Failed to register plugin: {response.text}"
                        
                    except Exception as e:
                        result = f"Registering plugin: Error registering plugin: {str(e)}"
                    
                    logger.info(f"Registering plugin: Plugin registration result: {result}")
                    messages.append({
                        "role": "tool",
                        "content": result,
                        "tool_call_id": tool_call_id
                    })
                elif tool_name == "random_name":
                    logger.info(f"Generating random name: {tool_args}")
                    result = f"Random name: {tool_args['name']}"
                    messages.append({
                        "role": "tool",
                        "content": result,
                        "tool_call_id": tool_call_id
                    })
                else:
                    logger.info(f"Unknown tool called: {tool_name} with args: {tool_args}")
                    # Add tool response for unknown tool
                    messages.append({
                        "role": "tool",
                        "content": json.dumps({"error": f"Unknown tool: {tool_name}"}),
                        "tool_call_id": tool_call_id
                    })
        else:
            logger.info("No tool calls in this response")
            logger.info(assistant_message.content)