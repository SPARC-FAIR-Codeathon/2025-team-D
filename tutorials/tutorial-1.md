# Tutorial 1: Creating and testing plugins using the sparc-plugins cloud-based development environment

## Summary
This includes functionality for loading data from curated SDS datasets in the SPARC portal.

## Table of contents
1. [Creating a plugin](#creating a plugin)
2. [The problem](#the-problem)

## 1. Creating a plugin

> **Note:** Currently, only **Vue 3 web applications** are supported for plugin development.  
> Future integration of **Micro Frontends** into the SPARC portal will allow plugins to be created using other frameworks, such as **React** and **Angular**.

Start by creating a new **Vue 3 Single Page Application (SPA)** project **without routing** and adding it to a **code repository**.  
This project serves as the foundation for deploying the plugin within the Vue 3 framework.

- A [plugin template](https://github.com/PrasadBabarendaGamage/2025-team-D/blob/main/resource/plugin-template/README.md) is available in the **`sparc-plugins`** repository to help you get started.  
- Several [example plugins](https://github.com/PrasadBabarendaGamage/2025-team-D/blob/main/README.md#running-example-plugins) are also available.  
  You can reuse or adapt these examples to create new plugins

For the purposes of this tutorial, we will assume that the user has already created the source code for their plugins, and we will use the [Hello world example repository](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-hello-world/blob/main/README.md) for subseequent steps of this tutorial.

Once the plugins source code has been placed in a repository, the cloud-based development environment can be used to automatically build and incorporate the plugin into the [plugins page](http://130.216.217.115:3000/register-plugins) on the SPARC portal.

## 2. Registering your plugin on the sparc-plugins cloud-based development environment

Select "Register Plugin" on the [plugins page](http://130.216.217.115:3000/register-plugins) of the SPARC portal to enter the details of your plugin, including the location of the repository which contains the source code. The Build Command field indicates the command that will be used to build the web app plugin. After, the checkbox for agreeing to have your plugin reviewed prior to it being published in the portal, you will be able to select "Submit plugin"

Once registration is completed, select the "Build and Test Plugin" button. This will automatically build and dynamically link the plugin into the SPARC portal.

## 3. Testing your plugin

Select "Launch" on your plugin to activate it and test its functionality. You can trigger a rebuild of the plugin e.g. if you make modifications to your source code repository during testing by selecting te three vertical dots (⋮) options menu on your plugin and selecting "Rebuild".

## 4 Deleting your plugin (optional)

You can select the three vertical dots (⋮) options menu on your plugin and select delete to delete you app.

## 5. Submitting the plugin for review to the SPARC team

Once you are satisfied with your plugin, you can submit it for review to the SPARC team by select the three vertical dots (⋮) options menu on your plugin and select "Submit to approval"
botton.



<!--*


1. Building and integrating plugins into the SPARC portal using the sparc-plugins development enivronment (hello world)
  
2. Reusing and extending an existing SPARC portal component as a plugin (simulationvuer)

Chatbot
- Creating plugins that can access SPARC datasets

5. Creating plugins that link to external services

3. Rapidly prototype new plugins with generative AI

#### Deploying your plugin for production

Once the plugin has been created and tested, the code repository link can be submitted via the plugins page on the SPARC portal. This will allow the SPARC team to assess the submission, including performing security checks. Once approved, the plugin will automatically be built and integrated into the SPARC portal's plugin page for others to use. **Note For the Codeathon demonstration, the assessment of the subbmission is skipped and the plugin is automatically deployed into the portal in the sparc-plugins development enviroment**

-->

