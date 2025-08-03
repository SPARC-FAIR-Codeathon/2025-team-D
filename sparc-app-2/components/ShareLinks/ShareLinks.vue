<template>
  <div class="share-links">
    <client-only>
      <ShareNetwork network="facebook" :url="pageUrl" :title="title">
        <sparc-tooltip
          placement="bottom-center"
          content="Share on Facebook"
        >
          <template #item>
            <svgo-icon-share-facebook class="link-icon"/>
          </template>
        </sparc-tooltip>
      </ShareNetwork>
      <a :href="blueskyUrl" target="_blank">
        <sparc-tooltip
          placement="bottom-center"
          content="Share on Bluesky"
        >
          <template #item>
            <svgo-icon-share-bluesky class="link-icon"/>
          </template>
        </sparc-tooltip>
      </a>
      <ShareNetwork network="linkedin" :url="pageUrl" :title="title">
        <sparc-tooltip
          placement="bottom-center"
          content="Share on LinkedIn"
        >
          <template #item>
            <svgo-icon-share-linked class="link-icon"/>
          </template>
        </sparc-tooltip>
      </ShareNetwork>
      <button class="btn-copy-permalink" @click="copyUrl">
        <sparc-tooltip
          placement="bottom-center"
          content="Copy Link"
        >
          <template #item>
            <svgo-icon-permalink class="link-icon"/>
          </template>
        </sparc-tooltip>
      </button>
    </client-only>
  </div>
</template>

<script>
import { successMessage, failMessage } from '@/utils/notification-messages'

export default {
  name: 'ShareLinks',

  setup(props) {
    const route = useRoute()
    const config = useRuntimeConfig()
    const pageUrl = config.public.ROOT_URL + route.fullPath
    const blueskyUrl = new URL('https://bsky.app/intent/compose')
    blueskyUrl.searchParams.append('text', props.title ? `${props.title} - ${pageUrl}` : pageUrl)
    return {
      pageUrl,
      blueskyUrl: blueskyUrl.toString()
    }
  },

  props: {
    title: {
      type: String,
      default: ""
    }
  },

  methods: {
    /**
     * Copy file URL to clipboard
     * @param {Object} scope
     */
    copyUrl() {
      navigator.clipboard.writeText(this.pageUrl).then(
        () => {
          successMessage('URL copied to clipboard.')
        },
        () => {
          failMessage('Cannot copy to clipboard.')
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.btn-copy-permalink {
  border: none;
  background: none;
  color: $purple;
  cursor: pointer;
  padding: 0;
  &:active {
    outline: none;
  }
}

.link-icon {
  height: 1.75rem;
  width: 1.75rem;
}
</style>
