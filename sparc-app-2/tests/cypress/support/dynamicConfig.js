import axios from 'axios'

function randomAssign(itemString, number) {
    let itemArray = []
    const items = [...new Set(itemString.split(',').map(item => item.trim()).filter(item => item))]
    while (itemArray.length < number) {
        const item = items[Math.floor(Math.random() * items.length)]
        if (!itemArray.includes(item)) {
            itemArray.push(item)
        }
    }
    return itemArray.join(', ')
}

async function generateDatasetIds(config) {
    let datasetIds
    await axios
        .get(`${config.env.PORTAL_API}/all_dataset_ids`)
        .then((response) => {
            datasetIds = randomAssign(response.data, 5)
        })
        .catch((error) => {
            console.error('Error:', error.message)
        });
    return datasetIds
}

export default async function dynamicConfig(config) {
    for (const env in DYNAMICENVS) {
        if (!config.env[env] || config.env[env] === 'randompick') {
            config.env[env] = randomAssign(DYNAMICENVS[env].value, DYNAMICENVS[env].number)
        }
    }
    if (!config.env.DATASET_IDS || config.env.DATASET_IDS === 'randompick') {
        config.env.DATASET_IDS = await generateDatasetIds(config)
    }
    return config
}

const DYNAMICENVS = {
    'PAGE_LIMIT': { 'value': '10, 20, 50, View All', 'number': 1 }, // fixed, no need to change
    'SEARCH_KEYWORDS': {
        'value': 'Brainstem, Lung, Rat, Liver, Brain, Human',
        'number': 2
    },
    'FILTER_FACETS': {
        'value': 'Tissue, Rat, Anatomy, Female, Embryo',
        'number': 2 // fixed, no need to change
    },
    'TAXON_MODELS': {
        'value': 'Human Female, Human Male, Rat, Mouse, Pig, Cat', // fixed, no need to change
        'number': 2
    },
    'SEARCH_IN_MAP': {
        'value': 'Heart, Liver, Spleen, Lung, Kidney, Brainstem, Stomach, Colon, Body proper',
        'number': 1 // fixed, no need to change
    },
    'SCAFFOLD_DATASET_IDS': {
        'value': '136, 307, 292, 328, 155, 102, 227, 147, 186, 167, 112, 156, 174, 173, 217, 219, 100, 154, 105, 146, 223, 218, 166, 101, 103, 232, 259, 182, 134, 104, 172, 170, 144',
        'number': 2
    },
}