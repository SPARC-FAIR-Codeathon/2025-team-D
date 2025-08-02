<template>
  <Head>
    <Title>Contact Us</Title>
    <Meta name="og:title" hid="og:title" content="Contact Us" />
    <Meta name="twitter:title" content="Contact Us" />
    <Meta name="description" hid="description" :content="breadcrumbTitle" />
    <Meta name="og:description" hid="og:description" :content="breadcrumbTitle" />
    <Meta name="twitter:description" :content="breadcrumbTitle" />
    <link rel="canonical" href="https://sparc.science/contact-us" />
    <Meta name="robots" content="noindex, nofollow" />
  </Head>
  <div class="contact-us-page pb-16">
    <breadcrumb :breadcrumb="breadcrumb" :title="breadcrumbTitle" />
    <div class="container">
      <div class="tabs__container">
        <h1 hidden>Contact forms</h1>
        <h3>
          Select Form
        </h3>
        <ul class="tabs">
          <li v-for="type in formTypes" :key="type.label">
            <nuxt-link
              class="tabs__button"
              @click="resetForms"
              :class="{ active: type.type === $route.query.type || (type.subtypes != undefined && type.subtypes.includes($route.query.type)) || ($route.query.type === undefined && type.type === 'research') }"
              :to="{
                name: 'contact-us',
                query: {
                  ...$route.query,
                  type: type.type,
                }
              }"
            >
              {{ type.label }}
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="container">
      <div class="subpage">
        <div v-if="formTypeObject" class="body1" v-html="formTypeObject.description"></div>
      </div>
    </div>
    <div class="container">
      <div class="subpage">
        <template v-if="isFeedbackForm">
          <template v-if="!isSubmitted">
            <div class="heading2 mb-8">Let us know why you are contacting us:</div>
            <el-select
              v-model="formType"
              class="input-reason"
              placeholder="Select a reason"
            >
              <el-option
                v-for="option in feedbackFormTypeOptions"
                :key="option.key"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <hr v-if="isFeedbackForm && formType != undefined && formType != 'feedback'" class="mt-32 mb-32" />  
          </template>
        </template>
        <client-only>
          <component
            v-if="!isSubmitted"
            :is="formComponent"
            @submit="formSubmitted"
          />
        </client-only>
        <div v-if="isSubmitted" class="msg-success">
          <template v-if="firstName">
            <p>{{ firstName }},</p>
          </template>
          <p>
            Thank you for your submission!
          </p>
          <a href="#" @click="resetForms">Create another submission</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GeneralForm from '@/components/ContactUsForms/GeneralForm/GeneralForm.vue'
import BugForm from '@/components/ContactUsForms/BugForm/BugForm.vue'
import FeedbackForm from '@/components/ContactUsForms/FeedbackForm/FeedbackForm.vue'
import InterestForm from '@/components/ContactUsForms/InterestForm/InterestForm.vue'
import ResearchForm from '@/components/ContactUsForms/ResearchForm/ResearchForm.vue'
import ToolsAndResourcesForm from '@/components/ContactUsForms/ToolsAndResourcesForm/ToolsAndResourcesForm.vue'
import NewsAndEventsForm from '@/components/ContactUsForms/NewsAndEventsForm/NewsAndEventsForm.vue'
import CommunitySpotlightForm from '@/components/ContactUsForms/CommunitySpotlightForm/CommunitySpotlightForm.vue'
import { defaultTo } from 'ramda'
import MarkedMixin from '@/mixins/marked'

let formTypes = [
  {
    type: 'research',
    id: '3gBm9CkPV1QiqevHHtQxqP',
    subtypes: []
  },
  {
    type: 'feedback',
    id: '1PEIbcIV21upAq55ocnakO',
    subtypes: ['bug', 'portal-feedback', 'sparc-service', 'general']
  },
  {
    type: 'news-event',
    id: '6yyjWHw7jfpH4qOqDXwfmi',
    subtypes: []
  },
  {
    type: 'story',
    id: '5ZoMC1OGTj1ibNXJ5Na4Ja',
    subtypes: []
  },
  {
    type: 'tool',
    id: '2FGDIx61NO5VBV3GBiXH2C',
    subtypes: []
  }
]
const formComponents = {
  bug: BugForm,
  'portal-feedback': FeedbackForm,
  'sparc-service': InterestForm,
  general: GeneralForm,
  research: ResearchForm,
  tool: ToolsAndResourcesForm,
  'news-event': NewsAndEventsForm,
  story: CommunitySpotlightForm,
}

export default {
  name: 'ContactUsPage',

  components: {
    GeneralForm,
    BugForm,
    FeedbackForm,
    InterestForm,
    ResearchForm,
    ToolsAndResourcesForm,
    NewsAndEventsForm,
    CommunitySpotlightForm
  },

  mixins: [MarkedMixin],

  setup() {
    const { $contentfulClient } = useNuxtApp()
    const config = useRuntimeConfig()
    //useRecaptchaProvider()
    return $contentfulClient
      .getEntries({
        content_type: config.public.ctf_contact_us_form_type_id,
      })
      .then(({items}) => {
        const extendedFormTypes = formTypes.map(formType => {
          const entry = items.find(item => item.sys.id === formType.id)
          return {
            ...formType,
            label: entry.fields.title,
            description: entry.fields.description
          }
        })
        return {
          formTypes: extendedFormTypes
        }
      })
      .catch(console.error)
  },

  data: () => {
    return {
      heroCopy: '',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          to: {
            name: 'contact-us',
          },
          label: 'Contact Us'
        },
      ],
      formType: '',
      feedbackFormTypeOptions: [
        {
          label: 'I want to report an error or an issue',
          value: 'bug'
        },
        {
          label: 'I have feedback about the SPARC Portal',
          value: 'portal-feedback'
        },
        {
          label: 'I am interested in a SPARC Service',
          value: 'sparc-service'
        },
        {
          label: 'I have another question or inquiry',
          value: 'general'
        },
      ],
      isSubmitted: false,
      firstName: '',
    }
  },

  computed: {
    breadcrumbTitle() {
      if (this.formTypeObject != undefined)
        return this.formTypeObject.label
      return this.formTypes[0].label
    },
    isFeedbackForm() {
      const feedbackFormType = this.formTypes.find(formType => formType.type === 'feedback')
      return this.$route.query.type === 'feedback' || this.formType === feedbackFormType.type || feedbackFormType.subtypes.includes(this.formType)
    },
    formComponent: function() {
      if (this.$route.query.type === 'feedback') {
        return ''
      }
      return defaultTo(ResearchForm, formComponents[this.$route.query.type])
    },
    formTypeObject() {
      if (this.formType == undefined)
        return this.formTypes[0]
      return this.formTypes.find(formType => {
        if (formType.type === this.formType)
          return true
        if (formType.subtypes.includes(this.formType))
          return true
      })
    }
  },

  watch: {
    /**
     * Set formType data based on query param
     * @param {Object} to
     */
    $route: {
      handler(to) {
        this.formType = to.query.type === 'research' ? undefined : to.query.type
      },
      immediate: true
    },

    /**
     * Set query param based on formType data
     * @param {String} val
     */
    formType(val) {
      this.$router.push({ query: { ...this.$route.query, type: val } })
    }
  },

  methods: {
    /**
     * Reset all form data
     */
    resetForms: function() {
      this.isSubmitted = false
      this.firstName = ''
    },
    formSubmitted(firstName) {
      this.firstName = firstName
      this.isSubmitted = true
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.contact-us-page {
  background-color: #f5f7fa;
}
.page {
  display: flex;
  margin-top: 7rem;

  p {
    color: #606266;
  }
}
h2 {
  font-size: 1.5rem;
  line-height: 2rem;
}
.msg-success {
  font-size: 1.5rem;
  line-height: 2rem;
}
</style>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.subpage {
  margin-top: 1rem;
  margin-bottom: 0;
}
.tabs__container {
  margin-top: 2rem;
  padding-top: 0.5rem;
  background-color: white;
  border: 0.1rem solid $lineColor2;
  h3 {
    padding-left: 0.75rem;
    font-weight: 600;
    font-size: 1.5rem;
  }
}
.tabs {
  display: flex;
  list-style: none;
  overflow: auto;
  margin: 0 0 0 0;
  padding: 0 0;
  outline: 0.1rem solid $purple;
  @media (max-width: 40rem) {
    display: block;
  }
  li {
    width: 100%;
    text-align: center;
    color: $purple;
  }
  li:last-child > a {
    border-right: none;
  }
}
hr {
  border-top: none;
  border-left: none;
  border-width: 2px;
  border-color: $lineColor1;
  margin: 2rem 0;
}
.tabs__button {
  background: #f9f2fc;
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  outline: none;
  padding: 0;
  text-decoration: none !important;
  text-transform: uppercase;
  line-height: 3.5rem;
  @media (min-width: 40rem) {
    font-size: 0.65rem;
    border-right: 0.1rem solid $purple;
  }
  @media (min-width: 50rem) {
    font-size: .75rem;
  }
  @media (min-width: 64rem) {
    font-size: 1.25rem;
    font-weight: 600;
    text-transform: none;
  }
  &:hover,
  &.active {
    color: white;
    background-color: $purple;
    font-weight: 500;
  }
}
.contact-us-page {
  :deep(.el-form-item__label) {
    color: $grey;
    font-size: 1.5rem;
    line-height: 2.25rem;
    font-weight: 500;
    margin-bottom: .5rem;
    padding-bottom: 0;
  }
  :deep(.el-select) {
    max-width: 20rem;
    width: 100%;
  }
  :deep(.el-input,
  .el-textarea)
  :deep(.el-select-dropdown__item) {
    ::placeholder {
      color: $lightGrey;
    }
  }
  :deep(.el-textarea__inner) {
    border-color: $lightGrey;
    border-radius: 4px;
    padding-top: .75rem;
    padding-bottom: .75rem;
    font-family: inherit;
  }
  :deep(.el-textarea) {
    ::placeholder {
      color: $lightGrey;
    }
  }
  .input-reason {
    max-width: 36rem;
    width: 100%;
    ::placeholder {
      color: $grey;
    }
  }
}
</style>
