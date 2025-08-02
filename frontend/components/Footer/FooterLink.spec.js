import { shallowMount } from '@vue/test-utils'
import FooterLink from './FooterLink.vue'

const internalLink = {
  sys: {
    space: {},
    type: 'Entry',
    id: '123',
    contentType: {
      sys: { type: 'Link', linkType: 'ContentType', id: 'footerLink' }
    },
    revision: 1,
    createdAt: '2021-01-29T15:58:46.012Z',
    updatedAt: '2021-01-29T15:59:19.265Z',
    environment: {
      sys: { id: 'master', type: 'Link', linkType: 'Environment' }
    },
    locale: 'en-US'
  },
  fields: { title: 'About', url: '/about' }
}

const externalLink = {
  sys: {
    space: {},
    type: 'Entry',
    id: '456',
    contentType: {
      sys: { type: 'Link', linkType: 'ContentType', id: 'footerLink' }
    },
    revision: 1,
    createdAt: '2021-01-29T15:58:46.012Z',
    updatedAt: '2021-01-29T15:59:19.265Z',
    environment: {
      sys: { id: 'master', type: 'Link', linkType: 'Environment' }
    },
    locale: 'en-US'
  },
  fields: { title: 'External Link', url: 'https://google.com' }
}

const longUrlLink = {
  sys: {
    space: {},
    type: 'Entry',
    id: '456',
    contentType: {
      sys: { type: 'Link', linkType: 'ContentType', id: 'footerLink' }
    },
    revision: 1,
    createdAt: '2021-01-29T15:58:46.012Z',
    updatedAt: '2021-01-29T15:59:19.265Z',
    environment: {
      sys: { id: 'master', type: 'Link', linkType: 'Environment' }
    },
    locale: 'en-US'
  },
  fields: {
    title: 'External Link',
    url: 'https://google.com',
    longUrl: 'https://sparc.science'
  }
}

describe('FooterLink.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallowMount(FooterLink, {
      stubs: {
        NuxtLink: true
      }
    })
  })

  it('Should be nuxt link when link is internal', async () => {
    await cmp.setProps({ link: internalLink })
    expect(cmp.find('[data-jest="nuxt-link"]').exists()).toBe(true)
  })

  it('Should be normal link when link is internal', async () => {
    await cmp.setProps({ link: externalLink })
    expect(cmp.find('NuxtLink').exists()).toBe(false)
  })

  it('Should use the long URL when available.', async () => {
    await cmp.setProps({ link: longUrlLink })
    expect(cmp.find('a').attributes().href).toEqual(longUrlLink.fields.longUrl)
  })
})
