// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'pathe'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'SPARC Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: 'The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.',
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'nih sparc, sparc program, stimulating peripheral activity to relieve conditions, common fund sparc, sparc, sparc initiative, sparc neuro, sparc science'
        },
        // default social cards information for site sharing url's
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:title', property: 'og:title', content: 'SPARC Portal' },
        { hid: 'og:description', property: 'og:description', content: 'The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.' },
        { hid: 'og:image', property: 'og:image',
          content: 'https://images.ctfassets.net/6bya4tyw8399/7r5WTb92QnHkub8RsExuc1/2ac134de2ddfd65eb6316421df7578f9/sparc-logo-primary.png'
        },
        { hid: 'og:image:secure_url', property: 'og:image:secure_url',
          content: 'https://images.ctfassets.net/6bya4tyw8399/7r5WTb92QnHkub8RsExuc1/2ac134de2ddfd65eb6316421df7578f9/sparc-logo-primary.png'
        },
        { hid: 'robots', name: 'robots', content: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { hid: 'og:url', property: 'og:url', content: process.env.ROOT_URL || 'sparc.science' },
        { hid: 't-type', name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@sparc_science' },
        { name: 'twitter:title', content: 'SPARC Portal' },
        { name: 'twitter:image', content: 'https://images.ctfassets.net/6bya4tyw8399/7r5WTb92QnHkub8RsExuc1/2ac134de2ddfd65eb6316421df7578f9/sparc-logo-primary.png' },
        { name: 'twitter:description', content: 'The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.' }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico'
        },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap'
        }
      ]
    }
  },
  devtools: { enabled: true },
  modules: [
    '@element-plus/nuxt',
    'nuxt-svgo',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@zadigetvoltaire/nuxt-gtm',
    '@nuxtjs/turnstile',
    '@nuxtjs/sitemap',
    "nuxt-simple-robots"
  ],
  turnstile: {
    siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAATLCwNJ5HNQWRsX'
  },
  vite: {
    define: {
      'window.global': {}
    },
    /*css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sparc-design-system-components-2/dist/style.css" as *;',
        },
      },
    },*/
  },
  routeRules: {
    '/resources': { redirect: '/tools-and-resources/tools' },
    '/tools-and-resources': { redirect: '/tools-and-resources/tools' },
    '/resources/biological': { redirect: '/tools-and-resources/tools?resourceType=Biological' },
    '/resources/databases': { redirect: '/tools-and-resources/tools?resourceType=Data+and+Models' },
    '/resources/devices': { redirect: '/tools-and-resources/tools?resourceType=Devices' },
    '/resources/information-services': { redirect: '/tools-and-resources/tools?resourceType=Information+Services' },
    '/resources/software': { redirect: '/tools-and-resources/tools?resourceType=Software' },
    '/resources/osparc-services': { redirect: '/tools-and-resources/4LkLiH5s4FV0LVJd3htsvH' },
    '/resources/submit': { redirect: '/contact-us?type=tool' },
  },
  hooks: {
    'pages:extend'(pages) {
      pages.push(
        {
            name: 'version',
            path: '/datasets/:datasetId/version/:version',
            file: resolve('./pages/datasets/[datasetId].vue')
        },
        {
          name: 'tools',
          path: '/tools-and-resources/tools',
          file: resolve('./components/Resources/ResourcePage.vue')
        },
        {
          name: 'resources',
          path: '/tools-and-resources/resources',
          file: resolve('./components/Resources/ResourcePage.vue')
        },
        {
          name:'communication',
          path:'/communication-preferences',
          file: resolve('./components/NewsletterForm/NewsletterForm.vue')
        }
      )
    }
  },
  runtimeConfig: {
    public: {
      discover_api_host: process.env.PENNSIEVE_DISCOVER_API_HOST || 'https://api.pennsieve.io/discover',
      zipit_api_host: process.env.ZIPIT_API_HOST || 'https://api.pennsieve.io/zipit/discover',
      CTF_SPACE_ID: process.env.CTF_SPACE_ID,
      CTF_CDA_ACCESS_TOKEN: process.env.CTF_CDA_ACCESS_TOKEN,
      CTF_API_HOST: process.env.CTF_API_HOST || 'preview.contentful.com',
      ctf_home_page_id: '4qJ9WUWXg09FAUvCnbGxBY',
      ctf_portal_notification_entry_id: '5S8eazBlD1Y47pTO1EQfQ3',
      ctf_contact_us_form_options_id: '79rwRA0rUqUj6rc913BFsz',
      ctf_project_id: 'sparcAward',
      ctf_about_page_id: '4VOSvJtgtFv1PS2lklMcnS',
      ctf_about_details_content_type_id: 'aboutPageSecondLevel',
      ctf_news_id: 'news',
      ctf_event_id: 'event',
      ctf_resource_id: 'sparcPartners',
      ctf_news_and_events_page_id: '4IoMamTLRlN3OpxT1zgnU',
      ctf_about_portal_page_id: '2156L8jQgaifFNpgeylaQp',
      ctf_what_we_offer_page_id: '4wuZ2gzxota1GLTFUXSLNb',
      ctf_share_data_page_id: '5w2F52873w6g9TH4YMVxXW',
      ctf_team_and_leadership_page_id: '7EL9Plxo7q2GyCzg1sqIcg',
      ctf_get_involved_page_id: '1UUoE2ICWvdsQo0npvJcpq',
      ctf_osparc_resource_entry_id: '4LkLiH5s4FV0LVJd3htsvH',
      ctf_contact_us_form_type_id: 'contactUsForm',
      ctf_apps_page_id: '4LyfrYarHrt8Fke5ufyjdy',
      ctf_consortia_content_type_id: 'consortia',
      portal_api: process.env.PORTAL_API_HOST || 'https://sparc-api.herokuapp.com',
      flatmap_api: process.env.FLATMAP_API_HOST || 'https://mapcore-demo.org/current/flatmap/v3/',
      DEPLOY_ENV: process.env.DEPLOY_ENV || 'development',
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_INDEX: process.env.ALGOLIA_INDEX || 'k-core_dev',
      ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC: process.env.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC || 'k-core_dev_version_published_time_desc',
      ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_ASC: process.env.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_ASC || 'k-core_dev_version_published_time_asc',
      ALGOLIA_INDEX_PUBLISHED_TIME_DESC: process.env.ALGOLIA_INDEX_PUBLISHED_TIME_DESC || 'k-core_dev_published_time_desc',
      ALGOLIA_INDEX_PUBLISHED_TIME_ASC: process.env.ALGOLIA_INDEX_PUBLISHED_TIME_ASC || 'k-core_dev_published_time_asc',
      ALGOLIA_INDEX_ALPHABETICAL_A_Z: process.env.ALGOLIA_INDEX_ALPHABETICAL_A_Z || 'k-core_dev_alphabetical_a_z',
      ALGOLIA_INDEX_ALPHABETICAL_Z_A: process.env.ALGOLIA_INDEX_ALPHABETICAL_Z_A || 'k-core_dev_alphabetical_z_a',
      AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      AWS_USER_POOL_ID: process.env.AWS_USER_POOL_ID || 'us-east-1_FVLhJ7CQA',
      AWS_USER_POOL_WEB_CLIENT_ID: process.env.AWS_USER_POOL_WEB_CLIENT_ID || '',
      AWS_USER_AUTHENTICATION_FLOW_TYPE: process.env.AWS_USER_AUTHENTICATION_FLOW_TYPE || 'USER_PASSWORD_AUTH',
      AWS_OAUTH_DOMAIN: process.env.AWS_OAUTH_DOMAIN || 'pennsieve-dev-users2.auth.us-east-1.amazoncognito.com',
      AWS_OAUTH_SCOPE: process.env.AWS_OAUTH_SCOPE || "openid",
      AWS_OAUTH_RESPONSE_TYPE: process.env.AWS_OAUTH_RESPONSE_TYPE || "token",
      AWS_OAUTH_REDIRECT_SIGN_IN_URL: process.env.AWS_OAUTH_REDIRECT_SIGN_IN_URL || 'http://localhost:3000',
      AWS_OAUTH_REDIRECT_SIGN_OUT_URL: process.env.AWS_OAUTH_REDIRECT_SIGN_OUT_URL || 'http://localhost:3000',
      GITHUB_ORG: process.env.GITHUB_ORG || 'nih-sparc',
      GITHUB_REPO: process.env.GITHUB_REPO || 'sparc-app-2',
      LOGIN_API_URL: process.env.LOGIN_API_URL || 'https://api.pennsieve.net',
      PENNSIEVE_API_VERSION_2: process.env.PENNSIEVE_API_VERSION_2 || 'https://api2.pennsieve.net',
      SHOW_HIERARCHAL_FACETS: process.env.SHOW_HIERARCHAL_FACETS || 'false',
      SHOW_SDS_VIEWER: process.env.SHOW_SDS_VIEWER || 'false',
      SHOW_TIMESERIES_VIEWER: process.env.SHOW_TIMESERIES_VIEWER || 'false',
      SHOW_DATASET_SUBMISSION_FEATURE: process.env.SHOW_DATASET_SUBMISSION_FEATURE || 'false',
      METACELL_SDS_VIEWER_URL: process.env.METACELL_SDS_VIEWER_URL || 'https://metacell.github.io/sds-viewer',
      ORCID_API_URL: process.env.ORCID_API_URL || 'https://pub.orcid.org/v2.1',
      crosscite_api_host: process.env.CROSSCITE_API_HOST || 'https://citation.doi.org',
      max_download_size: parseInt(process.env.MAX_DOWNLOAD_SIZE || '5000000000'),
      osparc_host: process.env.OSPARC_HOST || 'https://osparc.io',
      MBF_SPARC_API: process.env.MBF_SPARC_API || 'https://mbfsparcapi.com',
      BL_API_URL: 'https://sparc.biolucida.net/api/v1/',
      BL_SERVER_URL: 'https://sparc.biolucida.net',
      BL_SHARE_LINK_PREFIX: 'https://sparc.biolucida.net/image?c=',
      NL_LINK_PREFIX: 'https://sparc.biolucida.net:8081',
      ROOT_URL: process.env.ROOT_URL || 'http://localhost:3000',
      METRICS_URL: process.env.METRICS_URL || 'https://metrics.sparc.science',
      BITLY_ACCESS_TOKEN: process.env.BITLY_ACCESS_TOKEN,
      bitly_expand_endpoint: 'https://api-ssl.bitly.com/v4/expand',
      PENNSIEVE_URL: process.env.PENNSIEVE_URL || 'https://app.pennsieve.io',
      INTERNAL_TRAFFIC_KEY: process.env.INTERNAL_TRAFFIC_KEY || 'internal_traffic',
      INTERNAL_TRAFFIC_VALUE: process.env.INTERNAL_TRAFFIC_VALUE || 'internal',
      SHOW_REHYDRATION_FEATURE: process.env.SHOW_REHYDRATION_FEATURE || 'false',
      SHOW_DEVICE_TYPE: process.env.SHOW_DEVICE_TYPE || 'false',
      PROTOCOLS_IO_HOST: process.env.PROTOCOLS_IO_HOST || 'https://www.protocols.io',
      PROTOCOLS_IO_TOKEN: process.env.PROTOCOLS_IO_TOKEN || '',
      GOOGLE_SEARCH_CONSOLE_VERIFICATION_ID: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION_ID || "",
      gtm: {
        id: process.env.GOOGLE_TAG_MANAGER_ID || 'GTM-TPT2CVCS',
        defer: true,
        compatibility: false,
        source: 'https://www.googletagmanager.com/gtm.js',
        enabled: process.env.ROOT_URL == 'https://sparc.science' ? true : false,
        debug: true,
        loadScript: true,
        enableRouterSync: true,
        trackOnNextTick: false,
        devtools: true,
      }
    },
    turnstile: {
      secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY
    }
  },
  /*
  ** Global CSS
  */
  css: ['sparc-design-system-components-2/dist/style.css', '@/assets/_base.scss'],
  sitemap: {
    cacheMaxAgeSeconds: 14400,
    sources: process.env.DEPLOY_ENV === 'production' ?
    [
      '/api/__sitemap__/urls'
    ] : [],
    exclude: process.env.DEPLOY_ENV === 'production' ? 
    [
      '/datasets/plotviewer',
      '/datasets/simulationviewer',
      '/datasets/timeseriesviewer',
      '/datasets/videoviewer',
      '/datasets/biolucidaviewer',
      '/datasets/flatmapviewer',
      '/datasets/imageviewer',
      '/datasets/scaffoldviewer',
    ] : ['/'],  
    xslColumns: [
      { label: 'URL', width: '100%' }
    ],
  },
  robots: {
    // provide simple disallow rules for all robots `user-agent: *`
    // disallowing certain pages that are either redirects, authenticated routes, or causing bots to recursively crawl
    disallow: process.env.DEPLOY_ENV === 'production' ? 
    [
      '/datasets/file',
      '/datasets/*/version/',
      '/file',
      '/welcome', 
      '/user', 
      '/contact-us', 
      '/contact-us/*?*',
      '/help', 
      '/signup', 
      '/maps',
      '/news-and-events/submit',
      '/news-and-events/community-spotlight/submit',
      '/*?*path=',
      '/*?*source_url=',
      '/*source_url=',
      '/communication-preferences'
    ] : ['/'],
    blockNonSeoBots: true,
    sitemap: `${process.env.ROOT_URL}/sitemap.xml`
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => [
        'bsky-embed'
      ].includes(tag)
    }
  }
})
