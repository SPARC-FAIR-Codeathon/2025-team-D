# SPARC Plugins (sparc-plugins)
An ecosystem for dynamically integrating rich, interactive features into the SPARC portal in accordance with FAIR principles.

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![GitHub issues-closed](https://img.shields.io/github/issues-closed/SPARC-FAIR-Codeathon/2025-team-D.svg)](https://GitHub.com/SPARC-FAIR-Codeathon/2025-team-D/issues?q=is%3Aissue+is%3Aclosed)
[![Issues][issues-shield]][issues-url]
[![apache License][license-shield]][license-url]
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)
<!--* [![DOI](https://zenodo.org/badge/XXXX.svg)](https://zenodo.org/badge/latestdoi/XXXXX) -->
[![PyPI version fury.io](https://badge.fury.io/py/sparc-plugins.svg)](https://pypi.python.org/pypi/sparc-plugins/)

[contributors-shield]: https://img.shields.io/github/contributors/SPARC-FAIR-Codeathon/2025-team-D.svg?style=flat-square
[contributors-url]: https://github.com/SPARC-FAIR-Codeathon/2025-team-D/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/SPARC-FAIR-Codeathon/2025-team-D.svg?style=flat-square
[stars-url]: https://github.com/SPARC-FAIR-Codeathon/2025-team-D/stargazers
[issues-shield]: https://img.shields.io/github/issues/SPARC-FAIR-Codeathon/2025-team-D.svg?style=flat-square
[issues-url]: https://github.com/SPARC-FAIR-Codeathon/2025-team-D/issues
[license-shield]: https://img.shields.io/github/license/SPARC-FAIR-Codeathon/2025-team-D.svg?style=flat-square
[license-url]: https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/master/LICENSE
[lines-of-code-shield]: https://img.shields.io/tokei/lines/github/SPARC-FAIR-Codeathon/2025-team-D
[lines-of-code-url]: #

## Table of contents
* [About](#about)
* [Introduction](#introduction)
* [The problem](#the-problem)
* [Our solution - sparc-plugins](#our-solution---sparc-plugins)
* [Benefits of sparc-plugins](#benefits-of-sparc---plugins)
* [Designed to enable FAIRness](#designed-to-enable-fairness)
* [Future developments](#future-developments)
* [Documentation](#documentation)
* [Reporting issues](#reporting-issues)
* [Contributing](#contributing)
* [Cite us](#cite-us)
* [License](#license)
* [Team](#team)
* [Acknowledgements](#acknowledgements)

## About
Welcome to the repository of **Team sparc-plugins (Team D)** from the **2025 SPARC Codeathon**. 

Learn more about the Codeathon [here](https://sparc.science/help/2025-sparc-fair-codeathon), and meet our team members in the [Team Section](#team) below.

**Note**: No work was done on this project prior to the start of the Codeathon.

## Introduction
The **[NIH Common Fund SPARC program](https://commonfund.nih.gov/sparc)**(Stimulating Peripheral Activity to Relieve Conditions) aims to advance our understanding of **peripheral nerves**—those that connect the brain and spinal cord to the rest of the body—and how their electrical signals regulate internal organ function. The ultimate goal is to develop **therapeutic devices** that modulate nerve activity to improve organ function and treat conditions such as hypertension, heart failure, and gastrointestinal disorders.

SPARC is a collaborative effort involving **60 research groups across 90 institutions and companies**, working on **over 15 organs and systems in 8 species**.

The **[SPARC Portal](http://sparc.science/)** provides a single user-facing online interface to access resources developed by the SPARC community that can be shared, cited visualised, computed, and used for virtual experimentation. Key features include:
- A **collection of well-curated datasets** in a standardised format, including anatomical and computational. These datasets can be explored under the "[Find Data](https://sparc.science/data?type=dataset)" section of the SPARC Portal, and resources are provided describing how [how to navigate a SPARC dataset](https://docs.sparc.science/docs/navigating-a-sparc-dataset) and [how a dataset is formatted](https://docs.sparc.science/docs/overview-of-sparc-dataset-format).
- **Web tools for exploring SPARC resources** that are directly integrated into the portal, including:
  - Searching datasets with pre-configured filters 
  - Pre-configured data viewers e.g. gallery, image, plot, scaffold, segmentation, simulation, and dataset viewers
  - Viewing anatomical and functional connectivity maps using pre-configured visualisation interfaces

## The problem
Despite its rich offering, the **SPARC portal currently lacks the ability for users to easily**:
- **Perform customised searches** across datasets and knowledge bases
- **Extend or modify existing functionality** such as data viewers or connectivity map visualisations
- **Add new interactive features** such as:
  - Advanced services like image segmentation using state-of-the-art tools
  - Integration of AI chatbots 
- **Access these capabilities during dataset or model development**
- **Enable non-technical users** to contribute or rapidly prototype new features

Implementing any of the above requires expert software engineers familiar with the SPARC codebase. Changes necessitate taking the portal offline, updating the codebase, performing testing and review, and redeploying—causing significant disruption to the SPARC community.

## Our solution - sparc-plugins

To address this problem, we have **developed SPARC Plugins (sparc-plugins)**—
an ecosystem for dynamically integrating rich, interactive features into the SPARC portal in accordance with FAIR principles.

## Supported Features

The **sparc-plugins** ecosystem currently supports the following capabilities:

### 🔌 Plugin Integration via the SPARC Portal
A dedicated **Plugins Page** on the SPARC Portal where users can **browse and activate plugins**. These plugins have the ability to:
- **Access SPARC datasets and knowledge bases**
- **Reuse, extend or modify existing data viewers and connectivity map visualisations**
- **Link to oSPARC computational services**
- **Integrate rich, interactive content**, such as:
  - 3D visualisations
  - AI-powered chatbots
  - Advanced image segmentation tools
- **Process data to generate new datasets**

### 🚀 Cloud-Based Plugin Development Environment
Offers an **automated and streamlined experience for plugin development, testing, and review** directly on the Plugins Page of the SPARC portal.
**Register and test new plugins** 
- Create new plugins by reusing existing plugin examples
- Plugins can be registered by referencing their code repository 
- Plugins are **automatically integrated** into the portal for testing
- Plugins can be submitted to the SPARC development team for review
- Approved plugins may also be **merged into the main SPARC codebase** for long-term support

### 🤖 Generative AI Support
Integration of **generative AI tools** to empower **non-technical users** to rapidly prototype and test new plugins directly within the SPARC portal

### 🧪 Local Plugin Development Environment
A **container-based development environment** with the following additional features:
- Includes a **local deployment of the SPARC Portal**
- Plugins can be registed by referencing source code stored locally
- Plugins can load locally stored SDS datasets without them needing to be accessible from the SPARC portal
- Enables integration of **external services** via existing APIs or custom backends to test advanced plugin features

Examples are provided to demonstrate these capabilties.

## 🎯 Benefits of sparc-plugins

The sparc-plugins ecosystem enhances the SPARC portal by aligning with the FAIR principles and enabling a more dynamic, inclusive, and scalable research environment. This will increase the impact of SPARC community developements.

### 🔍 Findable
- Enables customized search and filtering across datasets and knowledge bases.
- Improves discoverability of data and tools through plugin-driven interfaces.

### 📥 Accessible
- Allows users to interact with datasets and models through feature rich plugins.
- Supports integration of external services without requiring portal downtime.

### 🔗 Interoperable
- Facilitates seamless integration with oSPARC and other computational platforms via APIs.
- Encourages modular development using standardized interfaces and containerized environments.

### 🔄 Reusable
- Promotes reuse of SPARC portal viewers and connectivity map visualisations that can be extended and shared across the community.
- Supports automated plugin deployment and versioning for long-term sustainability.

### ⚡ Rapid Innovation
- Accelerates development and testing of new features without disrupting the main portal.
- Encourages experimentation with advanced technologies like AI, 3D visualization, and segmentation.
  
### 👥 Inclusive & Scalable
- Reduces reliance on core engineering teams, enabling broader participation and faster iteration.
- Empowers non-technical users to contribute via generative AI tools.

<!--*

## Designed to enable FAIRness
We have assessed the FAIRness of our sparc-plugins against the FAIR Principles established for research software. The details of this assemsement is available in the codeathon google drive for team 2.

Additionally, sparc-plugins has adopted exsiting dataset, knoweledge graph and workflow standards including:  
- The Common Workflow Language (CWL) - is an open standard and specification used in the field of bioinformatics and scientific computing to describe and execute tools and workflows. CWL provides a way to define and share complex computational tasks and data processing pipelines in a portable and platform-independent manner. It uses a JSON-based format to describe input data, processing steps, and output data, allowing researchers to collaborate and share reproducible analyses across different computing environments. CWL aims to enhance the ease of defining, sharing, and executing computational workflows, particularly in the context of data-intensive scientific research.
- EDAM ontology - EDAM is a comprehensive ontology of well-established, familiar concepts that are prevalent within bioscientific data analysis and data management (including computational biology, bioinformatics, and bioimage informatics). EDAM includes topics, operations, types of data and data identifiers, and data formats, relevant in data analysis and data management in life sciences.
- SPARC Dataset Structure

-->

## Future developments
- Making the sparc-plugin developement environment available directly from within oSPARC.
- Use sparc-flow to store plugins descriptions in a standard tool description language such as the common workflow language, enalbing them to be integrated into simulation workflows.
- Adopt a micro frontend architecture to take modularity provided by sparc-plugins even further—enabling each plugin or UI module to be developed, deployed, and maintained as an independent application. In addition to existing benefits, this will:
  - Allow users to use different frameworks or technologies for each plugin e.g. Vue, React, Angular.
  - Improve scalability and maintainability by isolating concerns across components.
  - Strengthen alignment with FAIR principles, especially interoperability and reusability, by promoting standardized interfaces and reusable UI modules.
- Demonstrate how SPARC plugins can be integrated into portals on other platforms being developed around the world including the Auckland Bioengineering Institute's 12 Labours DigitalTWINS platform, which is being deployed within New Zealand's  public health system.
<!--*
- Standardise the description of intputs and outputs of these models and tools
- Integrate our knowledge graph with other knowledgebases including the SPARC Anatomical Connectivity Maps and SPARC Functional Connectivity maps. This will enable workflows to be automatically assembled not only based on input/output relationships, but also based on anatomical and physiological connectivity.
- Expand tool descriptions that can be accessed e.g. Workflow Description Language, Nextflow, Snakemake etc 
- Link with Large Language Models to support more complex queries, for example to help visualise quantities of interest.
- Show how the assembled workflows can be run with [sparc-flow](https://github.com/SPARC-FAIR-Codeathon/sparc-flow) directly from the commandline or through existing cloud computing platforms from [Dockstore.org](https://dockstore.org) (currently supports running on [AnVIL](https://anvilproject.org), [Cavatica](https://www.cavatica.org), [CGC](https://www.cancergenomicscloud.org), [DNAnexus](https://www.dnanexus.com), [Galaxy](https://usegalaxy.org), [Nextflow Tower](https://seqera.io/tower), and [Terra].
- Provide API documentation.

-->

## Documentation 

### Setting up the sparc-plugins development environment

#### Pre-requisites 

- Container service, for example:
  -  Docker vX.X or greater
<!--*
- [Git](https://git-scm.com/)
- Python. Tested on:
   - 3.10
- Operating systems: 
  - Tested on:
    - Ubuntu 24.04

### PyPI

Here is the [link](https://pypi.org/project/sparc-plugins/) to our project on PyPI
```
pip install sparc-plugins
```

### From source code

#### Downloading source code
Clone the sparc-plugins repository from github, e.g.:
```
git clone https://github.com/SPARC-FAIR-Codeathon/2025-team-D.git
```

#### Installing dependencies

1. Setting up a virtual environment (optional but recommended). 
   In this step, we will create a virtual environment in a new folder named **venv**, 
   and activate the virtual environment.
   
   * Linux
   ```
   python3 -m venv venv
   source venv/bin/activate
   ```
   
   * Windows
   ```
   python3 -m venv venv
   venv\Scripts\activate
   ```
   
2. Installing dependencies via pip
    ```
    pip install -r requirements.txt
    ```

-->

### Example SPARC portal plugins

Example plugins have been created to demonstrate the capabilites of sparc-plugins. They can be accessed by navigating to the [**Plugins page**](http://130.216.217.115:3000/) of the SPARC portal on the cloud-based development environment. Select the 'Launch' button next to the desired plugin to initiate it.
 
Note: for the purposes of the Codeathon, the cloud-based development environment has been hosted on [ARDC Nectar Research Cloud](https://ardc.edu.au/services/ardc-nectar-research-cloud/).

1. Hello world ([Documentation](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-api/blob/main/README.md))

2. Reusing and extending the existing Simulation Viewer SPARC portal component ([Documentation](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-simulationvuer)

3. Using a Large Language Model (LLM) chatbot to explore SPARC portal resources including SPARC datasets and knowledge bases ([Documentation](https://github.com/SPARC-FAIR-Codeathon/2025-team-D-sparc-plugins-chatbot-client/blob/main/README.md)

4. Viewing 3D medical images in sparc datasets and using annotating them using an existing pre-trained state-of-the-art AI annotation tool ([Documentation]()

### Using sparc-plugins to create new plugins

<table>
<thead>
  <tr>
    <th> Tutorial</th>
    <th> Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial-1.md">
    1
    </a></td>
    <td> Creating and testing plugins using the Cloud-based development environment. This includes functionality for loading data from curated SDS datasets in the SPARC portal. </td>
  </tr>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial-2.md">
    2
    </a></td>
    <td> Creating and testing plugins using generative AI from the Cloud-based development environment . </td>
  </tr>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial-3.md">
    3
    </a></td>
    <td> Creating and testing plugins using the local development environment. This includes functionality for loading data from locally stored SDS datasets. </td>
  </tr> 
</tbody>
</table>
<p align="center">
</p>
<br/>

<!--*

#### Registering your plugin on the SPARC 

Once the sparc-plugins developement environment has been setup, a local instance of the por

#### Creating and testing your plugins

The tutorials below provide a guide for creation of SPARC portal plugins and how they can be dynamically integrated into the SPARC portal. These tutorials make use of the sparc-plugins development environment, which deploys a local instance of the SPARC portal as described in Section X.

1. Building and integrating plugins into the SPARC portal using the sparc-plugins development enivronment (hello world)
  
2. Reusing and extending an existing SPARC portal component as a plugin (simulationvuer)

Chatbot
- Creating plugins that can access SPARC datasets

5. Creating plugins that link to external services

3. Rapidly prototype new plugins with generative AI

#### Deploying your plugin for production

Once the plugin has been created and tested, the code repository link can be submitted via the plugins page on the SPARC portal. This will allow the SPARC team to assess the submission, including performing security checks. Once approved, the plugin will automatically be built and integrated into the SPARC portal's plugin page for others to use. **Note For the Codeathon demonstration, the assessment of the subbmission is skipped and the plugin is automatically deployed into the portal in the sparc-plugins development enviroment**




<table>
<thead>
  <tr>
    <th> Tutorial</th>
    <th> Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial_1_annotate_tools-workflow/tutorial_1_annotating_tools_models.ipynb">
    1
    </a></td>
    <td> Annotation of computational models and tools from existing SPARC datasets. </td>
  </tr>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial_2_creating_knowledge_graph/tutorial_2_creating_knowledge_graph.ipynb">
    2
    </a></td>
    <td> Building a knowledge graph for automated workflow assembly. </td>
  </tr>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial_3_adding_SPARC_tools_to_the_knowledge_graph/tutorial_3_adding_SPARC_tools_to_the_knowledge_graph.ipynb">
    3
    </a></td>
    <td> Adding tools created from existing SPARC datasets to the knowledge graph. </td>
  </tr>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial_4_adding_non-SPARC_tools_and_models_to_the_knowledge_graph/tutorial_4_adding_non-SPARC_tools_and_models_to_the_knowledge_graph.ipynb">
    4
    </a></td>
    <td> Adding non-SPARC tools and models to the knowledge graph. This includes adding an existing model from the Biomodels repository, and a tool from the WorkflowHub repository. </td>
  </tr> 
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial_5_assemble_workflow/tutorial_5_assemble_workflow.ipynb">
    5
    </a></td>
    <td> Assembling a workflow automatically using sparc-plugins and natural language processing </td>
  </tr>
  <tr>
    <td><a href="https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/tutorials/tutorial_6_run_workflow/tutorial_6_run_workflow.ipynb">
    6
    </a></td>
    <td> Running assembled workflows </td>
  </tr>   
</tbody>
</table>
<p align="center">
</p>
<br/>

-->

## Reporting issues 
To report an issue or suggest a new feature, please use the [issues page](https://github.com/SPARC-FAIR-Codeathon/2025-team-D/issues). Issue templates are provided to allow users to report bugs, and documentation or feature requests. Please check existing issues before submitting a new one.

## Contributing
Fork this repository and submit a pull request to contribute. Before doing so, please read our [Code of Conduct](https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/master/CODE_OF_CONDUCT.md) and [Contributing Guidelines](https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/master/CONTRIBUTING.md). Pull request templates are provided to help guide developers in describing their contribution, mentioning the issues related to the pull request and describing their testing environment. 

<!--*

### Project structure
* `/sparc_plugins/` - Parent directory of sparc-plugins python module.
* `/sparc_assemble/core/` - Core classes of sparc-plugins.
* `/resources/` - Resources that are used in tutorials (e.g. SDS datasets containing workflow and tool descriptions).
* `/tutorials/` - Parent directory of tutorials for using sparc-plugins.
* `/development_examples/` - Parent directory of examples that were created during the development of sparc-plugins.
* `/docs/images/` - Images used in sparc-plugins tutorials.

-->

## Cite us
If you use sparc-plugins to make new discoveries or use the source code, please cite us as follows:
Please note that the Zenodo link is a placeholder and can only be added once this repository is made public (after the codathon is completed).
```
Kekayan Nanthakumar, Xinyue Zhong, Linkun Gao, Thiranja Prasad Babarenda Gamage, Chinchien Lin (2025). sparc-plugins: v1.0.0 - An ecosystem for dynamically integrating accessible feature rich interactive tools into the SPARC portal in accordance with FAIR principles. Zenodo. https://doi.org/XXXX/zenodo.XXXX.
```

## License
sparc-plugins is fully open source and distributed under the very permissive Apache License 2.0. See [LICENSE](https://github.com/SPARC-FAIR-Codeathon/2025-team-D/blob/main/LICENSE) for more information.

## Team
* [Kekayan Nanthakumar](https://github.com/kekayan) (Developer, Writer - Documentation)
* [Xinyue Zhong](https://github.com/zxy999zhong) (Developer, Writer - Documentation)
* [Linkun Gao](https://github.com/LinkunGao) (Developer, Writer - Documentation)
* [Thiranja Prasad Babarenda Gamage](https://github.com/PrasadBabarendaGamage) (Writer - Documentation)
* [Chinchien Lin](https://github.com/LIN810116) (Lead, SysAdmin)

## Acknowledgements
We would like to thank the organizers of the 2025 SPARC Codeathon for their guidance and support during this Codeathon.
