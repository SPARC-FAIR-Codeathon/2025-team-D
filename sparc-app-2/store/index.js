import { defineStore } from 'pinia'
import auth from '@/services/auth.js'
import { pathOr, propOr } from 'ramda'

export const useMainStore = defineStore('main', {
  state: () => ({
    disableScrolling: false,
    footerData: {},
    portalNotification: {},
    userProfile: null,
    datasetInfo: {},
    datasetTypeName: "",
    datasetFacetsData: [],
    formOptions: {
      userTypes: [],
      areasOfSparc: [],
      services: [],
      resourceCategories: []
    },
  }),
  getters: {
    username(state) {
      const firstName = pathOr('', ['firstName'], state.userProfile)
      const lastName = pathOr('', ['lastName'], state.userProfile)
      const abbrvLastName = lastName.length === 1 ? lastName[0] : `${lastName[0]}.`
      return `${firstName} ${abbrvLastName}`
    },
    userToken(state) {
      return propOr('', 'token', state.userProfile)
    },
    tokenExp(state) {
      return propOr('', 'tokenExp', state.userProfile)
    },
    firstName (state) {
      return pathOr('', ['firstName'], state.userProfile)
    },
    lastName (state) {
      return pathOr('', ['lastName'], state.userProfile)
    },
    userProfileIntId (state) {
      return pathOr('', ['intId'], state.userProfile)
    },
    profileColor (state) {
      return pathOr('', ['color'], state.userProfile)
    },
    profileUrl (state) {
      return pathOr('', ['url'], state.userProfile)
    },
    profilePreferredOrganization (state) {
      return pathOr('', ['preferredOrganization'], state.userProfile)
    },
    profileEmail (state) {
      return pathOr('', ['email'], state.userProfile)
    },
    profileComplete (state) {
      return helperMethods.isProfileComplete(state.userProfile)
    },
    userTypes(state) {
      return pathOr('', ['userTypes'], state.formOptions)
    }
  },
  actions: {
    async init() {
      const appInitializedCookie = useCookie('appInitialized')
      if (appInitializedCookie.value === 'true') {
        console.log('App already initialized')
        return
      }
      try {
        await Promise.all([
          this.fetchContactUsFormOptions(),
          this.fetchFooterData(),
          this.fetchPortalNotification()
        ])

        appInitializedCookie.value = 'true'
      } catch (error) {
        console.error('Error during initialization:', error)
      }
    },
    updateDisabledScrolling(value) {
      this.disableScrolling = value
    },
    setFooterData(value) {
      this.footerData = value
    },
    setPortalNotification(value) {
      this.portalNotification = value
    },
    setDatasetInfo(value) {
      this.datasetInfo = value
    },
    setDatasetTypeName(value) {
      this.datasetTypeName = value
    },
    setDatasetFacetsData(value) {
      this.datasetFacetsData = value
    },
    setFormOptions(value) {
      this.formOptions = value
    },
    async fetchContactUsFormOptions() {
      const { data, error } = await useAsyncData(
        'contact-us-form-options',
        async () => {
          try {
            const response = await useNuxtApp().$contentfulClient.getEntry(
              useRuntimeConfig().public.ctf_contact_us_form_options_id
            )
            const fields = response.fields
  
            const formOptions = {
              userTypes: propOr([], 'typeOfUser', fields),
              areasOfSparc: propOr([], 'areaOfSparcPortal', fields),
              services: propOr([], 'services', fields),
              resourceCategories: propOr([], 'resourceCategories', fields),
            }
            return formOptions
          } catch (e) {
            console.error(e)
            return null
          }
        },
        {
          server: true
        }
      )

      if (data) {
        this.setFormOptions(data)
      }
    },

    async fetchPortalNotification() {
      const { data, error } = await useAsyncData(
        'portal-notification',
        async () => {
          try {
            const response = await useNuxtApp().$contentfulClient.getEntry(
              useRuntimeConfig().public.ctf_portal_notification_entry_id
            )
            return response.fields
          } catch (e) {
            console.error(e)
            return null
          }
        },
        {
          server: true
        }
      )

      if (data) {
        this.setPortalNotification(data)
      }
    },

    async fetchFooterData() {
      const { data, error } = await useAsyncData(
        'footer-data',
        async () => {
          try {
            const response = await useNuxtApp().$contentfulClient.getEntry(
              useRuntimeConfig().public.ctf_home_page_id
            )
            const { footerDescription, learnMoreLinks, policiesLinks, helpUsImproveLinks, stayUpdatedLinks } = response.fields
            return {
              footerDescription,
              learnMoreLinks,
              policiesLinks,
              helpUsImproveLinks,
              stayUpdatedLinks,
            }
          } catch (e) {
            console.error(e)
            return null
          }
        },
        {
          server: true
        }
      )

      if (data) {
        this.setFooterData(data)
      }
    },
    setUserProfile(value) {
      this.userProfile = value
    },
    async login(providerName) {
      await auth.login(providerName)
    },
    async logout(){
      await auth.logout()
    },
  },
  persist: {
    storage: persistedState.localStorage,
  }
})

const helperMethods = {
  isProfileComplete(profile) {
    if (profile) {
      return profile.email.split("@")[1] !== "pennsieve-nonexistent.email" && 
      profile.firstName.toLowerCase() !== "orcid" &&
      profile.lastName.toLowerCase() !== "login"
    }
    return false
  }
}
