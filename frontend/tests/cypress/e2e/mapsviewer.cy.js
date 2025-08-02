import { retryableBefore, stringToArray } from '../support/utils.js'

// x: The distance in pixels from the element's left
// y: The distance in pixels from the element's top
// central coordinate around { 'x': 768, 'y': 373 }
const coordinate = { 'x': 800, 'y': 333 }
const pixelChange = 3
const mapTypes = ['ac', 'wholebody', 'fc']

/**
 * Human Female, Human Male, Rat, Mouse, Pig, Cat
 */
const defaultModel = 'Human Male'
const taxonModels = stringToArray(Cypress.env('TAXON_MODELS'), ',')
let loadedModels = new Set()

const searchInMap = Cypress.env('SEARCH_IN_MAP')

const scaffoldDatasetIds = stringToArray(Cypress.env('SCAFFOLD_DATASET_IDS'), ',')

mapTypes.forEach((map) => {

  describe(`Maps Viewer - ${map}`, { testIsolation: false }, function () {

    retryableBefore(function () {
      cy.visit(`/maps?type=${map}`)
    })

    beforeEach(function () {
      cy.intercept('**/query?**').as('query')
      cy.intercept('**/flatmap/**').as('flatmap')
      cy.intercept('**/dataset_info/**').as('dataset_info')
      cy.intercept('**/datasets/**').as('datasets')
      cy.intercept('**/get_body_scaffold_info/**').as('get_body_scaffold_info')
      cy.intercept('**/s3-resource/**').as('s3-resource')
      cy.waitForViewerContainer('.mapClass')
      cy.waitForPageLoading()
      if (map === 'ac') {
        cy.waitForMapLoading()
      } else if (map === 'wholebody') {
        cy.waitForScaffoldLoading()
        cy.waitForMapTreeControlLoading()
      } else if (map === 'fc') {
        cy.waitForFlatmapLoading()
      }
      // Close sidebar
      cy.get('body').then(($body) => {
        if ($body.find('.close-tab > .el-icon').length !== 0) {
          cy.get('.tabs-container > :nth-child(1) > .tab-title').as('datasetExplorer').click()
          cy.get('.close-tab > .el-icon').as('sidebarCloseTab').click()
        }
      })
      // Switch back to default viewing mode
      cy.get('.viewing-mode-selector > .toolbar-dropdown').as('changeViewingMode')
      cy.get('.el-dropdown-menu__item > span').as('viewingModes')
      cy.get('@changeViewingMode').trigger('mouseenter')
      cy.get('@viewingModes').contains('Exploration').click()
      cy.get('@changeViewingMode').trigger('mouseleave')
      cy.wait(5000)
    })

    if (map === 'ac') {
      it('Open new map and alter filtering', function () {
        cy.get('.portal-features > :nth-child(1) .el-button').as('viewACMap')
        cy.get('@viewACMap').click()
        cy.get('.popover-content > .el-button:visible').first().click()
        cy.get('@viewACMap').click()
        cy.get('.pane-1 > .content-container > .toolbar > .toolbar-flex-container').then(($select) => {
          expect($select, 'Multiple maps should be loaded').to.exist
        })
        cy.waitForPageLoading()
        cy.waitForMapLoading()
        // Take a screenshot of original flatmap
        cy.get('.maplibregl-touch-zoom-rotate > .maplibregl-canvas:visible').as('canvas')
        // CLI
        cy.get('@canvas').screenshot('base/tests/cypress/e2e/mapsviewer.cy.js/mapalert')
        // UI
        cy.get('@canvas').screenshot('mapsviewer.cy.js/base/tests/cypress/e2e/mapsviewer.cy.js/mapalert')
        cy.get('.open-tab > .el-icon').as('sidebarOpenTab').click()
        cy.get('.tabs-container > :nth-child(2) > .tab-title').as('connectivityExplorer').click()
        cy.get('.search-filters > .el-cascader > .el-input > .el-input__wrapper:visible').as('connectivityFilter').click()
        // Check if alert exist in Human Female
        cy.get('.el-cascader-panel > :nth-child(1) > .el-cascader-menu__wrap > .el-scrollbar__view:visible', { timeout: 30000 }).then(($label) => {
          if ($label.text().includes('Alert')) {
            expect($label, 'Alter filter should exist').to.contain('Alert')
            // Compare previous screenshot with alter paths highlighted
            cy.get('.el-cascader-node__label').contains('Alert').click()
            cy.get('.el-cascader-node__label').contains('With alerts').click()
            cy.get('.tabs-container > :nth-child(1) > .tab-title').as('datasetExplorer').click()
            cy.get('.close-tab > .el-icon').as('sidebarCloseTab').click()
            // wait for highlighting alert connectivity
            cy.wait(5000)
            cy.get('@canvas').compareSnapshot('mapalert').then(comparisonResults => {
              expect(comparisonResults.percentage).to.greaterThan(0)
            })
          }
        })
        // Close new opened dialog
        cy.get('.header > .icon-group > .map-icon:visible').first().click()
        cy.contains('Vertical split').click()
        cy.get('.pane-1 > .content-container > .toolbar > .el-row > .map-icon').click()
      })

      it('In-display search', function () {
        // Search keyword in displayed viewers
        cy.get('.el-autocomplete > .el-input > .el-input__wrapper > .el-input__inner').as('searchInput')
        cy.get('@searchInput').clear()
        cy.get('@searchInput').type('neuron type aacar 11')
        cy.get('.search-container > .map-icon > use').as('mapSearchIcon')
        cy.get('@mapSearchIcon').click()
        cy.wait(5000)
        // Check for the sidebar tabs
        cy.get('.tabs-container > .tab').as('tabs')
        cy.get('@tabs').should(($title) => {
          expect($title, 'The sidebar should have 2 tabs').to.have.length(2)
        })
        cy.get('.active-tab > .tab-title').as('activeTab')
        cy.get('@activeTab').should(($tab) => {
          expect($tab, 'Active tab should be Connectivity Explorer after searching').to.have.text('Connectivity Explorer')
        })
        // Search keyword in displayed viewers
        cy.get('@searchInput').clear()
        cy.get('@searchInput').type(`"${searchInMap}"`)
        cy.get('.search-container > .map-icon > use').click()
        // Check for keyword(highlighted part) in displayed viewers
        cy.get('.maplibregl-popup-content').contains(new RegExp(searchInMap, 'i')).should(($tooltip) => {
          expect($tooltip, 'The tooltip should contain the search keyword').to.exist
        })
        // Switch to Annotation viewing mode
        cy.get('.viewing-mode-selector > .toolbar-dropdown').as('changeViewingMode').trigger('mouseenter')
        cy.get('.el-dropdown-menu__item > span').as('viewingModes').contains('Annotation').click()
        cy.get('@changeViewingMode').trigger('mouseleave')
        cy.waitForMapLoading()
        cy.get('.toolbar-icons').should(($toolbar) => {
          expect($toolbar, 'Annotation toolbar should be displayed').to.exist
        })
        // Search keyword in displayed viewers
        cy.get('@searchInput').clear()
        cy.get('@searchInput').type('neuron type aacar 11')
        cy.get('@mapSearchIcon').click()
        cy.wait(5000)
        // Check for the sidebar tabs
        cy.get('@tabs').should(($title) => {
          expect($title, 'The sidebar should have 3 tabs').to.have.length(3)
        })
        cy.get('@activeTab').should(($tab) => {
          expect($tab, 'Active tab should be Annotation after searching').to.have.text('Annotation')
        })
      })

      taxonModels.forEach((model, index) => {

        it(`Connectivity explorer for ${model}`, function () {
          // Remove model from the loadedModels on retry
          // to prevent loading issue
          Cypress.on('test:after:run', (result) => {
            if (result.currentRetry < result.retries && result.state === 'failed') {
              loadedModels.delete(model);
            }
          })
          cy.print({
            title: 'loaded model',
            message: `Current loaded model - ${Array.from(loadedModels).join(',')}`,
            type: 'info'
          })
          if (index === 0) {
            loadedModels.add(defaultModel)
            cy.print({
              title: 'model',
              message: `${defaultModel} model has been loaded`,
              type: 'info'
            })
          }
          // Switch to the different flatmap
          cy.get('.el-select.select-box.el-tooltip__trigger.el-tooltip__trigger > .el-select__wrapper').click({ force: true }).then(() => {
            cy.get('.el-select-dropdown__item:visible').should(($dropdown) => {
              expect($dropdown, 'Dropdown should have multiple items').to.have.length(6)
            })
            cy.get('.el-select-dropdown__item:visible').contains(new RegExp(model, 'i')).click({ force: true }).then(() => {
              if (!loadedModels.has(model)) {
                cy.wait('@flatmap', { timeout: 20000 })
                cy.waitForMapLoading()
                loadedModels.add(model)
                cy.print({
                  title: 'model',
                  message: `${model} model has been loaded`,
                  type: 'info'
                })
              }
            })
          })
          // Click to show connectivity in the explorer
          // Not able to click on a specific neuron. Click on different coordinates instead.
          cy.clickOnNeuron(coordinate, pixelChange)
          cy.wait(5000) // Wait for the sidebar to open
          cy.get('.filters > .dataset-shown > .dataset-results-feedback:visible').then(($result) => {
            if (!$result.text().match(/^1 Results \| Showing/i)) {
              cy.get('.connectivity-card-container > .connectivity-card > .card').first().click()
            }
            // Check for the provenance content
            cy.get('.connectivity-info-title').within(($content) => {
              cy.get('.block > .title').then(($title) => {
                expect($title, 'The provenance card should have the neuron name').to.exist
                const neuronName = $title.text().trim()
                cy.print({
                  title: 'neuron',
                  message: `Clicked on the ${neuronName}`,
                  type: 'info'
                })
                // Check for copy button
                cy.get('.el-button.copy-clipboard-button:visible').click()
                cy.wait(5000)
                cy.window().then(win => {
                  win.navigator.clipboard.readText().then(text => {
                    expect(text, 'The content should be copied to clipboard').to.contain(neuronName)
                  })
                })
              })
              cy.get('.block > .subtitle').should(($description) => {
                expect($description, 'The provenance card should have the neuron description').to.exist
              })
              cy.get('.el-button').should(($button) => {
                expect($button, 'The provenance card should have the button to open publications in PubMed').to.exist
              })
              // Check for PubMed button click
              if ($content.text().includes('Open publications in PubMed')) {
                cy.window().then((window) => {
                  cy.stub(window, 'open').as('Open')
                })
                cy.get('#open-pubmed-button').click()
                cy.get('@Open').should('have.been.calledOnceWithExactly', Cypress.sinon.match(/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov(?:\/.*)/), '_blank')
                cy.get('@Open').should('be.calledWith', Cypress.sinon.match.string).then((stub) => {
                  const url = stub.args[0][0]
                  const termUrl = decodeURIComponent(url.slice(url.indexOf('?term=')))
                  const invalidTermFound = ['pubmed', 'doi.org'].some(term => termUrl.includes(term))
                  expect(!invalidTermFound, 'Should not contain pubmed or doi.org').to.be.true
                })
              }
            })
            cy.get('.population-display > .buttons-row').as('populationDisplay')
            // List view
            cy.get('@populationDisplay').contains('List view').click()
            // Check for the provenance button click
            cy.get('.step-item > .main').then(($content) => {
              cy.wrap($content).get('.attribute-title-container').should(($title) => {
                expect($title, 'The provenance sections should have titles').to.exist
                expect($title.length, 'The provenance should have multiple sections').to.be.greaterThan(0)
              })
              // Check for button click
              cy.get('.active-tab > .tab-title').as('activeTab')
              cy.get('.tabs-container > :nth-child(2) > .tab-title').as('connectivityExplorer')
              const buttonTexts = ['Explore origin data', 'Explore destination data', 'Search for data on components']
              buttonTexts.forEach((text) => {
                if ($content.text().includes(text)) {
                  cy.contains(new RegExp(text, 'i')).click({ force: true })
                  cy.get('@activeTab').should(($tab) => {
                    expect($tab, 'Active tab should be Dataset Explorer after clicking on the button').to.contain('Dataset Explorer')
                  })
                  cy.get('@connectivityExplorer').click({ force: true })
                }
              })
            })
            // Graph view
            cy.get('@populationDisplay').contains('Graph view').click()
            cy.waitForConnectivityGraphLoading()
            cy.get('.connectivity-graph > .graph-canvas').then(($graph) => {
              expect($graph, 'The connectivity graph should exist').to.exist
            })
            cy.get('.connectivity-graph > .control-panel-tools').then(($panelTools) => {
              expect($panelTools, 'The control panel tools should exist').to.exist
            })
            cy.get('.tools > .control-button:visible').then(($tools) => {
              expect($tools, 'The control panel tools should have 2').to.have.length(2)
            })
            cy.get('.tools > :nth-child(2).control-button:visible').click()
            cy.get('.connectivity-graph > .control-panel-nodes').then(($panelNodes) => {
              expect($panelNodes, 'The control panel nodes should exist').to.exist
              cy.wrap($panelNodes).get('.node-key > .key-box-container > .key-box').then(($keys) => {
                expect($keys, 'The control panel nodes should have at least one key').to.have.length.greaterThan(0)
              })
            })
            // Check for references
            cy.get('.step-item > .main').then(($content) => {
              if ($content.text().includes('References')) {
                cy.get('.resource-container > .attribute-title-container').then(($title) => {
                  expect($title, 'Reference section should exist').to.exist
                })
                cy.get('.citation-tabs > .el-button').each(($citation) => {
                  cy.wrap($citation).click()
                  cy.waitForSidebarReferenceLoading()
                  cy.get('.citation-list > li').then(($content) => {
                    expect($content, 'Citation content should exist').to.exist
                  })
                })
              }
            })
            cy.get('.el-card__body > .content:visible').scrollTo('top')
          })
        })
      })

      scaffoldDatasetIds.forEach((datasetId, index) => {

        it(`Context card for scaffold dataset ${datasetId}`, function () {
          // Open the sidebar
          cy.get('.open-tab > .el-icon').as('sidebarOpenTab').click()
          cy.get('.sidebar-content-container > .el-card__header > .header > .is-link').as('resetButton').click()
          // Enter dataset id
          cy.get('.search-input > .el-input__wrapper:visible').as('searchBox')
          cy.get('@searchBox').clear()
          cy.get('@searchBox').type(`${datasetId} scaffold`)
          // Show 50 datasets by default
          cy.get('.filters > .dataset-shown > .number-shown-select:visible').click()
          cy.get('.el-select-dropdown__item:visible').contains('50').click()
          // Clear all the history if exist
          if (index === 0) {
            cy.get('.box-card > .sidebar-container > .el-card > .el-card__body:visible').then(($content) => {
              if ($content.text().includes('Search history')) {
                cy.get('.history-container .el-dropdown:visible').click()
                cy.get('.el-dropdown__popper > .el-scrollbar .el-dropdown-menu > .el-dropdown-menu__item:visible').then(($item) => {
                  for (let index = 0; index < $item.length; index++) {
                    cy.get('.el-dropdown__popper > .el-scrollbar .el-dropdown-menu > .el-dropdown-menu__item > :nth-child(2) > :nth-child(2):visible').first().click()
                  }
                })
              }
            })
          }
          // Search dataset
          cy.get('.sidebar-content-container > .el-card__header > .header > .el-button--primary').as('sidebarSearchButton').click()
          cy.wait(5000)
          cy.wait('@query', { timeout: 20000 }).then((intercept) => {
            cy.get('.dataset-results-feedback:visible', { timeout: 30000 }).then(($result) => {
              // Check for empty history tag message
              if (index === 0) {
                cy.get('.history-container .empty-saved-search').then(($message) => {
                  expect($message, 'Empty tag message should exist').to.contain('No Saved Searches')
                })
              }
              cy.get('.history-container .el-dropdown:visible').as('historyDropdown')
              // Open history dropdown
              cy.get('@historyDropdown').click()
              cy.get('.el-dropdown__popper > .el-scrollbar .el-dropdown-menu > .el-dropdown-menu__item:visible').then(($item) => {
                expect($item, 'Maximum 12 history should be listed').to.have.length.of.at.most(12)
              })
              // Save searches
              cy.get('.el-dropdown__popper > .el-scrollbar .el-dropdown-menu > .el-dropdown-menu__item > :nth-child(2) > :nth-child(1):visible').last().click({ force: true })
              // Check for history tag
              cy.get('.saved-search-history > .el-tag:visible').then(($tag) => {
                expect($tag, 'Maximum 2 history tag should be displayed').to.have.length.of.at.most(2)
              })
              // Close history dropdown
              cy.get('@historyDropdown').click()
              if (intercept.response.body.hits.length === 0 || $result.text().match(/^0 Results \| Showing/i)) {
                // Empty text should show up if no result
                cy.get('.error-feedback').should(($text) => {
                  expect($text, 'Empty result message should be displayed').to.contain('No results found')
                })
                cy.print({
                  title: 'search',
                  message: 'Empty result, please try different scaffold datasets',
                  type: 'warning'
                })
              } else {
                cy.wait(['@dataset_info', '@datasets'], { timeout: 20000 })
                // Check for search result and the tag 'Scaffold'
                cy.get('.dataset-card-container > .dataset-card', { timeout: 30000 }).as('datasetCards')
                cy.get('@datasetCards').contains(datasetId).parents('.dataset-card-container.dataset-card').within(() => {
                  cy.get('.badges-container > .container', { timeout: 30000 }).as('tags')
                  cy.get('@tags').contains(/Scaffold/i).should(($tag) => {
                    expect($tag, 'The dataset card should contain the scaffold tag').to.exist
                  })
                  cy.get('@tags').contains(/Scaffold/i).click()
                })
                // Check for button text
                cy.get('@datasetCards').contains(/View Scaffold/i).click()
                cy.wait('@s3-resource', { timeout: 20000 })
                cy.waitForScaffoldLoading()
                cy.waitForMapTreeControlLoading()
                // Check for context card
                cy.checkScaffoldContextCard()
              }
            })
          })
        })
      })
    } else if (map === 'wholebody') {
      it('Map is loaded', function () {
        cy.get('.toolbar .toolbar-title').then((title) => {
          expect(title, 'Human whole body scaffold should be loaded').to.contain('Human 3D Scaffold')
        })
        cy.get('.title-text').then((text) => {
          expect(text, 'Tree control title should exist').to.exist
        })
        cy.get('.traditional-container .selections-container').then(() => {
          cy.get('.region-tree-node > .lastChildInItem').then((region) => {
            expect(region, 'Tree control helper region should exist').to.contain('_helper')
          })
        })
      })

      it('Open new map', function () {
        cy.get('.portal-features > :nth-child(2) .el-button').as('view3DBody')
        cy.get('@view3DBody').click()
        cy.get('.popover-content > .el-button:visible').first().click()
        cy.waitForScaffoldLoading()
        cy.waitForMapTreeControlLoading()
        cy.get('.pane-1 > .content-container > .toolbar > .toolbar-flex-container').then(($select) => {
          expect($select, 'Multiple maps should be loaded').to.exist
        })
        // Close new opened dialog
        cy.get('.header > .icon-group > .map-icon:visible').first().click()
        cy.contains('Vertical split').click()
        cy.get('.pane-1 > .content-container > .toolbar > .el-row > .map-icon').click()
      })
    } else if (map === 'fc') {
      it('Map is loaded', function () {
        cy.get('.toolbar .toolbar-title').then((title) => {
          expect(title, 'Functional flatmap should be loaded').to.contain('Functional Flatmap')
        })
        cy.get('.title-text').then((text) => {
          expect(text, 'Tree control title should exist').to.exist
        })
        cy.get('.checkall-display-text').then((text) => {
          expect(text, 'Tree control checkbox title should exist').to.have.length.greaterThan(0)
        })
      })

      it('Open new map', function () {
        cy.get('.portal-features > :nth-child(3) .el-button').as('viewFCMap')
        cy.get('@viewFCMap').click()
        cy.get('.popover-content > .el-button:visible').first().click()
        cy.waitForFlatmapLoading()
        cy.get('.pane-1 > .content-container > .toolbar > .toolbar-flex-container').then(($select) => {
          expect($select, 'Multiple maps should be loaded').to.exist
        })
        // Close new opened dialog
        cy.get('.header > .icon-group > .map-icon:visible').first().click()
        cy.contains('Vertical split').click()
        cy.get('.pane-1 > .content-container > .toolbar > .el-row > .map-icon').click()
      })
    }
  })
})