# SPARC Plugins (sparc-plugins)
An ecosystem for dynamically integrating rich and interactive features into the SPARC portal in accordance with FAIR principles.

Making the SPARC portal more FAIR


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
* [Benefits](#benefits)
* [Designed to enable FAIRness](#designed-to-enable-fairness)
* [Documentation](#documentation)
* [Reporting issues](#reporting-issues)
* [Contributing](#contributing)
* [Future developments](#future-developments)
* [Cite us](#cite-us)
* [License](#license)
* [Team](#team)
* [Acknowledgements](#acknowledgements)

## About
This is the repository of Team sparc-plugins (Team D) of the 2025 SPARC Codeathon. Click [here](https://sparc.science/help/2025-sparc-fair-codeathon) to find out more about the SPARC Codeathon 2025. Check out the [Team Section](#team) of this page to find out more about our team members.

No work was done on this codeathon project prior to the start of the codeathon.

## Introduction
The NIH Common Fund program on **[Stimulating Peripheral Activity to Relieve Conditions (SPARC)](https://commonfund.nih.gov/sparc) focuses on understanding peripheral nerves** (nerves that connect the brain and spinal cord to the rest of the body), **how their electrical signals control internal organ function**, and **how therapeutic devices could be developed to modulate electrical activity in nerves to improve organ function**. This may provide a potentially powerful way to treat a diverse set of common conditions and diseases such hypertension, heart failure, gastrointestinal disorders, and more. 60 research groups spanning 90 institutions and companies contribute to SPARC and work across over 15 organs and systems in 8 species.

**The [SPARC Portal](http://sparc.science/) provides a single user-facing online interface to resources** that can be shared, cited, visualized, computed, and used for virtual experimentation. **key offerings** of the portal include:
- the **collection of well-curated datasets in a standardised format, including anatomical and computational models** that are being generated both SPARC-funded researchers and the international scientific community. These datasets can be found under the "[Find Data](https://sparc.science/data?type=dataset)" section of the SPARC Portal. Information regarding [how to navigate a SPARC dataset](https://docs.sparc.science/docs/navigating-a-sparc-dataset) and [how a dataset is formatted](https://docs.sparc.science/docs/overview-of-sparc-dataset-format) can be found on the SPARC Portal.
- web tools integrated direclty into the portal for exploring these resources datasets and SPARC knowledge bases, including:
  - searching data with pre-configured filters 
  - pre-configured data viewers e.g. gallery, image, plot, scaffold, segmentation, simulation, and dataset viewers
  - viewing anatomical and functional connectivity maps using pre-configured visualisation interfaces

## The problem
From the SPARC portal, there is **currenlty no ability for users to easily**:
- **perform customised searches** of sparc datasets or knowledge bases
- **customise or extend existing functionality** e.g. of data viewers and connectivity map visualisations
- **add new functionality** to interact with sparc datasets or knowledge bases, including
  - provide new services e.g. image segmentation, integrating state-of-the-art tools
- access existing or any such new capabilities during dataset or model development
- enable non-technical users to engage with developing and contributing such features
- rapidly prototype such functionality

Adding any of the above functionality requires expert software engineers familiar with the SPARC portal codebase to modify existing portal capabilities or develop the desired capabilities. The entire SPARC portal then needs to be taken offline, its codebase updated and re-deployed, which will cause significant disruptions for all users in the SPARC community.

## Our solution - sparc-plugins

To address this problem, we have **developed a SPARC Plugins (sparc-plugins)**, an ecosystem for dynamically integrating rich and interactive features into the SPARC portal in accordance with FAIR principles.

<!--*
The following features are currently supported: 
- Extracting and annotating existing tools and models from SPARC datasets to help standardise and harmonise their input and output descriptions
- Accessing existing tools and models from external repositories such as [WorkflowHub](https://workflowhub.eu) and Biomodels
- Storing information about the model and tools in a local knowledge graph defined by the standardised [EDAM ontology](http://edamontology.org) (which has been deveoped for bioscientific data analysis and data management)
- Listing all available models and tools
- Performing queries to **automatically** assemble workflows:
  - List all possible workflows (model and tool combinations) that would enable evaluation of a quantity of interest (ie an output of a model or tool)
  - Identify which SPARC datasets contain the required inputs to the workflow
  - Idenitfy which measurement, model, and tool inputs are missing
- Stores assembled workflows using the SPARC Dataset Structure to ensure they are FAIR
- Provides an easy-to-use python-based application programming interface (API) to provide the above functionality
- Provides a **natural language inteface** to make it easy for users to specify their quantity of interest
- Provides a series of tutorials to demonstrate the functionality of sparc-plugins
- Reuses existing SPARC resources and tools including [sparc-me](https://github.com/SPARC-FAIR-Codeathon/sparc-me), [sparc-flow](https://github.com/SPARC-FAIR-Codeathon/sparc-flow), and the sparc-python-client.

There is **currently no option for users to**:
- **easily find and access existing models and tools**:
  - developed by the SPARC community for processing SPARC data 
  - developed externally that could be used for processing SPARC data
- **easily assemble new workflows that reuse existing models and tools to evaluate quantities of interest**
- **easily identify which measurements (e.g. SPARC datasets) already contain the necessary inputs for these new workflows**
- **easily identify which measurements, tools, and/or models may be missing** to support efficient advancement of research efforts 
<!--*
## Vision and benefits
Our vision is to:
- **providing a knowledgebase** that:
  - describes existing measurements, models, and tools developed by the SPARC and wider communities
  - provides a map of all the inputs and outputs of the available models and tools
- **leverage the knowledgebase to automatically assemble workflow descriptions to evaluate quantities of interest**
- **run the assembled workflow(s)** or **help identify missing components** that are needed to run the assembled workflow
- **store assembled workfow descriptions in a FAIR manner** such that they can potentially be e.g. [contributed to the SPARC Portal](https://docs.sparc.science/docs/submitting-a-dataset-to-sparc) 

Providing these capabilites would: 
- significantly improve resource search functionality, especially if it is integrated with shared infrastructure such as the SPARC portal. This would allow users to find existing tools and models that may already enable evalaution of some or all of the quantities that they are interested.
- maximise finability, reusabilty, and therefore, the impact of existing SPARC resoures (providing an pathway for other communities that are building tools and models to make use of SPARC data)
- support reuse of assembled workflows by the community for generating scientific advances.
- help the community identify gaps in our knowledge and capabilites to support and help prioritise future research developments

-->
## Benefits
<!--*

## Designed to enable FAIRness
We have assessed the FAIRness of our sparc-plugins against the FAIR Principles established for research software. The details of this assemsement is available in the codeathon google drive for team 2.

Additionally, sparc-plugins has adopted exsiting dataset, knoweledge graph and workflow standards including:  
- The Common Workflow Language (CWL) - is an open standard and specification used in the field of bioinformatics and scientific computing to describe and execute tools and workflows. CWL provides a way to define and share complex computational tasks and data processing pipelines in a portable and platform-independent manner. It uses a JSON-based format to describe input data, processing steps, and output data, allowing researchers to collaborate and share reproducible analyses across different computing environments. CWL aims to enhance the ease of defining, sharing, and executing computational workflows, particularly in the context of data-intensive scientific research.
- EDAM ontology - EDAM is a comprehensive ontology of well-established, familiar concepts that are prevalent within bioscientific data analysis and data management (including computational biology, bioinformatics, and bioimage informatics). EDAM includes topics, operations, types of data and data identifiers, and data formats, relevant in data analysis and data management in life sciences.
- SPARC Dataset Structure

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

### Using sparc-plugins

#### Registering your plugin on the SPARC 

Once the sparc-plugins developement environment has been setup, a local instance of the por

#### Creating and testing your plugins

The tutorials below provide a guide for creation of SPARC portal plugins and how they can be dynamically integrated into the SPARC portal. These tutorials make use of the sparc-plugins development environment, which deploys a local instance of the SPARC portal as described in Section X.

1. Building plugins using:

   1. the sparc-plugins development enivronment
   2. Osparc
  
2. Integrating plugins into the SPARC portal

3. Creating plugins that can access SPARC datasets

4. Reusing and extending an existing SPARC portal component as a plugin

5. Creating plugins that link to external services

6. Automatically creating new plugins with generative AI

#### Deploying your plugin

Once the plugin has been created and tested, the code repository link can be submitted to via plugins page on the SPARC portal. This will allow the SPARC team to assess the submission, including performing security checks. Once approved, the plugin will automatically be built and integrated into the SPARC portal's plugin page for others to use. **Note For the Codeathon demonstration, the assessment of the subbmission is skipped and the plugin is automatically deployed into the portal in the sparc-plugins development enviroment**

### Example SPARC portal plugins

Example plugins have been created to demonstrate the capabilites of sparc-plugins. These are located in the "examples" folder of this repository. 
They also come bundled with the sparc-plugins development environment. Once you have deployed the development environment, you can navigate to the plugins page of the local instance of the SPARC portal that runs within the development environment.

1. Hello world

2. Reusing and extending the existing Simulation Viewer SPARC portal component

3. Viewing 3D medical images in sparc datasets and segmenting them using an existing pre-trained state-of-the-art AI annotation tool (NNInteractive)

4. Using a Large Language Model (LLM) chatbot to explore SPARC portal resources including SPARC datasets and knowledge bases

5. Converting SPARC scaffold models to common formats used for animation (GLTF)


<!--*

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



## Future developments
- Migrate to using microservices
<!--*
- Standardise the description of intputs and outputs of these models and tools
- Integrate our knowledge graph with other knowledgebases including the SPARC Anatomical Connectivity Maps and SPARC Functional Connectivity maps. This will enable workflows to be automatically assembled not only based on input/output relationships, but also based on anatomical and physiological connectivity.
- Expand tool descriptions that can be accessed e.g. Workflow Description Language, Nextflow, Snakemake etc 
- Link with Large Language Models to support more complex queries, for example to help visualise quantities of interest.
- Show how the assembled workflows can be run with [sparc-flow](https://github.com/SPARC-FAIR-Codeathon/sparc-flow) directly from the commandline or through existing cloud computing platforms from [Dockstore.org](https://dockstore.org) (currently supports running on [AnVIL](https://anvilproject.org), [Cavatica](https://www.cavatica.org), [CGC](https://www.cancergenomicscloud.org), [DNAnexus](https://www.dnanexus.com), [Galaxy](https://usegalaxy.org), [Nextflow Tower](https://seqera.io/tower), and [Terra].
- Provide API documentation.

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
