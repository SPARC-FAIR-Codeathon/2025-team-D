import { SearchIndex } from "algoliasearch";
// Mapping between display categories and their Algolia index property path
// Used for populating the Dataset Search Results facet menu dynamically
export const facetPropPathMapping = [
  {
    label: 'Type',
    id: 'item.types',
    facetPropPath: 'item.types.name',
    facetSubpropPath: 'item.types.subcategory.name'
  },
  {
    label: 'Anatomical Structure',
    id: 'anatomy.organ.category',
    facetPropPath: 'anatomy.organ.category.name',
    facetSubpropPath: 'anatomy.organ.subcategory.name'
  },
  // This cannot be removed until the maps sidebar implements heirarchal facets. So in the meantime we simply don't make this category visible on the facet menu
  {
    label: 'Anatomical Structure',
    id: 'anatomy.organ',
    facetPropPath: 'anatomy.organ.name',
    facetSubpropPath: 'anatomy.organ.subcategory.name'
  },
  {
    label: 'Species',
    id: 'organisms.primary.species',
    facetPropPath: 'organisms.primary.species.name',
    facetSubpropPath: 'organisms.primary.species.subcategory.name'
  },
  {
    label: 'Experimental Approach',
    id: 'item.modalities',
    facetPropPath: 'item.modalities.keyword',
    facetSubpropPath: 'item.modalities.subcategory.name'
  },
  {
    label: 'Sex',
    id: 'attributes.subject.sex',
    facetPropPath: 'attributes.subject.sex.value',
    facetSubpropPath: 'attributes.subject.sex.subcategory.name'
  },
  {
    label: 'Age Categories',
    id: 'attributes.subject.ageCategory',
    facetPropPath: 'attributes.subject.ageCategory.value',
    facetSubpropPath: 'attributes.subject.ageCategory.subcategory.name'
  },
  {
    label: 'Consortia',
    id: 'supportingAwards.consortium',
    facetPropPath: 'supportingAwards.consortium.name',
    facetSubpropPath: 'supportingAwards.consortium.subCategory.name'
  },
]

export const getAlgoliaFacets = function(algoliaIndex : SearchIndex, propPathMapping : Array<{id: string, facetPropPath: string, facetSubpropPath: string, label: string}>, filters : string) {
  const facetPropPaths = propPathMapping.map(item => item.facetPropPath)
  const facetSubpropPaths = propPathMapping.map(item => item.facetSubpropPath)
  var facetData: { label: string, id: string, children: object[], key: string }[] = []
  return algoliaIndex
    .search('', {
      hitsPerPage: 0,
      sortFacetValuesBy: 'alpha',
      facets: facetPropPaths.concat(facetSubpropPaths),
      filters: filters || ''
    })
    .then(response => {
      facetPropPaths.map((facetPropPath: string) => {
        const parentFacet = propPathMapping.find(item => item.facetPropPath == facetPropPath)
        var children: { label: string, id: string, children: Object, facetPropPath: string }[] = []
        const responseFacets = response.facets
        if (responseFacets === undefined) {return}
        const responseFacetChildren =
          responseFacets[facetPropPath] == undefined
            ? {}
            : responseFacets[facetPropPath]
        const allPossibleChildrenSubfacets = parentFacet && responseFacets[parentFacet.facetSubpropPath] ? Object.keys(responseFacets[parentFacet.facetSubpropPath]) : []
        Object.keys(responseFacetChildren).map(facet => {
          const childrenSubfacets = allPossibleChildrenSubfacets.reduce((filtered, childFacetInfo) => {
            const info = childFacetInfo.split('.')
            if (info.length != 2) {
              return filtered
            }
            if (facet == info[0]) {
              filtered.push({
                label: childFacetInfo, 
                id: childFacetInfo,
                facetPropPath: `${parentFacet?.facetSubpropPath}`
              })
            }
           return filtered;
          }
          , Array<{label: string, id: string, facetPropPath: string}>())
          children.push({
            label: facet,
            id: facet,
            children: childrenSubfacets,
            facetPropPath: facetPropPath
          })
        })
        if (children.length > 0) {
          facetData.push({
            label: parentFacet?.label || '',
            id: parentFacet?.label || '',
            children: children,
            key: facetPropPath
          })
        }
      })
      return facetData
    }).catch(() => {
      return {}
    })
}