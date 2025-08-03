import os
import subprocess
import shutil
import tempfile
import uuid
import json
from pathlib import Path
from typing import Optional, Dict, Any
from urllib.parse import quote

from sparc_me import Dataset
from .logger import get_logger
from .minio_client import get_minio_client
from sqlalchemy.orm import Session

logger = get_logger(__name__)

class PluginBuilder:
    """Handles building plugins using git CLI and npm"""
    
    def __init__(self, dataset_dir: str = None, db: Optional[Session] = None):
        if dataset_dir is None:
            # Use environment variable or default to ./datasets for local, /datasets for Docker
            dataset_dir = os.environ.get("DATASET_DIR", "./datasets")
        self.tmp_dir = Path("/tmp/plugin_build")
        self.tmp_dir.mkdir(parents=True, exist_ok=True)
        self.dataset_dir = Path(dataset_dir)
        self.dataset_dir.mkdir(parents=True, exist_ok=True)
        self.db = db
  
    def clone_repository(self, repo_url: str, branch: str = "main") -> Path:
        """Clone a git repository to a temporary directory"""
        try:
  
            clone_dir = Path(tempfile.gettempdir()) / f"plugin_build_{uuid.uuid4().hex[:8]}"
            clone_dir.mkdir(exist_ok=True)
            
            logger.info(f"Cloning repository: {repo_url} to {clone_dir}")
            
            subprocess.run(
                ["git", "clone", "--branch", branch, repo_url, str(clone_dir)],
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Successfully cloned repository to {clone_dir}")
            return clone_dir
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to clone repository: {e}")
            logger.error(f"stdout: {e.stdout}")
            logger.error(f"stderr: {e.stderr}")
            raise RuntimeError(f"Git clone failed: {e}")
    
    def check_npm_project(self, project_dir: Path) -> bool:
        """Check if the project directory contains npm project files"""
        package_json = project_dir / "package.json"
        return package_json.exists()
    
    
    def npm_install(self, project_dir: Path) -> Dict[str, Any]:
        """Run npm install in the project directory"""
        try:
            logger.info(f"Running npm install in {project_dir}")
            
            result = subprocess.run(
                ["npm", "install"],
                cwd=project_dir,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info("npm install completed successfully")
            return {
                "success": True,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"npm install failed: {e}")
            logger.error(f"stdout: {e.stdout}")
            logger.error(f"stderr: {e.stderr}")
            return {
                "success": False,
                "stdout": e.stdout,
                "stderr": e.stderr,
                "error": str(e)
            }

    def npm_build(self, project_dir: Path, build_cmd: str) -> Dict[str, Any]:
        """Run npm build in the project directory"""
        try:
            logger.info(f"Running npm build in {project_dir}")
            
            result = subprocess.run(
                build_cmd.split(),
                cwd=project_dir,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info("npm build completed successfully")
            return {
                "success": True,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"npm build failed: {e}")
            logger.error(f"stdout: {e.stdout}")
            logger.error(f"stderr: {e.stderr}")
            
            return {
                "success": False,
                "stdout": e.stdout,
                "stderr": e.stderr,
                "error": str(e)
            }
    
    def create_sparc_dataset(self, 
                           project_dir: Path, 
                           build_output_dir: Optional[Path] = None,
                           dataset_name: str = "plugin_build_dataset") -> Path:
        """Create a SPARC dataset with the build outputs and source code"""
        try:
            dataset_dir = self.dataset_dir / dataset_name
            dataset_dir.mkdir(exist_ok=True, parents=True)
            
            logger.info(f"Creating SPARC dataset in {dataset_dir}")
            
            dataset = Dataset()
            dataset.set_path(str(dataset_dir))
            
            dataset.create_empty_dataset(version="2.0.0")
            
            dataset_description = dataset.get_metadata(metadata_file="dataset_description")
            dataset_description.add_values(element='type', values="software")
            dataset_description.add_values(element='Title', values=f"{dataset_name} - Plugin Build")
            dataset_description.add_values(element='Keywords', values=["plugin", "build", "software"])
            dataset_description.set_values(
                element='Contributor orcid',
                values=["https://orcid.org/0000-0000-0000-0000"]  # Placeholder
            )
            
            code_dir = dataset_dir / "code"
            code_dir.mkdir(exist_ok=True)
            
            for item in project_dir.iterdir():
                if item.name not in ['node_modules', 'dist', 'build', '.git']:
                    if item.is_dir():
                        shutil.copytree(item, code_dir / item.name, dirs_exist_ok=True)
                    else:
                        shutil.copy2(item, code_dir / item.name)
            
            if build_output_dir and build_output_dir.exists():
                primary_dir = dataset_dir / "primary"
                primary_dir.mkdir(exist_ok=True)
                
                for item in build_output_dir.iterdir():
                    if item.is_dir():
                        shutil.copytree(item, primary_dir / item.name, dirs_exist_ok=True)
                    else:
                        shutil.copy2(item, primary_dir / item.name)
                
                logger.info(f"Copied build artifacts from {build_output_dir} to {primary_dir}")
            
            dataset.save(save_dir=str(dataset_dir))
            
            logger.info(f"SPARC dataset created successfully in {dataset_dir}")
            logger.info(f"- Source code in: {code_dir}")
            if build_output_dir and build_output_dir.exists():
                logger.info(f"- Built artifacts in: {dataset_dir / 'primary'}")
            
            return dataset_dir
            
        except Exception as e:
            logger.error(f"Failed to create SPARC dataset: {e}")
            raise RuntimeError(f"Dataset creation failed: {e}")
        
    def is_git_url(self, repo_url: str) -> bool:
        """Check if the repository URL is a valid git URL"""
        return repo_url.startswith("git@") or repo_url.startswith("https://") or repo_url.startswith("http://")
    
    def replace_path_in_umd_js(self, project_dir: Path, metadata: Dict[str, Any]):
        """Replace the path in file ends with .umd.js file for other files in the dist directory to the new path with the minio path"""
        other_files = []
        umd_js_file_path = None
        for file in (project_dir / "dist").iterdir():
            if file.is_file() and not file.name.endswith(".umd.js"):
                other_files.append(file)
            elif file.is_file() and file.name.endswith(".umd.js"):
                umd_js_file_path = file
            else:
                logger.warning(f"File {file} is not a file")
        
        if umd_js_file_path is None:
            raise RuntimeError("umd.js file not found")
        
        with open(umd_js_file_path, "r") as f:
            umd_js_content = f.read()

        new_path_prefix = f"http://localhost:9000/plugins/{metadata['path']}/primary/"
        umd_js_content = umd_js_content.replace(new_path_prefix, metadata["path"])
        
        with open(umd_js_file_path, "w") as f:
            f.write(umd_js_content)
    
    def build_plugin(self, 
                    plugin: Dict[str, Any]) -> Dict[str, Any]:
        """Complete plugin build process"""
        build_logs = []
        error_message = None
        repo_url = plugin.get("repository_url")
        branch = plugin.get("branch", "main")
        metadata = plugin.get("plugin_metadata", {})
        plugin_id = plugin.get("id")
        plugin_name = plugin.get("name", "unknown")
        version = plugin.get("version", "1.0.0")
        creaated_at = plugin.get("created_at", "unknown")
        author = plugin.get("author", "unknown")
        description = plugin.get("description", "No description provided")
        cloned_dir = None
        try:
            # Step 0: Check for existing metadata
            logger.info("Step 0: Checking for existing plugin metadata...")
            
            # Step 1: Clone the repository or use local path
            if self.is_git_url(repo_url):
                logger.info("Step 1: Cloning repository...")
                project_dir = self.clone_repository(repo_url, branch)
                cloned_dir = project_dir  # Mark for cleanup
                logger.info(f"Repository cloned to: {project_dir}")
            else:
                logger.info("Step 1: Using local repository...")
                # For local paths, map them to the mounted volume
                # If the path starts with ./plugins or /plugins, use it as-is
                # Otherwise, assume it's a relative path under /plugins
                if repo_url.startswith('./plugins/'):
                    # Convert relative path to absolute within container
                    plugin_name = repo_url.replace('./plugins/', '')
                    project_dir = Path(f'/plugins/{plugin_name}')
                elif repo_url.startswith('/plugins/'):
                    # Already an absolute path in the container
                    project_dir = Path(repo_url)
                else:
                    # Assume it's a plugin name/path under /plugins
                    # Remove leading ./ if present
                    clean_path = repo_url.lstrip('./')
                    project_dir = Path(f'/plugins/{clean_path}')
                
                if not project_dir.exists():
                    raise RuntimeError(f"Local path does not exist: {project_dir}")
                if not project_dir.is_dir():
                    raise RuntimeError(f"Local path is not a directory: {project_dir}")
                logger.info(f"Using local project directory: {project_dir}")
            
            # Step 2: Check if it's an npm project and extract metadata
            logger.info("Step 2: Checking for npm project...")
            if not self.check_npm_project(project_dir):
                raise RuntimeError("No package.json found - not an npm project")
            logger.info("npm project detected")
            

            # Step 3: npm install
            logger.info("Step 3: Running npm install...")
            install_result = self.npm_install(project_dir)
            if not install_result["success"]:
                raise RuntimeError(f"npm install failed: {install_result.get('error', 'Unknown error')}")
            logger.info("npm install completed successfully")
            
            # Step 4: npm build
            logger.info("Step 4: Running npm build...")
            build_result = self.npm_build(project_dir, metadata.get("build_command", "npm run build"))
            if not build_result["success"]:
                raise RuntimeError(f"npm build failed: {build_result.get('error', 'Unknown error')}")
            logger.info("npm build completed successfully")

            # Step 5: replace the path in the umd.js file (only for remote repos, not local)
            if cloned_dir:
                logger.info("Step 5: Replacing path in umd.js file...")
                self.replace_path_in_umd_js(project_dir, metadata)
                logger.info("Path in umd.js file replaced successfully")
            else:
                logger.info("Step 5: Skipping path replacement for local plugin")
            
            # Step 5: Create SPARC-ME dataset (only for remote repos)
            dataset_dir = None
            if cloned_dir:
                logger.info("Step 5: Creating SPARC-ME dataset...")
                
                # Look for common build output directories
                build_output_dir = None
                possible_build_dirs = ["dist"]
                for dir_name in possible_build_dirs:
                    potential_dir = project_dir / dir_name
                    if potential_dir.exists():
                        build_output_dir = potential_dir
                        logger.info(f"Found build output directory: {build_output_dir}")
                        break
                
                dataset_dir = self.create_sparc_dataset(project_dir, build_output_dir)
                logger.info(f"SPARC dataset created in: {dataset_dir}")
            else:
                logger.info("Step 5: Skipping SPARC dataset creation for local plugin")
            
            # Step 6: Upload dataset to MinIO or copy to public directory
            s3_path = None
            if cloned_dir:
                logger.info("Step 6: Uploading dataset to MinIO...")
                try:
                    minio_client = get_minio_client()
                    logger.info(f"Uploading dataset to MinIO: {metadata}")
                    dataset_name = f"{metadata['path']}"
                    logger.info(f"Uploading dataset to MinIO: {dataset_name}")
                    s3_path = minio_client.upload_directory(str(dataset_dir), dataset_name)
                    logger.info(f"Dataset uploaded to MinIO: {s3_path}")
                except Exception as e:
                    logger.error(f"Failed to upload to MinIO: {e}")
                    s3_path = None
            else:
                logger.info("Step 6: Copying local plugin to public directory...")
                # For local plugins, copy dist files to public directory using the path from metadata
                public_dir = Path("/app/portal/public")
                
                # Use the path from metadata as the folder name
                plugin_path_name = metadata.get('path', 'plugin')
                plugin_public_dir = public_dir / plugin_path_name
                plugin_public_dir.mkdir(parents=True, exist_ok=True)
                
                # Copy dist folder contents directly
                dist_dir = project_dir / "dist"
                if dist_dir.exists():
                    for item in dist_dir.iterdir():
                        if item.is_file():
                            shutil.copy2(item, plugin_public_dir / item.name)
                            logger.info(f"Copied {item.name} to public/{plugin_path_name}")
                        elif item.is_dir():
                            shutil.copytree(item, plugin_public_dir / item.name, dirs_exist_ok=True)
                            logger.info(f"Copied directory {item.name} to public/{plugin_path_name}")
                    logger.info(f"Local plugin files copied to {plugin_public_dir}")
            
            # Clean up temporary files (only for cloned repos, not local paths)
            logger.info("Step 7: Cleaning up temporary files...")
            if cloned_dir:
                shutil.rmtree(cloned_dir)
                logger.info("Cleaned up cloned repository")
            else:
                logger.info("Skipping cleanup for local path")
            
            # write metadata to the portal public metadata.json file which is mounted in this docker container
            # /app/portal/public
            metadata_file = Path("/app/portal/public/metadata.json")
            
            existing_metadata = {}
            if metadata_file.exists():
                logger.info(f"Reading existing metadata from {metadata_file}")
                try:
                    with open(metadata_file, "r") as f:
                        existing_metadata = json.loads(f.read())
                except (json.JSONDecodeError, Exception) as e:
                    logger.warning(f"Failed to read existing metadata, starting fresh: {e}")
                    existing_metadata = {}
            
            if "components" not in existing_metadata:
                existing_metadata["components"] = []
            
            # Determine the path based on whether it's a local plugin or remote
            if cloned_dir:
                # Remote plugin - use MinIO URL
                plugin_path = f"http://localhost:9000/plugins/{metadata['path']}/primary/my-app.umd.js"
            else:
                # Local plugin - use public directory path with metadata path
                plugin_path = f"/{metadata['path']}/my-app.umd.js"
            
            component_entry = {
                "id": plugin_id,
                "name": plugin_name,
                "path": plugin_path,
                "expose": metadata.get("expose", "MyApp"),
                "description": description,
                "version": version,
                "created_at": creaated_at,
                "author": author,
                "repository_url": repo_url,
                "is_local": not bool(cloned_dir),  # Flag to indicate if it's a local plugin
            }
            
            component_exists = False
            for i, component in enumerate(existing_metadata["components"]):
                if component.get("name") == component_entry["name"]:
                    existing_metadata["components"][i] = component_entry
                    component_exists = True
                    logger.info(f"Updated existing component: {component_entry['name']}")
                    break
            
            if not component_exists:
                existing_metadata["components"].append(component_entry)
                logger.info(f"Added new component: {component_entry['name']}")
            
            logger.info(f"Writing metadata to {metadata_file}")
            with open(metadata_file, "w") as f:
                f.write(json.dumps(existing_metadata, indent=4))
        
            logger.info("Build process completed successfully")
            
            return {
                "success": True,
                "dataset_path": str(dataset_dir) if dataset_dir else None,
                "s3_path": s3_path,
                "build_logs": "\n".join(build_logs),
                "error_message": None,
                "is_local": not bool(cloned_dir),
            }
            
        except Exception as e:
            error_message = str(e)
            logger.info(f"Build failed: {error_message}")
            logger.error(f"Build process failed: {e}")
            
            return {
                "success": False,
                "dataset_path": None,
                "build_logs": "\n".join(build_logs),
                "error_message": error_message
            }
