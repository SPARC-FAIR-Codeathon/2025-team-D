<template>
  <div class="resources-search-results">
    <div class="no-results" v-if="services.length === 0">
      <el-table :show-header="false" empty-text="No Results">
        <el-table-column />
      </el-table>
    </div>
    <div
      v-else
      v-for="service in services"
      :key="service.id"
      class="resources-search-results__items"
    >
      <div class="resources-search-results__items--image">
        <img v-show="service.thumbnail" :src="service.thumbnail" />
      </div>
      <div class="resources-search-results__items--content">
        <h2><span v-html="highlightMatches(service.title, $route.query.search)"/></h2>
        <p
          class="resources-search-results__items--content-description"
          v-html="highlightMatches(parseMarkdown(service.description), $route.query.search)"
        />
      </div>
      <div  class="resources-search-results__items--button">
        <sparc-tooltip placement="top-center">
          <template #item>
            <div>
              <a :href="service['view_url']" target="_blank">
                <el-button class="secondary">
                  <div class="open-osparc-btn-content">
                    Open in o<sup>2</sup>S<sup>2</sup>PARC <svgo-icon-open/>
                  </div>
                </el-button>
              </a>
            </div>
          </template>
          <template #data>
            <div class="osparc-service-btn-tooltip">
              Instantiate this service in o<sup>2</sup>S<sup>2</sup>PARC. Login is required, 
              <a href="/resources/4LkLiH5s4FV0LVJd3htsvH#user-accounts" target="_blank">
                <u>here</u>
              </a>
              you can find more information on how to get an account.
            </div>
          </template>
        </sparc-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import marked from '@/mixins/marked/index'
import { highlightMatches } from '@/utils/utils'

export default {
  name: 'ServicesSearchResults',

  mixins: [marked],

  props: {
    services: {
      type: Array,
      default: () => []
    }
  },

  methods: {
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
    align-items: flex-start;
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
      flex: 1;
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
      margin-right: 1rem;
    }
    &--button {
      align-self: center;
      sup, sub {
        vertical-align: baseline;
        position: relative;
        top: -0.4em;
      }
      sub {
        top: 0.4em;
      }
      svg {
        margin-left: .3em;
      }
      .open-osparc-btn-content {
        display: flex;
        align-items: center;
      }
    }
  }
}
.osparc-service-btn-tooltip {
  sup, sub {
    vertical-align: baseline;
    position: relative;
    top: -0.4em;
  }
  sub {
    top: 0.4em;
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
</style>
