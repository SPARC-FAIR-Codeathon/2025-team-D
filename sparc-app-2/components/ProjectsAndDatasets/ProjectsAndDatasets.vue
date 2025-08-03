<template>
  <div class="section-container container py-24">
    <div v-if="isProject" class="heading2 mb-24">Projects &amp; Datasets</div>
    <div v-else class="heading2 mb-32">Resources &amp; Datasets</div>
    <div class="row">
      <div class="col p-16">
        <template v-if="isProject">
          <div class="body2 mb-16">Here is a project you might be interested in:</div>
          <projects-and-datasets-card 
            v-if="projectOrResource?.fields"
            :title="projectOrResource.fields.title" 
            :description="projectOrResource.fields.shortDescription" 
            :banner="projectOrResource.fields.banner" 
            :link='projectLink'
            button-text="View Project"
          />
          <nuxt-link class="view-all-link body2 mt-16" to="/data?type=projects">
            View All Projects
          </nuxt-link>
        </template>
        <!--If not a project then we assume it is a tool/resource since it must be one or the other-->
        <template v-else>
          <div class="body2 mb-16">Here is a resource you might be interested in:</div>
          <projects-and-datasets-card
            v-if="projectOrResource?.fields"
            :title="projectOrResource.fields.name" 
            :description="projectOrResource.fields.description" 
            :banner="projectOrResource.fields.logo.fields.file.url" 
            :link='resourceLink'
            button-text="View Resource"
          />
          <nuxt-link class="view-all-link body2 mt-16" to="/tools-and-resources/tools">
            View All Tools & Resources
          </nuxt-link>
        </template>
      </div>
      <div v-if="dataset?.title" class="col p-16">
        <div class="body2 mb-16">{{ datasetSectionTitle }}</div>
        <projects-and-datasets-card 
          :title="dataset.title" 
          :description="dataset.description" 
          :banner="dataset.banner" 
          :link="datasetLink"
          button-text="View Dataset"
        />
        <nuxt-link class="view-all-link body2 mt-16" to="/data?type=dataset">
          View All Datasets
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectsAndDatasetsCard from '@/components/ProjectsAndDatasets/ProjectsAndDatasetsCard/ProjectsAndDatasetsCard.vue'
import { pathOr } from 'ramda'

export default {
  name: 'ProjectsAndDatasets',
  components: {
    ProjectsAndDatasetsCard
  },
  props: {
    projectOrResource: {
      type: Object,
      default: () => {}
    },
    dataset: {
      type: Object,
      default: () => {}
    },
    datasetSectionTitle: {
      type: String,
      default: 'Here is a dataset you might be interested in: '
    }
  },
  computed: {
    isProject() {
      return pathOr('', ["sys","contentType","sys","id"], this.projectOrResource) == this.$config.public.ctf_project_id
    },
    datasetLink() {
      return {
        isInternal: true,
        path: `datasets/${this.dataset.id}`
      }
    },
    projectLink() {
      return {
        isInternal: true,
        path: "projects/" + pathOr("", ["sys","id"], this.projectOrResource)
      }
    },
    resourceLink() {
      if (this.projectOrResource?.fields.requiresDetailsPage) {
        return {
          isInternal: true,
          path: "resources/" + pathOr("", ["sys","id"], this.projectOrResource)
        }
      } else {
        return {
          isInternal: false,
          path: pathOr("", ["fields","url"], this.projectOrResource)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.section-container {
  text-align: center;
}
.col {
  display: flex;
  width: 46%;
  height: auto;
  background-color: $darkBlue;
  flex-direction: column;
  @media screen and (max-width: 767px) {
    width: 95% !important;
    margin-bottom: 1rem;
  }
}
.row {
  display: flex;
  text-align: left;
  justify-content: space-between;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}
.view-all-link {
  text-decoration: underline;
}
</style>
