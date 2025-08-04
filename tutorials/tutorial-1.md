# Tutorial 1: Creating and Testing Plugins Using the `sparc-plugins` Cloud-Based Development Environment

## Summary
This tutorial demonstrates how to create, register, test, and manage plugins in the SPARC portal.  

## Learning Outcomes
By the end of this tutorial, you will be able to:

- Create a **Vue 3 Single Page Application (SPA)** to use as a SPARC plugin.  
- Register the plugin in the **SPARC cloud-based development environment**.  
- **Build, test, and rebuild** your plugin directly in the portal.  
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

- A [plugin template](https://github.com/PrasadBabarendaGamage/2025-team-D/blob/main/resource/plugin-template/README.md) is available in the **`sparc-plugins`** repository to help you get started.  
- Several [example plugins](https://github.com/PrasadBabarendaGamage/2025-team-D/blob/main/README.md#running-example-plugins) are also available.  
  You can reuse or adapt these examples to create new plugins.

For this tutorial, we will assume that the user has already created the source code for the plugin, and we will assume this corresponds to the [source code of the Hello World example](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-hello-world/) for the subsequent steps.

Once the plugin’s source code is in a repository, the `sparc-plugins` **cloud-based development environment** can automatically build and incorporate the plugin into the [SPARC portal plugins page](http://130.216.217.115:3000/register-plugins).

---

## 2. Registering Your Plugin on the `sparc-plugins` Cloud-Based Development Environment

1. Go to the [SPARC portal plugins page](http://130.216.217.115:3000/register-plugins).
   INSERT SCREENSHOT
3. Select **Register Plugin** to enter the details of your plugin, including the **repository URL**.
   INSERT SCREENSHOT OF FILLED IN FORM
5. Provide the **Build Command**, which will be used to build the web app plugin.  
6. Check the **review agreement** checkbox to allow your plugin to be reviewed prior to publishing.  
7. Select **Submit Plugin** to register your plugin.

After registration, select **Build and Test Plugin**.
INSERT SCREENSHOT
This will automatically build the plugin and dynamically link it into the SPARC portal.

---

## 3. Testing Your Plugin

1. Select **Launch** on your plugin to activate it and test its functionality.
   INSERT SCREENSHOT 
3. To rebuild the plugin (for example, after making changes to the source code repository), select the **three vertical dots (⋮)** options menu on your plugin and choose **Rebuild**.
   INSERT SCREENSHOT WITH THE MENUE SHOWING WHEN YOU CLICK THE THREE DOTS

---

## 4. Deleting Your Plugin (Optional)

1. Select the **three vertical dots (⋮)** options menu on your plugin.  
2. Choose **Delete** to remove your plugin from the portal.

---

## 5. Submitting the Plugin for Review to the SPARC Team

1. Once you are satisfied with your plugin, select the **three vertical dots (⋮)** options menu on your plugin.  
2. Choose **Submit for Approval** to send it to the SPARC team for review.

[← Back to Tutorials List](../README.md#tutorials-for-creating-new-plugins)
