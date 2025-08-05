# Tutorial 5: Creating and testing plugins using the local development environment

## Summary

This tutorial demonstrates how to create and test plugins using the local development environment. This includes functionality for loading data from locally stored SDS datasets.

Here, we will be using the example of [AI medical image annotation plugin](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-medical-image-annotation). This has a vue based frontend which will be built as an SPARC plugin, and a backend which will be used to load data from locally stored SDS datasets, and run AI pretrained model to obtain segmentation mask. 

## Learning Outcomes
By the end of this tutorial, you will be able to:

- Set up a local development environment for SPARC plugins
- Be able to create a new plugin and test it using the local development environment
- know how to load data from locally stored SDS datasets from a given example


## Table of Contents
1. [Prerequisites](#1-prerequisites)  
2. [Setting up a local development environment](#2-setting-up-a-local-development-environment)
3. [Setting up the plugin's backend server](#3-setting-up-the-plugin's-backend-server)  
4. [Registering a local plugin](#4-registering-a-local-plugin)
5. [Run the backend locally](#5-run-the-backend-locally)
6. [Loading data from a locally stored SDS dataset](#5-loading-data-from-a-locally-stored-sds-dataset)
7. [Running simulation](#6-running-simulation)



## 1. Prerequisites

- Docker
- Docker compose
- Git
- Plugin AI Annotator (for more details about this plugin [please have a look at here](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-medical-image-annotation?tab=readme-ov-file#2025-team-d-sparc-plugins-medical-image-annotation))

## 2. Setting up a local development environment

1. Clone the GitHub repository:
```
git clone https://github.com/SPARC-FAIR-Codeathon/2025-team-D.git
```

2. navigate into the repository
```
cd 2025-team-D
```

3. Setting up environment variables

   1. please ask Team D or the SPARC Mentors for the .env file.
   2. put the given .env file in the root folder
   4. launch the local development environment
   ```
   sudo docker compose up
   ```
   
4. After a few minutes, you should be able to access the local instance of the portal at:  
   [http://localhost:3000](http://localhost:3000)

## 3. Setting up the plugin's backend server

1. Navigate to ./plugins
3. Get the example plugin and save it in the plugins folder:
4. 
```
git clone https://github.com/Copper3D-brids/plugin-ai-annotator-frontend.git
```

## 4. Loading data from a locally stored SDS dataset

   1. download an example SPARC dataset from [Google drive](https://drive.google.com/drive/folders/1tjeizlQP-hDp_0ODlhZhL1w9M1fD_K0E), Here are two dataset `duck` is a duck SPARC dataset, `sparc` is SPARC exsiting rat dataset
   2. Git clone the example plugin server [Plugin AI annotator backend](https://github.com/Copper3D-brids/plugin-ai-annotator-backend) to your local folder.
   3. Once you download the dataset, unzip it, then copy all contents(folders and files) and paste into `backend/data/duck` folder.

## 5. Run the backend locally
   1. Follow by these commands:
      ```sh
      cd plugin-ai-annotator-backend
      docker compose up -d
      ```
   2. Once the backend running, copy the endpoint url, it shuold be `http://localhost:8082`

## 5. Registering a local plugin

1. Copy the server endpoint url and paste into frontend https.ts file. [More details please see here](https://github.com/Copper3D-brids/plugin-ai-annotator-frontend?tab=readme-ov-file#deploy-locally).
2. Back to the portal plugin page at [http://localhost:3000/register-plugins](http://localhost:3000/register-plugins)
3. click on "Register a new plugin"
4. Fill in the form and use local path for Source URL. See below:
   - Name: `AI Annotator - YOUR NAME`
   - Source URL: `./plugins/plugin-ai-annotator-frontend`


## 6. Running simulation
Now you can interact with the AI annotation plugin which accesses a SDS dataset from a local bankend server.
<img width="1155" height="862" alt="image" src="https://github.com/user-attachments/assets/48f13b46-c22b-4ee9-a390-8d9a91eb7805" />


[← Back to Tutorials List](../README.md#tutorials-for-creating-new-plugins)







