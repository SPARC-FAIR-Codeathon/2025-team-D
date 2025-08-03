import getHomepageFields from './homepageFields'

const defaultData = {
  heroHeading: '',
  heroCopy: '',
  heroButtonLabel: '',
  heroImage: {},
  heroButtonLink: '',
  featuredData: [],
  newsAndEvents: [],
  title: ''
}

describe('homepageFields', () => {
  it('Should return default data if no fields provided', () => {
    const fields = getHomepageFields({})
    expect(fields).toMatchObject(defaultData)
  })

  it('Should return default data if some fields are missing', () => {
    const fields = getHomepageFields({
      heroHeading: 'foo'
    })
    expect(fields).toMatchObject({ ...defaultData, heroHeading: 'foo' })
  })
})
