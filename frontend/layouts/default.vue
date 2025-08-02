<template>
  <div v-if="!isBot" :class="[disableScrolling ? 'layout' : '']">
    <sparc-header />
    <slot />
    <sparc-footer />
    <cookie-notice v-if="!hasAcceptedGDPR" />
  </div>
</template>

<script>
import SparcHeader from '@/components/Header/Header.vue'
import SparcFooter from '@/components/Footer/Footer.vue'
import CookieNotice from '@/components/CookieNotice/CookieNotice.vue'
import { propOr } from 'ramda'
import DOMPurify from 'isomorphic-dompurify'
import { useMainStore } from '../store/index.js'
import { mapState } from 'pinia'
import { customMessage } from '@/utils/notification-messages'

export default {
  components: {
    CookieNotice,
    SparcHeader,
    SparcFooter
  },
  data() {
    const userAgent = process.client ? navigator.userAgent : ''
    const botPatterns = [
        /semrush/i, /msnbot/i, /yandex/i, /applebot/i, /wowrack/i, /lifeera/i,
        /petalbot/i, /nettle/i, /xforce-security/i, /neevabot/i, /seekport crawler/i,
        /exabot/i, /gigabot/i, /iccrawler/i, /snappy/i, /mb2345browser/i, /qqbrowser/i,
        /liebaofast/i, /micromessenger/i, /kinza/i, /theworld/i, /youdaobot/i,
        /qwantify/i, /bleriot/i, /wikiapiary/i, /megaindex/i, /mojeekbot/i,
        /blexbot/i, /coccocbot/i, /seokicks/i, /seznambot/i, /yandeximages/i,
        /tweetmemebot/i, /yeti/i, /ahrefsbot/i, /bytespider/i, /mj12bot/i,
        /turnitinbot/i, /ccbot/i, /linguee bot/i, /dotbot/i, /openlinkprofiler/i,
        /ltx71/i, /rogerbot/i, /baiduspider/i, /facebot/i, /pinterestbot/i, /slackbot/i,
        /embedly/i, /whatsapp/i, /telegrambot/i, /headlesschrome/i, /puppeteer/i, /phantomjs/i,
        /screaming frog seo spider/i, /adsbot-google/i, /sogou/i
      ]
    return {
      store: useMainStore(),
      isBot: userAgent == '' || botPatterns.some(pattern => pattern.test(userAgent))
    }
  },
  computed: {
    ...mapState(useMainStore, ['disableScrolling', 'portalNotification']),
    hasAcceptedGDPR() {
      return useCookie('GDPR:accepted').value
    }
  },
  mounted() {
    if (!this.isBot) {
      this.showPortalNotification()
    }
  },
  methods: {
    showPortalNotification() {
      const displayOnHomePageOnly = propOr("", 'displayOn', this.portalNotification) === 'Homepage Only'
      const currentlyOnHomePage = this.$route.fullPath === "/"
      const message = DOMPurify.sanitize(propOr("", 'message', this.portalNotification).trim(), {
        ALLOWED_TAGS: ['a', 'br', 'sup'], // We allow links, line breaks, and sup tags
        ALLOWED_ATTR: ['href'], // We allow the href attribute for links
      })
      const messageType = propOr("", 'messageType', this.portalNotification)
      const onlyShowOnce = propOr(true, 'showOnce', this.portalNotification)
      const stopShowingDate = propOr(undefined, 'stopShowingDate', this.portalNotification)
      // If the stop showing time is not set then always display message, otherwise check if the date has passed
      const stopShowing = stopShowingDate === undefined ? false : new Date(stopShowingDate).getTime() < new Date().getTime()
      if (message != "" && !stopShowing) {
        if (!onlyShowOnce || !useCookie('PortalNotification:hasBeenSeen').value || (useCookie('PortalNotification:message').value != this.portalNotification.message)) {
          if (!displayOnHomePageOnly || (displayOnHomePageOnly && currentlyOnHomePage)) {
            switch (messageType) {
              case 'Error': {
                customMessage({
                  message: message,
                  showClose: true,
                  iconClass: 'el-icon-circle-close',
                  customClass: 'el-message--error',
                  dangerouslyUseHTMLString: true,
                  duration: 0
                })
                break
              }
              case 'Success': {
                customMessage({
                  message: message,
                  showClose: true,
                  iconClass: 'el-icon-circle-check',
                  customClass: 'el-message--success',
                  dangerouslyUseHTMLString: true,
                  duration: 0
                })
                break
              }
              case 'Information': {
                customMessage({
                  message: message,
                  showClose: true,
                  iconClass: 'about-icon',
                  customClass: 'el-message--info',
                  dangerouslyUseHTMLString: true,
                  duration: 0
                })
                break
              }
            }
            const today = new Date()
            const expirationDate = new Date(today.setDate(today.getDate() + 30))
            const hasBeenSeenCookie = useCookie('PortalNotification:hasBeenSeen', { expires: expirationDate })
            hasBeenSeenCookie.value = true
            const portalNotificationMessageCookie = useCookie('PortalNotification:message')
            portalNotificationMessageCookie.value = this.portalNotification.message
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.layout {
  @media screen and (max-width: 768px) {
    overflow: hidden;
    position: fixed;
  }
}
</style>
