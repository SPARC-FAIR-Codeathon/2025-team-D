<template>
  <div class="upcoming-event">
    <div class="upcoming-event__image">
      <nuxt-link
        v-if="event.fields.requiresADetailsPage"
        :to="{
          name: 'news-and-events-events-id',
          params: { id: event.sys.id }
        }"
      >
        <img :src="eventImage(event)" :alt="eventAlt(event)" />
      </nuxt-link>
      <template v-else>
        <a v-if="event.fields.url" :href="event.fields.url" target="_blank">
          <img :src="eventImage(event)" :alt="eventAlt(event)" />
        </a>
        <div v-else>
          <img :src="eventImage(event)" :alt="eventAlt(event)" />
        </div>
      </template>

      <sparc-pill>{{ event.fields.eventType }}</sparc-pill>
    </div>
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
      <template v-else>
        <a v-if="event.fields.url" :href="event.fields.url" target="_blank">
          {{ event.fields.title }}
        </a>
        <div v-else>
          {{ event.fields.title }}
        </div>
      </template>
    </h3>
    <div class="upcoming-event__detail">
      <svgo-icon-calendar class="mr-4" height="16" width="16" />
      <p>{{ eventDate(event) }}</p>
    </div>
    <div v-if="event.fields.location" class="upcoming-event__detail">
      <svgo-icon-map class="mr-4" height="16" width="16" />
      <p>{{ event.fields.location }}</p>
    </div>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import FormatDate from '@/mixins/format-date'
import SparcPill from '@/components/SparcPill/SparcPill.vue'

export default {
  name: 'EventCard',

  components: {
    SparcPill
  },

  mixins: [FormatDate],

  props: {
    event: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    /**
     * Get event image
     * @returns {String}
     */
    eventImage: function(event) {
      return pathOr('', ['fields', 'image', 'fields', 'file', 'url'], event)
    },
    /**
     * Get event image alt tag
     * @returns {String}
     */
    eventAlt: function(event) {
      return pathOr('', ['fields', 'image', 'fields', 'title'], event)
    },
    /**
     * Get event date range, if there is no end date, default to start date
     * @returns {String}
     */
    eventDate: function(event) {
      const startDate = this.formatDate(event.fields.startDate || '')
      const endDate = this.formatDate(event.fields.endDate || '')
      return startDate === endDate || !endDate
        ? startDate
        : `${startDate} - ${endDate}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.upcoming-event {
  background: #fff;
  border: 1px solid $lineColor1;
  color: $darkBlue;
  padding: 1.5em 1em;
  &__image {
    margin-bottom: 1rem;
    overflow: hidden;
    padding-top: 100%;
    position: relative;
    img {
      display: block;
      height: auto;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
    div {
      position: absolute;
      right: 4px;
      top: 4px;
    }
  }
  &__detail {
    align-items: baseline;
    display: flex;
    margin-bottom: 0.625rem;
    &:last-child {
      margin: 0;
    }
    .svg-icon {
      flex-shrink: 0;
      margin-right: 0.5rem;
    }
    p {
      margin: 0;
    }
  }
  h3 {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1rem;
    line-height: 1.375rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  a {
    color: $purple;
    text-decoration: none;
    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
}
</style>
