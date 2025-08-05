# Tutorial 1: Creating and Testing Plugins Using the `sparc-plugins` Cloud-Based Development Environment

## Summary
This tutorial demonstrates how to create, register, test, and manage plugins in the SPARC portal.  

## Learning Outcomes
By the end of this tutorial, you will be able to:

- Use a **Vue 3 Single Page Application (SPA)** to create a SPARC plugin.  
- Register the plugin in the **SPARC cloud-based development environment**.  
- **Build, test, and rebuild** your plugin directly in the SPARC portal.  
- Optionally **delete** your plugin from the portal.  
- **Submit** your plugin for SPARC team review and approval.

## Table of Contents
1. [Creating a plugin](#1-creating-a-plugin)  
2. [Registering your plugin on the cloud-based development environment](#2-registering-your-plugin-on-the-sparc-plugins-cloud-based-development-environment)  
3. [Testing your plugin](#3-testing-your-plugin)  
4. [Deleting your plugin (optional)](#4-deleting-your-plugin-optional)  
5. [Submitting the plugin for review](#5-submitting-the-plugin-for-review-to-the-sparc-team)

---

## 1. Creating a Plugin

> **Note:** Currently, only **Vue 3 web applications** are supported for plugin development.  
> Future integration of **Micro Frontends** into the SPARC portal will allow plugins to be created using other frameworks, such as **React** and **Angular**.

Start by creating a new **Vue 3 Single Page Application (SPA)** project **without routing** and adding it to a **code repository**.  
This project serves as the foundation for deploying the plugin within the Vue 3 framework.

- A [plugin template](https://github.com/SPARC-FAIR-Codeathon/2025-team-D/tree/main/resource/plugin-template#plugin-template) is available in the **`sparc-plugins`** repository to help you get started.  
- Several example plugins are also available. You can reuse or adapt these examples to create new plugins:
    - [2025-team-D-sparc-plugins-hello-world](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-hello-world)
    - [2025-team-D-sparc-plugins-simulationvuer](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-simulationvuer)
    - [2025-team-D-sparc-plugins-simulationvuer-customised-style](https://github.com/Copper3D-brids/plugin-SimulationVuer)
    - [2025-team-D-sparc-plugins-chatbot-api](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-api)
    - [2025-team-D-sparc-plugins-chatbot-client](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-client)
    - [2025-team-D-sparc-plugins-medical-image-annotation](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-medical-image-annotation)

For this tutorial, we will assume that the user has already created the source code for the plugin, and we will assume this corresponds to the [source code of the Hello World example](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-hello-world/) for the subsequent steps.

Once the plugin’s source code is in a repository, the `sparc-plugins` **cloud-based development environment** can automatically build and incorporate the plugin into the [SPARC portal plugins page](http://130.216.217.115:3000/register-plugins).

---

## 2. Registering Your Plugin on the `sparc-plugins` Cloud-Based Development Environment

1. Go to the [SPARC portal plugins page](http://130.216.217.115:3000/register-plugins).
<img width="1263" height="892" alt="Screenshot from 2025-08-05 12-47-17" src="https://github.com/user-attachments/assets/ccba3e28-e083-4e5e-9e50-afc4fb774226" />


2. Select **Register Plugin** to enter the details of your plugin, including the **repository URL**.
<img width="1259" height="892" alt="Screenshot from 2025-08-05 12-43-19" src="https://github.com/user-attachments/assets/7f2a450a-e4a0-4a84-8df4-2dc55814f5e5" />


3. Provide the **Build Command**, which will be used to build the web app plugin.  
4. Check the **review agreement** checkbox to allow your plugin to be reviewed prior to publishing.  
5. Select **Submit Plugin** to register your plugin.

After registration, select **Build and Test Plugin**.
<img width="1259" height="892" alt="Screenshot from 2025-08-05 12-43-27" src="https://github.com/user-attachments/assets/108ac2cd-b856-48c4-ae32-ddd72bc5046e" />

This will automatically build the plugin and dynamically link it into the SPARC portal.

---

## 3. Testing Your Plugin

1. Select **Launch** on your plugin to activate it and test its functionality.
<img width="1263" height="892" alt="Screenshot from 2025-08-05 12-44-42" src="https://github.com/user-attachments/assets/4ef07ce9-96ec-4159-b46d-3c44caa32d32" />

3. To rebuild the plugin (for example, after making changes to the source code repository), select the **three vertical dots (⋮)** options menu on your plugin and choose **Rebuild**.
<img width="1263" height="892" alt="Screenshot from 2025-08-05 12-46-00" src="https://github.com/user-attachments/assets/e5662fcf-9841-4c1d-9a92-74347540478c" />


---

## 4. Deleting Your Plugin (Optional)

1. Select the **three vertical dots (⋮)** options menu on your plugin.  
2. Choose **Delete** to remove your plugin from the portal.

---

## 5. Submitting the Plugin for Review to the SPARC Team

1. Once you are satisfied with your plugin, select the **three vertical dots (⋮)** options menu on your plugin.  
2. Choose **Submit for Approval** to send it to the SPARC team for review.

[← Back to Tutorials List](../README.md#tutorials-for-creating-new-plugins)






