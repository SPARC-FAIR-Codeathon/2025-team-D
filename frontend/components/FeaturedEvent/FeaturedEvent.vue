<template>
  <sparc-card>
    <template #image>
      <div class="sparc-card__image-container">
        <a v-if="event.fields.requiresADetailsPage" :href="href(event)">
          <img
            class="sparc-card__image"
            :src="imageSrc"
            :alt="imageAlt" 
          />
        </a>
        <template v-else>
          <div v-if="event.fields.url">
            <a :href="event.fields.url" :target="isInternalLink(event.fields.url) ? '_self' : '_blank'">
              <img
                class="sparc-card__image"
                :src="imageSrc"
                :alt="imageAlt" 
              />
            </a>
          </div>
          <div
            v-else
          >
          <img
              class="sparc-card__image"
              :src="imageSrc"
              :alt="imageAlt" 
            />
          </div>
        </template>
      </div>
    </template>

    <div>
      <h3>
        <nuxt-link
          v-if="event.fields.requiresADetailsPage"
          :to="{
            name: 'news-and-events-events-id',
            params: { id: event.sys.id }
          }"
        >
          {{ event.fields.title }}
        </nuxt-link>
        <div v-else>
          <a v-if="event.fields.url" :href="event.fields.url" target="_blank">
            {{ event.fields.title }}
          </a>
          <div v-else>
            {{ event.fields.title }}
          </div>
        </div>
      </h3>
      <div class="sparc-card__detail">
        <svgo-icon-calendar class="mr-4" height="16" width="16" />
        <span>{{ eventDate }}</span>
        <template v-if="event.fields.location">
          <svgo-icon-map
            class="ml-32 mr-4"
            height="16"
            width="16"
          />
          <span>{{ event.fields.location }}</span>
        </template>
      </div>
      <!-- eslint-disable vue/no-v-html -->
      <!-- marked will sanitize the HTML injected -->
      <div v-html="parseMarkdown(event.fields.summary)" />
    </div>
    <nuxt-link
      v-if="event.fields.requiresADetailsPage"
      :to="{
        name: 'news-and-events-events-id',
        params: { id: event.sys.id }
      }"
      class="btn-permalink"
    >
      <el-button>
        Learn More
      </el-button>
    </nuxt-link>

    <a v-else :href="event.fields.url" target="_blank" class="btn-permalink">
      <el-button>
        Learn More
      </el-button>
    </a>
  </sparc-card>
</template>

<script>
import { pathOr } from 'ramda'
import SparcCard from '@/components/SparcCard/SparcCard.vue'
import FormatDate from '@/mixins/format-date'
import MarkedMixin from '@/mixins/marked'
import { isInternalLink} from '@/mixins/marked'

export default {
  name: 'FeaturedEvent',

  components: {
    SparcCard
  },

  mixins: [MarkedMixin, FormatDate],

  props: {
    event: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  methods: {
    isInternalLink,
    href: function(event) {
      const eventId = pathOr("", ["sys","id"], event)
      return `news-and-events/events/${eventId}`
    },
  },

  computed: {
    /**
     * Get image source
     * @returns {String}
     */
    imageSrc: function() {
      return pathOr(
        '',
        ['fields', 'image', 'fields', 'file', 'url'],
        this.event
      )
    },
    /**
     * Get image source
     * @returns {String}
     */
    imageAlt: function() {
      return pathOr(
        '',
        ['fields', 'image', 'fields', 'file', 'description'],
        this.event
      )
    },

    /**
     * Get event date range, if there is no end date, default to start date
     * @returns {String}
     */
    eventDate: function() {
      const startDate = this.formatDate(this.event.fields.startDate || '')
      const endDate = this.formatDate(this.event.fields.endDate || '')
      return startDate === endDate || !endDate
        ? startDate
        : `${startDate} - ${endDate}`
    }
  }
}
</script>


