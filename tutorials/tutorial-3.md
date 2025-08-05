# Tutorial 3: Creating plugins that link to external services

## Summary

This tutorial walks you through the process of creating and deploying a SPARC Portal plugin that connects to an external API server. Whether you're using an existing backend or hosting your own, you'll learn how to integrate everything smoothly into the SPARC ecosystem.

---

## Learning Outcomes
By the end of this tutorial, you will be able to:

- Learn how to set up a Vue-based plugin in the SPARC Portal that connects to an external API server.  
- Deploy the external API server locally or host it in the cloud, depending on your setup.

---

## Table of Contents
1. [Introduction](#1-introduction)  
2. [Easy mode: deploy plugin to connect existing server api](#2-easy-mode)  
3. [Advance mode: deploy plugin to connect own server api](#3-advance-mode)
4. [Results](#4-results)  

---

## 1. Introduction

We currently have both the Vue-based frontend and the backend of our chatbot plugin on GitHub repos — [chatbot client](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-client) and [chatbot API server](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-api). Now, we want to host this plugin in the SPARC Portal, and we have two options for deploying the plugin: easy mode and advance mode.

---

## 2. Easy mode

**deploy plugin to connect existing server api**

Find the plugin fontend Github code - [chatbot client](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-client)

Then Go to the [SPARC Portal](http://130.216.217.115:3000/)

Then follow the [Tutorial 1: Registering your plugin on the cloud-based development environment](./tutorial-1.md#2-registering-your-plugin-on-the-sparc-plugins-cloud-based-development-environment) sections to host the plugin. 

---

## 3. Advance mode

**deploy plugin to connect own server api**

For advance user's, you may want to host the server api locally or somewhere.

**Requirements:**
- docker
- python 3.10+

**Steps**

- Steps for deploy plugin api server:
    - Step 1: clone the [chatbot API server](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-api) to your server or PC.
    - Step 2: if you meet environment issue, please ask administrator for the `.env` file.
    - Step 3: open the `chatbot API server` folder in your terminal, and run below commands:

        ```bash
        docker compose up -d
        ```
    - Copy your server api endpoint url to somewhere.
- Steps for deploy plugin frontend:
    - Step 1: clone the [chatbot client](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-client) to your server or PC.
    - Step 2: find and copy the `api server endpoint url`, then go to the `chatbot client` folder `src/components/ChatInterface.vue line 200`, replace the server url to your one.
    - Step 3: you can do wantever developments for this client. 
    - Step 4: after you modify it, you can commit and push to your Github repo.
    - Step 5: copy your repo url and then Go to the [SPARC Portal](http://130.216.217.115:3000/)
    - then follow the [Tutorial 1: Registering your plugin on the cloud-based development environment](./tutorial-1.md#2-registering-your-plugin-on-the-sparc-plugins-cloud-based-development-environment) sections to host the plugin in SPARC Portal. 

---

## 4. Results

Once you deploy the plugin successfully in SPARC portal, you will see like these:

---

[← Back to Tutorials List](../README.md#tutorials-for-creating-new-plugins)



