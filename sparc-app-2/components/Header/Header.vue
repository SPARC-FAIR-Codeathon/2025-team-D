<template>
  <div class="header">
    <div class="header__nav">
      <div class="header__nav--parent">
        <svgo-icon-contact class="tab3 mr-4 mt-4" />
        <nuxt-link :to="`/contact-us?source_url=${currentUrl}`" target="_blank">
          Contact Us
        </nuxt-link>
        <svgo-icon-help class="tab3 mr-4 mt-4" />
        <a href="https://docs.sparc.science/" target="_blank">
          Help
        </a>
        <client-only>
          <svgo-icon-sign-in class="tab3 mt-4" />
          <a class="sign-in-link" v-if="!userProfile" @click="showLoginDialog = true">
            Sign in
          </a>
          <el-menu ref="userMenu" class="mr-16 user-menu" v-else :ellipsis="false" background-color="#24245b"
            @select="handleUserMenuSelect" @mouseleave="closeMenu" @mouseenter="openMenu">
            <el-sub-menu index="user" class="submenu">
              <template #title>{{username}}</template>
              <el-menu-item class="user-submenu" index="profile">Profile</el-menu-item>
              <el-menu-item class="user-submenu" index="logout">Logout</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </client-only>
      </div>
      <div class="header__nav--main">
        <div class="nav-main-container">
          <button class="nav-main-container__mobile-menu" @click="openMobileNav">
            <svgo-icon-hamburger height="25" width="25" />
          </button>
          <div class="logo">
            <nuxt-link :to="{ name: 'index' }">
              <client-only><sparc-logo /></client-only>
            </nuxt-link>
          </div>

          <div :class="[menuOpen ? 'overlay' : '']">
            <div class="mobile-navigation" :class="[menuOpen ? 'open' : '']">
              <ul>
                <li v-for="link in links" :key="link.href" style="z-index: 100;">
                  <nuxt-link :to="link.href" :class="{ active: activeLink(link.href) }" exact-active-class="active">
                    {{ link.displayTitle }}
                  </nuxt-link>
                </li>
                <hr class="divider" />
              </ul>
              <ul class="mobile-navigation__links">
                <li>
                  <svgo-icon-contact class="tab2" />
                  <nuxt-link :to="`/contact-us?source_url=${currentUrl}`" target="_blank">
                    Contact Us
                  </nuxt-link>
                </li>
                <li>
                  <svgo-icon-help class="tab2" />
                  <a href="https://docs.sparc.science/" target="_blank">
                    Help
                  </a>
                </li>
                <li>
                  <client-only>
                    <svgo-icon-sign-in class="tab2" />
                    <a v-if="!userProfile" class="sign-in-link" @click="showLoginDialog = true">
                      Sign in
                    </a>
                    <span v-else>
                      <a class="sign-in-link" @click="handleUserMenuSelect('profile', ['user','profile'])">
                        Profile
                      </a>
                      <a class="sign-in-link" @click="handleUserMenuSelect('logout', ['user','logout'])">
                        Logout
                      </a>
                    </span>
                  </client-only>
                </li>
              </ul>
              <div class="mobile-navigation__links--social">
                <a href="https://bsky.app/profile/sparc.science" target="_blank">
                  <svgo-icon-bluesky class="social-media-icon pr-16"/>
                </a>
                <a href="https://www.youtube.com/results?search_query=sparc+nih" target="_blank">
                  <svgo-icon-youtube class="social-media-icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="announcement">This repository is under review for potential modification in compliance with Administration directives.
        <a href="https://docs.sparc.science/docs/notice-regarding-repository-review-in-response-to-executive-order-14168" target="_blank"><svgo-icon-help class="help-icon"/></a>
      </div>
    </div>
    <login-modal :show-dialog="showLoginDialog" @dialog-closed="showLoginDialog = false" />
  </div>
</template>

<script>
import LoginModal from '@/components/LoginModal/LoginModal.vue'
import { useMainStore } from '../../store/index.js'
import { mapActions, mapState } from 'pinia'
import SparcLogo from 'sparc-design-system-components-2/src/components/SparcLogo'

const links = [
  {
    title: 'data',
    displayTitle: 'Data & Models',
    href: '/data?type=dataset'
  },
  {
    title: 'apps',
    displayTitle: 'SPARC Apps',
    href: '/apps'
  },
  {
    title: 'tools-and-resources',
    displayTitle: 'Tools & Resources',
    href: `/tools-and-resources`
  },
  {
    title: 'news-and-events',
    displayTitle: 'News & Events',
    href: '/news-and-events'
  },
  {
    title: 'about',
    displayTitle: 'About',
    href: '/about'
  },
  {
    title: 'share-data',
    displayTitle: 'Submit to SPARC',
    href: '/share-data'
  },
  {
    title: 'register-plugins',
    displayTitle: 'Register Plugins',
    href: '/register-plugins'
  }
]

export default {
  name: 'SparcHeader',
  components: {
    LoginModal,
    SparcLogo
  },
  data: () => {
    return {
      links,
      menuOpen: false,
      showLoginDialog: false,
    }
  },
  computed: {
    ...mapState(useMainStore, ['userProfile', 'profileComplete', 'userToken', 'username']),
    firstPath: function() {
      const path = this.$route.path
      // ignore the first backslash
      const endIndex = path.indexOf('/', 1)
      if (endIndex == -1) {
        return path.substring(0)
      }
      return path.substring(0, endIndex)
    },
    currentUrl: function () {
      const config = useRuntimeConfig()
      const url = new URL(this.$route.fullPath, config.public.ROOT_URL)
      url.searchParams.delete('source_url') // Remove existing source_url in order to prevent indexing recursion
      return encodeURIComponent(url.pathname + url.search)
    },
  },

  watch: {
    profileComplete: {
      handler: function() {
        this.verifyProfileComplete()
      },
      immediate: true
    },
    /**
     * Watches for the route path to hide
     * mobile nav on menu click
     **/
    '$route.path': {
      handler: function(val) {
        if (val) {
          this.menuOpen = false
        }
        this.verifyProfileComplete()
      },
      immediate: true
    },

    /**
     * Watches menuOpen to check if it's false
     * to enable scrolling
     */
    menuOpen: {
      handler: function(val) {
        if (!val) {
          this.updateDisabledScrolling(false)
        }
      },
      immediate: true
    }
  },

  methods: {
    ...mapActions(useMainStore, ['updateDisabledScrolling', 'logout']),
    verifyProfileComplete() {
      if (this.userProfile) {
        // If the user is logged in and their profile is incomplete then make sure they complete it. Otherwise, do not allow them to visit the welcome page again
        if (!this.profileComplete) {
          if (this.$route.name !== 'welcome') {
            this.$router.push("/welcome")
          }
        }
        else if (this.$route.name == 'welcome') {
          this.$router.push("/")
        }
      }
    },
    handleUserMenuSelect(menuId, menuIdPath) {
      if (menuId === 'logout') {
        this.logout()
      }
      if (menuId === 'profile') {
        this.$router.push('/user/profile')
      }
    },
    /**
     * Sets a link to active based on current page
     * @param {String} query
     */
    activeLink: function(query) {
      if (this.firstPath.includes(query)) {
        return true
      } else {
        return false
      }
    },
    /**
     * Opens the mobile version of the navigation
     */
    openMobileNav: function() {
      if (!this.menuOpen) {
        this.updateDisabledScrolling(true)
        this.menuOpen = true
      } else {
        this.menuOpen = false
        this.updateDisabledScrolling(false)
      }
    },
    openMenu() {
      this.$refs.userMenu.open('user')
    },
    closeMenu() {
      this.$refs.userMenu.close('user')
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.social-media-icon {
  color: #606266;
  font-size: 2rem;
}

.nav {
  height: 4em;
  padding: 0;
  padding-top: 1rem;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
  @media (max-width: 1120px) {
    align-items: center;
  }
}
@media (max-width: 1120px) {
  .overlay {
    position: absolute;
    top: 56px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.divider {
  display: none;
  @media screen and (max-width: 1120px) {
    border: 0;
    clear: both;
    display: block;
    width: 89%;
    background-color: lightgrey;
    height: 1px;
    margin-left: 0;
    margin-top: 11px;
  }
}

.header__nav {
  background-color: $darkBlue;
  width: 100%;
}

.header__nav--parent {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 8px;
  margin-bottom: 8px;
  .svg-icon {
    align-self: center;
    color: white;
  }
  img {
    margin-right: 5px;
  }
  a {
    font-size: 13px;
    font-weight: 400;
    line-height: 24px;
    color: white;
    margin-right: 18px;
    text-decoration: none;
  }
  @media (max-width: 1120px) {
    & {
      display: none;
    }
  }
}

.header__nav--main {
  height: 82px;
  background-color: white;
  padding-top: 30px;
  padding-left: 33px;
  display: flex;
  flex-direction: row;
  @media (max-width: 1120px) {
    height: 41px;
    padding-left: 0;
    padding-top: 13px;
    .nav-main-container__mobile-menu {
      padding-left: 2px;
    }
  }

  .mobile-navigation__links {
    display: none;
    &--social {
      display: none;
    }
    @media (max-width: 1120px) {
      display: flex;
      flex-direction: column;
      a {
        font-size: 14px;
        font-weight: 300;
        line-height: 32px;
        margin-left: 0.5rem;
      }

      &--social {
        display: flex;
        flex-direction: row;
        margin-top: 15rem;
        .svg-icon {
          margin-right: 1rem;
        }
      }
    }
  }

  a {
    color: black;
    font-size: 16px;
    line-height: 32px;
    font-weight: 500;
    padding-top: 5px;
    text-decoration: none;
  }
}

.nav-main-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  @media (max-width: 1120px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0;
    width: 100%;
  }
}

.logo {
  height: 62px;
  width: 127px;
  white-space: nowrap;
  margin-right: 48px;
  @media (max-width: 1120px) {
    height: 2rem;
    width: 100%;
    margin-right: 0;
    padding-top: 0.1rem;
  }
}

::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: #909399;
  opacity: 1; /* Firefox */
  font-size: 14px;
  font-weight: 300;
  line-height: 32px;
  padding-left: 7px;
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: lightgrey;
  font-size: 14px;
  font-weight: 300;
  line-height: 32px;
  padding-left: 7px;
}

.nav-main-container__mobile-menu {
  background: none;
  border: none;
  color: #000;
  display: none;
  font-size: 24px;
  margin: 0;
  outline: none;
  padding: 10px;
  transform: translate(12px, -8px);
  -webkit-appearance: none;

  &:hover:not(:active) {
    color: #1a1489;
  }

  @media screen and (max-width: 1120px) {
    & {
      display: block;
    }
  }
}

.mobile-navigation {
  padding: 0px;
  height: 100%;
  margin-left: 1rem;
  width: 120%;
  ul {
    padding-left: 0;
    margin-top: 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    li {
      display: inline;
      padding-right: 5rem;
      @media screen and (min-width: 1120px) {
        padding-right: 0.5rem;
      }

      a {
        text-decoration: none;
        color: $darkBlue;
        padding-bottom: 0.2rem;
        font-weight: 500;

        &.active,
        &:hover {
          border-bottom: 2px solid $purple;
          color: $purple;
        }
      }
    }
  }

  @media (max-width: 1120px) {
    & {
      background: #f5f7fa;
      bottom: 0;
      display: none;
      flex-direction: column;
      left: 0;
      padding: 1em;
      position: fixed;
      right: 6rem;
      top: 3.4rem;
      z-index: 9999;
      &.open {
        display: flex;
        margin-left: 0;
        margin-right: 1rem;
        width: 70%;
        overflow: scroll;
      }
    }
    ul {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      li {
        margin: 0.25rem 0;
      }
    }
  }
}

.click-outside-mobile-search-catch {
  height: calc(100% - 8rem);
  top: 8rem;
  position: fixed;
  width: 100%;
}

.data-portal-title {
  font-size: 14px;
  color: #303133;
  line-height: 14px;
  position: relative;
  bottom: 5px;
  margin-left: 5px;
  user-select: none;
}

.sign-in-link:hover {
  cursor: pointer;
}
:deep(.el-sub-menu__title) {
  line-height: inherit !important;
  height: fit-content !important;
  color: white !important;
  border: none !important;
  padding-left: 0 !important;
  i {
    color: white;
  }
}

.user-menu {
  border: none !important;
}
.user-submenu {
  color: #303133 !important;
  background-color: white !important;
  font-size: 14px !important;
  line-height: 32px !important;
  font-weight: medium !important;
  height: fit-content !important;
}
.user-submenu:hover {
  color: #8300bf !important;
}
:deep(.submenu > ul.el-menu) {
  position: absolute;
  margin-top: .5rem;
  margin-left: .5rem;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
:deep(.user-submenu) {
  padding-left: .5rem !important;
  padding-right: .5rem !important;
}
.announcement {
  background-color: #f9f2fc;
  text-align: center;
  border-top: 1px solid $purple;
  border-bottom: 1px solid $purple;
  padding: .5rem;
}
.help-icon {
  color: $purple;
  height: 1.5rem;
  width: 1.5rem;
}
</style>
