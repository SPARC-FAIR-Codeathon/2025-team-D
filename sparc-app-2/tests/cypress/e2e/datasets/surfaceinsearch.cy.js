import { retryableBefore, stringToArray, randomInteger } from '../../support/utils.js'

/**
 * List of dataset ids
 */
const datasetIds = stringToArray(Cypress.env('DATASET_IDS'), ',')

datasetIds.forEach((datasetId) => {

  describe(`Dataset ${datasetId}`, { testIsolation: false }, function () {

    retryableBefore(function () {
      cy.visit(`/datasets/${datasetId}?type=dataset`)
    })

    beforeEach(function () {
      cy.waitForPageLoading()
    })

    it('Surfaces in Keyword Search', function () {
      cy.get('.el-col-sm-16 > .heading2').then(($title) => {
        cy.get('.similar-datasets-container > .px-8').then(($similar) => {
          if ($similar.text().includes('Type:')) {
            const title = $title.text().replace(/\s\s+/g, ' ')
            const titleList = title.split(' ')
            const input = titleList.slice(0, randomInteger(1, titleList.length - 1)).join(' ')
            cy.wrap($similar).contains(/TYPE:/i).siblings('.facet-button-container').click()
            cy.waitForPageLoading()
            cy.get('.el-input__inner').clear()
            cy.get('.el-input__inner').type(input)
            cy.get('.search-text').click()
            cy.waitForBrowserLoading()
            cy.get(':nth-child(1) > p > .el-dropdown > .filter-dropdown').click()
            cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains('View All').click()
            cy.waitForBrowserLoading()
            cy.get('.cell').contains(title).should(($dTitle) => {
              expect($dTitle, 'Dataset title should exist in search results').to.exist
            })
            cy.backToDetailPage(datasetId)
          } else {
            this.skip()
          }
        })
      })
    })

    it('Surfaces in Faceted Browse Search', function () {
      cy.get('.el-col-sm-16 > .heading2').then(($title) => {
        cy.get('.similar-datasets-container > .px-8').then(($similar) => {
          if ($similar.text().includes('Type:')) {
            cy.get('.facet-button-container > .el-tooltip__trigger > .tooltip-item').then(($facets) => {
              const randomIndex = randomInteger(0, $facets.length - 1)
              cy.get('.facet-button-container > .el-tooltip__trigger > .tooltip-item').eq(randomIndex).click()
              cy.waitForPageLoading()
              cy.get(':nth-child(1) > p > .el-dropdown > .filter-dropdown').click()
              cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains('View All').click()
              cy.waitForBrowserLoading()
              cy.get('.cell').contains($title.text().replace(/\s\s+/g, ' ')).should(($dTitle) => {
                expect($dTitle, 'Dataset title should exist in search results').to.exist
              })
              cy.backToDetailPage(datasetId)
            })
          } else {
            this.skip()
          }
        })
      })
    })
  })
})