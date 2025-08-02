const speciesMap = {
  'NCBITaxon:10114': 'rat',
  'NCBITaxon:10090': 'mouse',
  'NCBITaxon:9823': 'pig',
  'NCBITaxon:9606': 'human',
  'NCBITaxon:9685': 'cat'
}

const buildAnatomySqlStatement = function(anatomy) {
  let anatomyString = ''
  if (anatomy.length === 1) {
    anatomyString = '(?)'
  } else if (anatomy.length > 1) {
    anatomyString = '('
    for (let i in anatomy) {
      anatomyString += `?${i >= anatomy.length - 1 ? ')' : ','} `
    }
  }
  let sql = `select id, entity from (select id, models from flatmaps group by models having max(created)) left join flatmap_entities on id = flatmap where models = ? and entity in ${anatomyString}`
  return sql
}

const anatomyQuery = async (taxo, anatomy) => {
  const { $flatmapApiClient } = useNuxtApp()
  const params = [taxo, ...anatomy]
  const sqlData = { sql: buildAnatomySqlStatement(anatomy), params }
  return $flatmapApiClient.post('knowledge/query/', sqlData)
}

export default {
  anatomyQuery,
  speciesMap
}
