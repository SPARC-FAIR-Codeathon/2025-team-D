import algoliasearch from 'algoliasearch'
import contentful from 'contentful'
import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  try {
    const PORTAL_BASE_URL = process.env.ROOT_URL

    // Algolia creds
    const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID
    const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY
    const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX || 'k-core_dev'

    const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
    const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX)

    // Contentful
    const CTF_SPACE_ID = process.env.CTF_SPACE_ID
    const CTF_CDA_ACCESS_TOKEN = process.env.CTF_CDA_ACCESS_TOKEN
    const CTF_API_HOST = process.env.CTF_API_HOST || 'preview.contentful.com'

    const contentfulClient = contentful.createClient({
      space: CTF_SPACE_ID,
      accessToken: CTF_CDA_ACCESS_TOKEN,
      host: CTF_API_HOST
    })

    let urls = []

    // Fetching Algolia records

    const datasetResp = await algoliaIndex.search('', {
      hitsPerPage: 9999,
      facets: '["*"]'
    })

    datasetResp.hits.forEach(dataset => {
      urls.push(PORTAL_BASE_URL + '/datasets/' + dataset.objectID)
    })

    // Fetching PROJECTS IDs
    const projectResp = await contentfulClient.getEntries({
      content_type: 'sparcAward',
      limit: 1000
    })

    projectResp.items.forEach(project => {
      urls.push(PORTAL_BASE_URL + '/about/projects/' + project.sys.id)
    })

    // TOOLS & RESOURCES

    // Fetching DATABASES IDs
    const databasesResp = await contentfulClient.getEntries({
      content_type: 'sparcPartners',
      limit: 1000,
      'fields.resourceType[in]': 'Data and Models'
    })

    databasesResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // Fetching SOFTWARE IDs

    const softwareResp = await contentfulClient.getEntries({
      content_type: 'sparcPartners',
      limit: 1000,
      'fields.resourceType[in]': 'Software'
    })

    softwareResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // Fetching INFORMATION SERVICES IDs

    const infoResp = await contentfulClient.getEntries({
      content_type: 'sparcPartners',
      limit: 1000,
      'fields.resourceType[in]': 'Information Services'
    })

    infoResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // Fetching DEVICES IDs
    const deviceResp = await contentfulClient.getEntries({
      content_type: 'sparcPartners',
      limit: 1000,
      'fields.resourceType[in]': 'Devices'
    })

    deviceResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // Fetching BIOLOGICAL IDs

    const bioResp = await contentfulClient.getEntries({
      content_type: 'sparcPartners',
      limit: 1000,
      'fields.resourceType[in]': 'Biologicals'
    })

    bioResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // NEWS & EVENTS

    // Fetching NEWS IDs
    const newsResp = await contentfulClient.getEntries({
      content_type: 'news',
      limit: 1000
    })

    newsResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // Fetching EVENTS IDs
    const eventsResp = await contentfulClient.getEntries({
      content_type: 'event',
      limit: 1000
    })

    eventsResp.items.forEach(db => {
      if (db.fields.url && db.fields.url.includes(PORTAL_BASE_URL)) {
        urls.push(db.fields.url)
      }
    })

    // Fetching COMMUNITY SPOTLIGHT IDs

    const commResp = await contentfulClient.getEntries({
      content_type: 'communitySpotlight',
      limit: 1000,
      'fields.itemType[in]': undefined,
      'fields.anatomicalStructure[in]': undefined
    })

    commResp.items.forEach(db => {
      if (db.fields.linkedItem && db.fields.linkedItem.fields.storyRoute) {
        urls.push(PORTAL_BASE_URL + '/news-and-events/community-spotlight/success-stories/' + db.fields.linkedItem.fields.storyRoute)
      }
    })

    return urls.map((url) => {
      // strip any parameters set on the url
      const parsedUrl = new URL(url)
      return { loc: parsedUrl.origin + parsedUrl.pathname }
    })
  } catch (err) {
    console.error('Error fetching dynamic routes:', err)
  }
})