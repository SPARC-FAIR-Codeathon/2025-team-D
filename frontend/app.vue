<template>
  <NuxtLayout>
    <div class="loading-container" v-if="loading">
      <img class="logo" :src="logo" />
    </div>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>
import { ref } from 'vue'
import sparcLogoFast from '@/assets/sparcLogoFast.gif'
import { Amplify } from '@aws-amplify/core'
import { successMessage } from './utils/notification-messages'

export default {
  async setup() {
    const nuxtApp = useNuxtApp()
    const loading = ref(true)
    const loaded = ref(false)
    const logo = sparcLogoFast
    nuxtApp.hook("page:finish", () => {
      loading.value = false
      loaded.value = true
    })
    const config = useRuntimeConfig()
    const awsConfig = {
      Auth: {
        region: config.public.AWS_REGION,
        userPoolId: config.public.AWS_USER_POOL_ID,
        userPoolWebClientId: config.public.AWS_USER_POOL_WEB_CLIENT_ID,
        authenticationFlowType: config.public.AWS_USER_AUTHENTICATION_FLOW_TYPE,
        oauth: {
          domain: config.public.AWS_OAUTH_DOMAIN,
          scope: [`${config.public.AWS_OAUTH_SCOPE}`],
          redirectSignIn: config.public.AWS_OAUTH_REDIRECT_SIGN_IN_URL,
          redirectSignOut: config.public.AWS_OAUTH_REDIRECT_SIGN_OUT_URL,
          responseType: config.public.AWS_OAUTH_RESPONSE_TYPE
        }
      }
    }
    // https://aws.amazon.com/blogs/mobile/ssr-support-for-aws-amplify-javascript-libraries/
    Amplify.configure(awsConfig)
    return {
      logo,
      loading
    }
  },
  mounted() {
    const internalTrafficCookie = useCookie(this.$config.public.INTERNAL_TRAFFIC_KEY, { default: () => 'false' })
    const internalTrafficCookieIsSet = internalTrafficCookie.value == this.$config.public.INTERNAL_TRAFFIC_VALUE
    const internalTrafficNotificationShown = useCookie('InternalTrafficNotificationShown', { default: () => false })
    if (internalTrafficCookieIsSet) {
      if (!internalTrafficNotificationShown.value) {
        successMessage('You are now recognized as an internal user and your metrics are not being tracked!')
        internalTrafficNotificationShown.value = true
      }
    } else {
      internalTrafficNotificationShown.value = false
    }
  }
}
</script>
<style lang="scss" scoped>
.loading-container {
  position: fixed;
  top: 0;
  z-index: 101;
  background-color: white;
  opacity: .5;
  width: 100vw;
  height: 100vh;
}

.logo {
  position: absolute;
  height: 5rem;
  z-index: 2;
  left: calc(50vw - 5rem);
  top: calc(50vh - 5rem);
}
</style>
