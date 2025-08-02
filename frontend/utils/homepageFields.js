/**
 * Get homepage fields, but default to empty values
 * @param {Object} field
 * @returns {Object}
 */
export default (fields = {}) => {
  return {
    heroHeading: fields.heroHeading || '',
    heroCopy: fields.heroCopy || '',
    heroImage: fields.heroImage || {},
    featuredData: fields.featuredData || [],
    newsAndEvents: fields.newsAndEvents || [],
    portalFeatures: fields.portalFeatures || [],
    exploreData: fields.exploreData || [],
    featuredProject: fields.featuredProject || {},
    datasetSectionTitle: fields.datasetSectionTitle || 'Here is a dataset you might be interested in: ',
    title: fields.title || ''
  }
}
