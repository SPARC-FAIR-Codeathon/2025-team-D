<template>
  <div class="resources-search-results">
    <div class="no-results" v-if="tableData.length === 0">
      <el-table :show-header="false" empty-text="No Results">
        <el-table-column />
      </el-table>
    </div>
    <div
      v-else
      v-for="data in tableData"
      :key="data.sys.id"
      class="resources-search-results__items"
    >
      <div class="resources-search-results__items--image">
        <router-link
          v-if="data.fields.requiresDetailsPage"
          :to="{
            name: 'resources-resourceId',
            params: { resourceId: data.sys.id }
          }"
        >
          <img v-show="data.fields.logo" :src="getBannerImage(data)" />
        </router-link>
        <a v-else :href="data.fields.url" target="blank">
          <img v-show="data.fields.logo" :src="getBannerImage(data)" />
        </a>
      </div>
      <div class="resources-search-results__items--content">
        <router-link
          v-if="data.fields.requiresDetailsPage"
          :to="{
            name: 'resources-resourceId',
            params: { resourceId: data.sys.id }
          }"
        >
          <h2 v-html="highlightMatches(data.fields.name, $route.query.search)"/>
        </router-link>
        <a v-else :href="data.fields.url" target="blank">
          <h2><span v-html="highlightMatches(data.fields.name, $route.query.search)"/><svgo-icon-open class="icon-open"/></h2>
        </a>
        <div class="mb-8">
          <span v-if="data.fields.developedBySparc" class="resource-category">
            SPARC Program
          </span>
          <span v-if="data.fields.codeathon" class="resource-category">
            Codeathon
          </span>
        </div>
        <template v-if="data.fields.contactEmail">
          <h3 class="metadata-title">
            Support Contact
          </h3>
          <p>
            <span v-if="data.fields.owner" v-html="highlightMatches(data.fields.owner, $route.query.search)"/>
            <span v-if="data.fields.owner && data.fields.contactEmail"> · </span>
            <a
              v-if="data.fields.contactEmail"
              :href="`mailto:${data.fields.contactEmail}`"
            >
              {{ data.fields.contactEmail }}
            </a>
          </p>
        </template>
        <!-- eslint-disable vue/no-v-html -->
        <p
          class="resources-search-results__items--content-description"
          v-html="highlightMatches(parseMarkdown(data.fields.description), $route.query.search)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import marked from '@/mixins/marked/index'

import FormatDate from '@/mixins/format-date'
import { highlightMatches } from '@/utils/utils'
export default {
  name: 'ResourceSearchResults',

  mixins: [FormatDate, marked],
  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    /**
     * Gets the banner image for the resource
     * @returns {String}
     */
    getBannerImage: function(data) {
      return pathOr('', ['fields', 'logo', 'fields', 'file', 'url'], data)
    },
    highlightMatches
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.resources-search-results {
  &__items {
    display: flex;
    flex-direction: row;
    padding: 1.25em 0;
    @media screen and (max-width: 768px) {
      display: block;
    }
    h2 {
      font-size: 1em;
      color: $purple;
      margin-bottom: 0.375rem;
      line-height: 22px;
      font-weight: 500;
    }

    &--content {
      a {
        text-decoration: none;
      }
    }

    &--image {
      display: flex;
      margin-right: 1rem;
      @media (min-width: 48em) {
        flex-shrink: 0;
        width: 128px;
      }
      img {
        margin: auto;
        width: 100%;
        height: auto;
      }
    }
    &--content-date {
      font-size: 1em;
      font-style: italic;
      line-height: 18px;
      font-weight: normal;
      color: $grey;
    }
    &--content-description {
      font-size: 1em;
      font-weight: normal;
      line-height: 22px;
      font-weight: normal;
      color: $grey;
    }
  }
}
.metadata-title {
  color: $grey;
  font-size: 1em;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
}

.resource-category {
  background: $purple;
  border-radius: 15px;
  color: #fff;
  font-size: 0.875rem;
  top: 10px;
  padding: .2rem 0.6rem;
  margin-right: .25rem;
  right: 14px;
  width: fit-content;
  margin-bottom: 10px;
}
.icon-open {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
