from agents import function_tool
from sparc.client import SparcClient
from typing import Optional

client = SparcClient(connect=False, config_file='config.ini')

@function_tool
def sparc_metadata_search(query: str) -> str:
    """search sparc datasets metadata through elastic search query"""
    return client.pennsieve.list_datasets(query=query, limit=3)

@function_tool
def pennsieve_search(query: str) -> str:
    """search pennsieve datasets through pennsieve api"""
    return client.pennsieve.list_datasets(query=query, limit=3)


@function_tool
def pennsieve_list_files(limit: int = 10, offset: int = 0, file_type: Optional[str] = None, 
                        query: Optional[str] = None, organization: Optional[str] = None,
                        organization_id: Optional[int] = None, dataset_id: Optional[int] = None) -> str:
    """search and retrieve files with various filtering options"""
    try:
        kwargs = {"limit": limit, "offset": offset}
        if file_type:
            kwargs["file_type"] = file_type
        if query:
            kwargs["query"] = query
        if organization:
            kwargs["organization"] = organization
        if organization_id:
            kwargs["organization_id"] = organization_id
        if dataset_id:
            kwargs["dataset_id"] = dataset_id
        
        result = client.pennsieve.list_files(**kwargs)
        return str(result)
    except Exception as e:
        return f"Failed to list files: {str(e)}"

@function_tool
def pennsieve_list_filenames(limit: int = 10, offset: int = 0, file_type: Optional[str] = None,
                            query: Optional[str] = None, organization: Optional[str] = None,
                            organization_id: Optional[int] = None, dataset_id: Optional[int] = None) -> str:
    """extract file names from files search"""
    try:
        kwargs = {"limit": limit, "offset": offset}
        if file_type:
            kwargs["file_type"] = file_type
        if query:
            kwargs["query"] = query
        if organization:
            kwargs["organization"] = organization
        if organization_id:
            kwargs["organization_id"] = organization_id
        if dataset_id:
            kwargs["dataset_id"] = dataset_id
            
        result = client.pennsieve.list_filenames(**kwargs)
        return str(result)
    except Exception as e:
        return f"Failed to list filenames: {str(e)}"

# @function_tool
# def pennsieve_download_file(file_list: str, output_name: Optional[str] = None) -> str:
#     """download files to local storage"""
#     try:
#         kwargs = {"file_list": file_list}
#         if output_name:
#             kwargs["output_name"] = output_name
            
#         result = client.pennsieve.download_file(**kwargs)
#         return f"File(s) downloaded successfully: {result}"
#     except Exception as e:
#         return f"Failed to download file(s): {str(e)}"

@function_tool
def pennsieve_list_records(limit: int = 10, offset: int = 0, model: Optional[str] = None,
                          organization: Optional[str] = None, dataset_id: Optional[int] = None) -> str:
    """retrieve records with filtering options"""
    try:
        kwargs = {"limit": limit, "offset": offset}
        if model:
            kwargs["model"] = model
        if organization:
            kwargs["organization"] = organization
        if dataset_id:
            kwargs["dataset_id"] = dataset_id
            
        result = client.pennsieve.list_records(**kwargs)
        return str(result)
    except Exception as e:
        return f"Failed to list records: {str(e)}"


def pennsieve_get(url: str) -> str:
    """perform GET request to Pennsieve API"""
    try:
        result = client.pennsieve.get(url)
        return str(result)
    except Exception as e:
        return f"Failed to perform GET request: {str(e)}"


def pennsieve_post(url: str, json_data: str) -> str:
    """perform POST request to Pennsieve API"""
    try:
        import json
        data = json.loads(json_data)
        result = client.pennsieve.post(url, json=data)
        return str(result)
    except Exception as e:
        return f"Failed to perform POST request: {str(e)}"