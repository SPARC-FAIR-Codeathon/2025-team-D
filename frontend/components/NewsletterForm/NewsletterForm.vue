<template>
  <div>
    <page-hero class="py-24">
      <h1 class="mb-8">Communication Preferences</h1>
      <div class="body2">Thank you for your interest in SPARC! We want to ensure you receive information that's relevant, impactful, and tailored to your interests. Please fill out this form to update your communication preferences and help us deliver the updates and insights you care about most. It’s quick, easy, and ensures you stay connected to what matters to you.
      <br /><br />To ensure that you receive messages from the SPARC Data and Resource Center, please add info@sparc.science to your Safe Senders list. Be sure to check your SPAM filter for missed messages.</div>
    </page-hero>
    <div>
      <div class="form-placeholder" v-if="newsletterForm == null" v-loading="newsletterForm == null" />
      <div v-show="newsletterForm" class="container" id="hubspot-form-container" />
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed } from 'vue'
import { useMainStore } from '../../store/index.js'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const config = useRuntimeConfig()
const { $axios } = useNuxtApp()
const { profileEmail } = storeToRefs(mainStore)
const newsletterForm = ref(null)
const communicationPreferences = ref(null)
const router = useRouter()
const route = useRoute()

const fetchCommunicationPreferences = async (email, axios) => {
  try {
    const { data } = await axios.get(`${config.public.portal_api}/hubspot_contact_properties/${email}`)
    communicationPreferences.value = data
  } catch (error) {
    prefillForm(route)
  }
}

watch(profileEmail,
  (newEmail) => {
      fetchCommunicationPreferences(newEmail, $axios)
  },
  { immediate: true }
)

watch(communicationPreferences,
  () => {
    prefillForm(route)
  }
)

const firstName = computed(() => communicationPreferences.value?.properties?.firstname || undefined)
const lastName = computed(() => communicationPreferences.value?.properties?.lastname || undefined)
const jobTitle = computed(() => communicationPreferences.value?.properties?.jobtitle || undefined)
const company = computed(() => communicationPreferences.value?.properties?.company || undefined)
const newsletterSelections = computed(() => communicationPreferences.value?.properties?.newsletter?.split(",") || undefined)

const initializeForm = () => {
  if (!document) return
  // Generated from Hubspot. Docs: https://knowledge.hubspot.com/forms/how-can-i-share-a-hubspot-form-if-im-using-an-external-site
  const script = document.createElement('script')
  script.src = '//js.hsforms.net/forms/embed/v2.js'
  script.charset = 'utf-8'
  script.type = 'text/javascript'

  script.onload = () => {
    // Once the script is loaded, initialize the form
    if (window.hbspt) {
      hbspt.forms.create({
        portalId: "22776713",
        formId: "0fb8ac44-1764-40ce-b344-7dfafc8f2f24",
        target: '#hubspot-form-container',
        onFormReady: (form) => {
          newsletterForm.value = form
        },
      })
    }
  }

  // Append the script to the document body
  document.body.appendChild(script)
}

const prefillForm = (currentRoute) => {
  router.replace({
    query: {
      ...currentRoute.query,
      email: profileEmail.value || undefined,
      firstname: firstName.value,
      lastname: lastName.value,
      jobtitle: jobTitle.value,
      company: company.value,
      newsletter: newsletterSelections.value
    },
  })
  initializeForm()
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.container {
  margin-top: 1rem !important;
}
.el-loading-mask {
  position: relative !important;
}
.form-placeholder {
  min-height: 5rem;
}
</style>
