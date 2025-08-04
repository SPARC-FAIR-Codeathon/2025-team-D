import os
import boto3
import requests
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

PENNSIEVE_URL = "https://api.pennsieve.io"

api_secret = os.getenv("PENNSIEVE_API_SECRET")
api_key = os.getenv("PENNSIEVE_API_KEY")

# @lru_cache(maxsize=1)
def get_pennsieve_api_key():
    if not api_secret or not api_key:
        raise ValueError("PENNSIEVE_API_SECRET and PENNSIEVE_API_KEY must be set")
    
    r = requests.get(f"{PENNSIEVE_URL}/authentication/cognito-config")
    r.raise_for_status()

    cognito_app_client_id = r.json()["tokenPool"]["appClientId"]
    cognito_region = r.json()["region"]

    cognito_idp_client = boto3.client(
    "cognito-idp",
    region_name=cognito_region,
    aws_access_key_id="",
    aws_secret_access_key="",
    )

    login_response = cognito_idp_client.initiate_auth(
    AuthFlow="USER_PASSWORD_AUTH",
    AuthParameters={"USERNAME": api_key, "PASSWORD": api_secret},
    ClientId=cognito_app_client_id,
    )


    access_token = login_response["AuthenticationResult"]["AccessToken"]

    return access_token


def call_pennsieve_api(path: str, method: str = "GET", data: dict = None):
    api_key = get_pennsieve_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    url = f"{PENNSIEVE_URL}/{path}"
    logger.info(f"Making {method} request to Pennsieve API: {url}")
    
    response = requests.request(method, url, headers=headers, json=data)
    response.raise_for_status()
    
    logger.info(f"Pennsieve API response status: {response.status_code}, content-length: {len(response.content)}")
    
    if response.content:
        try:
            return response.json()
        except ValueError as e:
            logger.warning(f"Failed to parse JSON response from Pennsieve API: {e}")
            return {"content": response.text, "content_type": response.headers.get("content-type", "unknown")}
    else:
        logger.warning("Received empty response from Pennsieve API")
        return {"message": "Empty response from Pennsieve API"}