# Tutorial 2: Reusing and Extending an Existing SPARC Portal Component as a Plugin

## Summary
This tutorial demonstrates how to **reuse and customize an existing SPARC portal component** as a plugin using the `sparc-plugins` cloud-based development environment.  
In this example, we will **extend the SPARC Simulation Viewer** to customize its font size and dynamically integrate it into the SPARC portal.

---

## Learning Outcomes
By the end of this tutorial, you will be able to:

- Fork and modify an existing **SPARC portal component** to create a plugin  
- Customize the component’s **appearance or behavior** (e.g., font size)  
- **Register, build, and test** the customized plugin using the `sparc-plugins` cloud environment

---

## Table of Contents
1. [Introduction](#1-introduction)  
2. [Forking the Simulation Viewer Repository](#2-forking-the-simulation-viewer-repository)  
3. [Specifying a Dataset](#3-specifying-a-dataset)  
4. [Customizing the Viewer Font Size](#4-customizing-the-viewer-font-size)  
5. [Registering and Testing the Plugin](#5-registering-and-testing-the-plugin)  
6. [Next Steps](#6-next-steps)

---

## 1. Introduction

In this tutorial, we will **reuse and modify the SPARC Simulation Viewer** to create a plugin.  

- Details about the **Simulation Viewer implementation** can be found in its [GitHub repository README](https://github.com/ABI-Software/simulationvuer).  
- User documentation for the viewer is available on the [SPARC portal](https://docs.sparc.science/docs/simulation-viewer-overview).

The Simulation Viewer can visualize **CellML-based simulation datasets** using **o²S²PARC's OpenCOR plugin**.

For this tutorial:  
- We will visualize results from [CellML-based simulation dataset 135](https://sparc.science/datasets/135?type=simulation), which is also referenced in the [Simulation Viewer README](https://github.com/ABI-Software/simulationvuer).  
- We will **customize the font size** of the viewer to demonstrate how an existing SPARC portal component can be extended as a plugin.  

> **Prerequisite:**  
> - A GitHub account to fork the Simulation Viewer repository  
> - Completion of [Tutorial 1](tutorial-1.md) is recommended

---

## 2. Forking the Simulation Viewer Repository

1. Go to the [Simulation Viewer GitHub repository](https://github.com/ABI-Software/simulationvuer)  
2. Click **Fork** to create your own copy of the repository  
3. Clone your fork locally to modify the source code

---

## 3. Specifying a Dataset

Modify your forked repository to **specify the dataset to visualize**, for example:  

- [Dataset 135](https://sparc.science/datasets/135?type=simulation)  

This ensures that your plugin automatically loads the desired dataset when launched.

---

## 4. Customizing the Viewer Font Size

Update the viewer’s **CSS or component styling** to **increase the font size** for improved readability.  

Commit and push your changes to your forked repository.

> **Note:**  
> The resulting plugin for these modifications corresponds to **Example 2** provided by the `sparc-plugins` team.  
> Its source code is available here: [2025-team-D-sparc-plugins-simulationvuer](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-simulationvuer)

---

## 5. Registering and Testing the Plugin

Follow **Steps 2 to 5 in [Tutorial 1](tutorial-1.md)** to:

1. Register your customized viewer as a plugin in the **`sparc-plugins` cloud-based development environment**  
2. **Build and test** the plugin directly in the SPARC portal  
3. **Rebuild** the plugin via the ⋮ (three vertical dots) menu if additional changes are made

---

## 6. Next Steps

Congratulations!  
You have successfully:

- Reused an **existing SPARC portal component** as a plugin  
- Customized its functionality and appearance  
- Integrated it dynamically into the SPARC portal

---

[← Back to Tutorials List](../README.md#tutorials-for-creating-new-plugins)
