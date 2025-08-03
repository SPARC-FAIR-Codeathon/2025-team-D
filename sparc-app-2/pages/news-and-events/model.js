import { searchQueryReplacements } from '@/utils/utils'
const CTF_EVENT_ID = 'event'
const CTF_NEWS_ID = 'news'
const CTF_COMMUNITY_SPOTLIGHT_ITEM_ID = 'communitySpotlight'
const CTF_NEWS_AND_EVENTS_PAGE_ID = '4IoMamTLRlN3OpxT1zgnU'

const replaceTerms = (terms) => {
  let result = terms
  if (result) {
    Object.entries(searchQueryReplacements).forEach(([term, replacement]) => result = result?.replace(term, replacement))
  }
  return result
}

export const fetchData = async (client, terms, limit) => {
  const query = replaceTerms(terms)
  try {
    const todaysDate = new Date()

    const upcomingEvents = await client.getEntries({
      content_type: CTF_EVENT_ID,
      order: 'fields.startDate',
      'fields.startDate[gte]': todaysDate.toISOString(),
      query,
      limit
    })

    const news = await fetchNews(client, query, undefined, undefined, undefined, undefined, limit)

    const page = await client.getEntry(CTF_NEWS_AND_EVENTS_PAGE_ID ?? '')

    const stories = await fetchCommunitySpotlightItems(client, query, undefined, undefined, undefined, 2, 0)

    return {
      upcomingEvents,
      news,
      page,
      stories
    }
  } catch (e) {
    console.error(e)
    return {
      upcomingEvents: {},
      news: {},
      page: {},
      stories: {}
    }
  }
}

export const fetchEvents = async (client, terms, eventStartLessThanDate, eventStartGreaterThanOrEqualToDate, eventTypes, sortOrder, limit, skip) => {
  const query = replaceTerms(terms)
  try {
    return await client.getEntries({
      content_type: CTF_EVENT_ID,
      order: sortOrder || '-fields.startDate',
      query,
      limit,
      skip,
      'fields.startDate[lt]': eventStartLessThanDate,
      'fields.startDate[gte]': eventStartGreaterThanOrEqualToDate,
      'fields.eventType[in]': eventTypes
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}

export const fetchNews = async (client, terms, publishedLessThanDate, publishedGreaterThanOrEqualToDate, subjects, sortOrder, limit, skip) => {
  const query = replaceTerms(terms)
  try {
    return await client.getEntries({
      content_type: CTF_NEWS_ID,
      order: sortOrder || '-fields.publishedDate',
      query,
      limit,
      skip,
      'fields.publishedDate[lt]': publishedLessThanDate,
      'fields.publishedDate[gte]': publishedGreaterThanOrEqualToDate,
      'fields.subject[in]': subjects
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}

// In order to allow for sorting or fireside chats and success stories we needed
// to restructure the content types in contentful to share a common model since you cannot query on 
// multiple content types while applying a field filter or order in contentful api as outlined here:
// https://www.contentfulcommunity.com/t/how-to-query-on-multiple-content-types/473
export const fetchCommunitySpotlightItems = async (client, terms, spotlightTypes, anatomicalStructures, sortOrder, limit, skip) => {
  const query = replaceTerms(terms)
  try {
    return await client.getEntries({
      content_type: CTF_COMMUNITY_SPOTLIGHT_ITEM_ID,
      order: sortOrder || '-fields.publishedDate',
      query,
      limit,
      skip,
      'fields.itemType[in]': spotlightTypes?.toString(),
      'fields.anatomicalStructure[in]': anatomicalStructures?.toString()
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}
