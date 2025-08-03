import os
import logging
import json
import mimetypes
import boto3
from botocore.exceptions import ClientError
from pathlib import Path

logger = logging.getLogger(__name__)

class MinioClient:
    """MinIO client for storing plugin build artifacts using boto3"""
    
    def __init__(self):
        self.endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        self.bucket_name = os.getenv("MINIO_BUCKET_NAME", "plugin-builds")
        self.use_ssl = os.getenv("MINIO_USE_SSL", "false").lower() == "true"
        
        # Configure boto3 client for MinIO
        self.client = boto3.client(
            's3',
            endpoint_url=f"http{'s' if self.use_ssl else ''}://{self.endpoint}",
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name='us-east-1'  # MinIO doesn't require specific region
        )
        
        self._ensure_bucket_exists()
        self.ensure_public_access()
    
    def _ensure_bucket_exists(self):
        """Ensure the MinIO bucket exists"""
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"Bucket {self.bucket_name} already exists")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                self.client.create_bucket(Bucket=self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
                self._set_public_read_policy()
            else:
                logger.error(f"Failed to create bucket {self.bucket_name}: {e}")
                raise
    
    def _set_public_read_policy(self):
        """Set bucket policy to allow public read access"""
        try:
            public_read_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": [
                            "s3:GetObject",
                            "s3:GetObjectVersion"
                        ],
                        "Resource": f"arn:aws:s3:::{self.bucket_name}/*"
                    }
                ]
            }
            
            policy_json = json.dumps(public_read_policy)
            self.client.put_bucket_policy(Bucket=self.bucket_name, Policy=policy_json)
            logger.info(f"Set public read policy for bucket: {self.bucket_name}")
            
        except Exception as e:
            logger.error(f"Failed to set public read policy for bucket {self.bucket_name}: {e}")
            raise
    
    def upload_directory(self, local_path: str, remote_prefix: str) -> str:
        """Upload a directory to MinIO"""
        try:
            local_path = Path(local_path)
            if not local_path.exists():
                raise FileNotFoundError(f"Local path does not exist: {local_path}")
            
            uploaded_files = []
            
            # Walk through the directory
            for root, dirs, files in os.walk(local_path):
                for file in files:
                    file_path = Path(root) / file
                    relative_path = file_path.relative_to(local_path)
                    object_name = f"{remote_prefix}/{relative_path}"
                    
                    # Determine MIME type
                    content_type, _ = mimetypes.guess_type(str(file_path))
                    if content_type is None:
                        if file_path.suffix.lower() in ['.js', '.mjs']:
                            content_type = 'application/javascript'
                        elif file_path.suffix.lower() == '.css':
                            content_type = 'text/css'
                        else:
                            content_type = 'application/octet-stream'
                    
                    extra_args = {'ContentType': content_type}
                    with open(file_path, 'rb') as f:
                        self.client.upload_fileobj(f, self.bucket_name, object_name, ExtraArgs=extra_args)
                    
                    uploaded_files.append(object_name)
                    logger.info(f"Uploaded: {object_name}")
            
            return f"s3://{self.bucket_name}/{remote_prefix}"
            
        except Exception as e:
            logger.error(f"Failed to upload directory {local_path}: {e}")
            raise
    
    def upload_file(self, local_path: str, remote_name: str) -> str:
        """Upload a single file to MinIO"""
        try:
            if not os.path.exists(local_path):
                raise FileNotFoundError(f"Local file does not exist: {local_path}")
            
            # Determine MIME type
            content_type, _ = mimetypes.guess_type(local_path)
            if content_type is None:
                file_path = Path(local_path)
                if file_path.suffix.lower() in ['.js', '.mjs']:
                    content_type = 'application/javascript'
                elif file_path.suffix.lower() == '.css':
                    content_type = 'text/css'
                else:
                    content_type = 'application/octet-stream'
            
            # Upload file with correct MIME type
            extra_args = {'ContentType': content_type}
            self.client.upload_file(local_path, self.bucket_name, remote_name, ExtraArgs=extra_args)
            
            s3_path = f"s3://{self.bucket_name}/{remote_name}"
            logger.info(f"Uploaded file: {s3_path}")
            return s3_path
            
        except Exception as e:
            logger.error(f"Failed to upload file {local_path}: {e}")
            raise
    
    def download_file(self, remote_name: str, local_path: str):
        """Download a file from MinIO"""
        try:
            self.client.download_file(self.bucket_name, remote_name, local_path)
            logger.info(f"Downloaded: {remote_name} -> {local_path}")
            
        except Exception as e:
            logger.error(f"Failed to download file {remote_name}: {e}")
            raise
    
    def list_objects(self, prefix: str = "") -> list:
        """List objects in the bucket with optional prefix"""
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket_name, Prefix=prefix)
            if 'Contents' in response:
                return [obj['Key'] for obj in response['Contents']]
            return []
        except Exception as e:
            logger.error(f"Failed to list objects with prefix {prefix}: {e}")
            raise
    
    def delete_object(self, object_name: str):
        """Delete an object from MinIO"""
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
            logger.info(f"Deleted object: {object_name}")
        except Exception as e:
            logger.error(f"Failed to delete object {object_name}: {e}")
            raise
    
    def delete_objects_with_prefix(self, prefix: str):
        """Delete all objects with a given prefix"""
        try:
            objects = self.list_objects(prefix)
            for object_name in objects:
                self.delete_object(object_name)
            logger.info(f"Deleted {len(objects)} objects with prefix: {prefix}")
        except Exception as e:
            logger.error(f"Failed to delete objects with prefix {prefix}: {e}")
            raise
    
    def get_object_url(self, object_name: str, expires: int = 3600) -> str:
        """Get a presigned URL for an object"""
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expires
            )
            return url
        except Exception as e:
            logger.error(f"Failed to get presigned URL for {object_name}: {e}")
            raise
    
    def get_public_url(self, object_name: str) -> str:
        """Get a public URL for an object (no expiration)"""
        protocol = "https" if self.use_ssl else "http"
        return f"{protocol}://{self.endpoint}/{self.bucket_name}/{object_name}"
    
    def object_exists(self, object_name: str) -> bool:
        """Check if an object exists"""
        try:
            self.client.head_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise
        except Exception as e:
            logger.error(f"Failed to check if object exists {object_name}: {e}")
            raise
    
    def ensure_public_access(self):
        """Ensure the bucket has public read access enabled"""
        try:
            # Check current policy
            try:
                response = self.client.get_bucket_policy(Bucket=self.bucket_name)
                current_policy = json.loads(response['Policy'])
                
                # Check if public read is already enabled
                has_public_read = False
                for statement in current_policy.get('Statement', []):
                    if (statement.get('Effect') == 'Allow' and 
                        statement.get('Principal') == '*' and
                        's3:GetObject' in statement.get('Action', [])):
                        has_public_read = True
                        break
                
                if not has_public_read:
                    self._set_public_read_policy()
                    logger.info("Updated bucket policy to enable public read access")
                else:
                    logger.info("Public read access already enabled")
                    
            except ClientError as e:
                if e.response['Error']['Code'] == 'NoSuchBucketPolicy':
                    # No policy exists, create one
                    self._set_public_read_policy()
                    logger.info("Created bucket policy to enable public read access")
                else:
                    raise
                    
        except Exception as e:
            logger.error(f"Failed to ensure public access: {e}")
            raise


minio_client = None

def get_minio_client() -> MinioClient:
    """Get the global MinIO client instance"""
    global minio_client
    if minio_client is None:
        minio_client = MinioClient()
    return minio_client 