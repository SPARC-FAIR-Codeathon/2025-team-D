<template>
  <div class="cookie-notice">
    <div class="container">
      <div class="cookie-notice__content">
        <div class="cookie-notice__copy">
          <div class="heading2">
            This website uses cookies to ensure that you get the best
            experience.
          </div>
          <p>
            To learn more, please refer to the
            <nuxt-link to="about/policies-and-standards/privacy-policy">
              Privacy Policy.
            </nuxt-link>
            By closing this banner or clicking accept, you agree to the use of
            cookies.
          </p>
          <a href="#" @click.prevent="openAccessibilityDialog">Accessibility Standards</a>
        </div>
        <div>
          <el-button @click="closeNotice">
            Accept
          </el-button>
        </div>
      </div>
    </div>
    <el-button class="btn-close" @click="closeNotice">
      <svgo-icon-remove class="body4"/>
    </el-button>
    <accessibility-dialog
      v-model:visible="accessibilityDialogVisible"
      @close="closeAccessibilityDialog"
    />
  </div>
</template>

<script>
import AccessibilityDialog from '../AccessibilityDialog/AccessibilityDialog.vue'

export default {
  name: 'CookieNotice',

  components: {
    AccessibilityDialog
  },

  data() {
    return {
      accessibilityDialogVisible: false
    }
  },
  methods: {
    /**
     * Close notice and accept the policy
     */
    closeNotice: function() {
      const today = new Date()
      const expirationDate = new Date(today.setDate(today.getDate() + 30))
      const gdprCookie = useCookie('GDPR:accepted', { expires: expirationDate })
      gdprCookie.value = true
    },

    /**
     * Opens Accessibility Dialog
     */
    openAccessibilityDialog: function() {
      this.accessibilityDialogVisible = true
    },

     /**
      * Closes Accessibility Dialog
      */
    closeAccessibilityDialog: function() {
      this.accessibilityDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.cookie-notice {
  background: #fff;
  bottom: 0;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.07);
  color: $darkBlue;
  left: 0;
  right: 0;
  padding: 2rem 0;
  position: fixed;
  z-index: 10000;
}
.cookie-notice__content {
  max-width: 80%;
  @media (min-width: 48em) {
    align-items: center;
    display: flex;
    max-width: none;
    justify-content: space-between;
  }
}
.cookie-notice__copy {
  margin-bottom: 1em;
  @media (min-width: 48em) {
    margin: 0 1em 0 0;
    max-width: 53.75em;
  }
}
h2 {
  font-size: 1.1em;
  margin: 0;
  line-height: 1.2;
  @media (min-width: 48em) {
    font-size: 1.5em;
  }
}
a {
  font-size: 1em;
  color: $purple;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
p {
  font-size: 0.875em;
  line-height: 1.2;
  margin: 0;
}
.btn-close {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  cursor: pointer;
  position: absolute;
  right: 1rem;
  top: 0.25rem;
}
</style>
