import { retryableBefore, stringToArray } from '../support/utils.js'

const browseCategories = ['dataset', 'model', 'simulation']

/**
 * The number of datasets are displayed per page
 */
const pageLimit = Cypress.env('PAGE_LIMIT')

/**
 * List of keywords
 */
const searchKeywords = stringToArray(Cypress.env('SEARCH_KEYWORDS'), ',')

let filterFacets = []
/**
 * Single facet
 */
const singleFilterFacet = stringToArray(Cypress.env('FILTER_FACETS'), ',').filter((facet, index) => index === 0)
filterFacets.push(singleFilterFacet)
/**
 * List of facets
 */
const multipleFilterFacets = stringToArray(Cypress.env('FILTER_FACETS'), ',')
if (multipleFilterFacets && multipleFilterFacets.length > 1) {
  filterFacets.push(multipleFilterFacets)
}

browseCategories.forEach((category, bcIndex) => {

  describe(`Browsing Data in ${category}`, { testIsolation: false }, function () {

    retryableBefore(function () {
      cy.visit(`/data?type=${category}`)
    })

    beforeEach(function () {
      cy.intercept('**/query?**').as('query')
      cy.waitForPageLoading()
    })

    describe('All Page Features', { testIsolation: false }, function () {
      /**
       * Test whether the datasets order can be updated correctly
       */
      it('Sort dropdown', function () {
        // Show all datasets in order to check the sorting functionality
        cy.get(':nth-child(1) > p > .el-dropdown > .filter-dropdown').click()
        cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains('View All').click()
        // Publish date sorting
        cy.print({
          title: 'sort',
          message: 'Sort by Publish Date (Ascending)',
          type: 'info'
        })
        cy.checkDatasetSort('Date (asc)')
        // A-Z sorting
        cy.get('.label1 > .el-dropdown > .filter-dropdown > .el-dropdown-text-link').click()
        cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains('A-Z').click()
        cy.print({
          title: 'sort',
          message: 'Sort by Title (Descending)',
          type: 'info'
        })
        cy.checkDatasetSort('Z-A')
      })

      /**
       * Test whether tooltips can be shown up and content can be displayed correctly
       */
      it('Tooltips', function () {
        // Filter applied
        cy.get('.nuxt-icon.nuxt-icon--fill.help-icon.el-tooltip__trigger.el-tooltip__trigger').as('helpIcon1')
        cy.get('@helpIcon1').trigger('mouseenter', { eventConstructor: 'MouseEvent' })
        cy.get('[role="tooltip"]').should(($tooltip) => {
          // Check for tooltip visibility
          expect($tooltip, 'Tooltip for Filter applied should be visible').to.be.visible
          // Check for tooltip content
          expect($tooltip, 'Tooltip for Filter applied should contain correct content').to.contain('How do filters work?')
          expect($tooltip, 'Tooltip for Filter applied should contain correct content').to.contain('Within categories: OR')
          expect($tooltip, 'Tooltip for Filter applied should contain correct content').to.contain("example: 'heart' OR 'colon'")
          expect($tooltip, 'Tooltip for Filter applied should contain correct content').to.contain('Between categories: AND')
          expect($tooltip, 'Tooltip for Filter applied should contain correct content').to.contain("example: 'rat' AND 'lung'")
        })
        cy.get('@helpIcon1').trigger('mouseleave', { eventConstructor: 'MouseEvent' })
        // Check for tooltip visibility
        cy.get('[role="tooltip"]').should(($tooltip) => {
          expect($tooltip, 'Tooltip for Filter applied should not be visible').to.not.be.visible
        })
        // AVAILABILITY
        cy.get('.ml-4.help-icon').as('helpIcon2')
        cy.get('@helpIcon2').trigger('mouseenter', { eventConstructor: 'MouseEvent' })
        cy.get('[role="tooltip"]').should(($tooltip) => {
          // Check for tooltip visibility
          expect($tooltip, 'Tooltip for AVAILABILITY should be visible').to.be.visible
          // Check for tooltip content
          expect($tooltip, 'Tooltip for AVAILABILITY should contain correct content').to.contain('SPARC datasets are subject to a 1 year embargo during which time')
          expect($tooltip, 'Tooltip for AVAILABILITY should contain correct content').to.contain('the datasets are visible only to members of the SPARC consortium.')
          expect($tooltip, 'Tooltip for AVAILABILITY should contain correct content').to.contain('During embargo, the public will be able to view basic metadata about')
          expect($tooltip, 'Tooltip for AVAILABILITY should contain correct content').to.contain('these datasets as well as their release date.')
        })
        cy.get('@helpIcon2').trigger('mouseleave', { eventConstructor: 'MouseEvent' })
        // Check for tooltip visibility
        cy.get('[role="tooltip"]').should(($tooltip) => {
          expect($tooltip, 'Tooltip for AVAILABILITY should not be visible').to.not.be.visible
        })
      })

      /**
       * Test whether the number of datasets can be displayed correctly
       */
      it('Page Limit', function () {
        // Change the page limit
        cy.get(':nth-child(1) > p > .el-dropdown > .filter-dropdown').click()
        cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains(pageLimit).click()
        cy.waitForBrowserLoading()
        cy.get('.el-col-md-16 > :nth-child(1) > p').then(($number) => {
          const numberOfDatasets = parseInt($number.text().match(/[0-9]+(.[0-9]+)?/i)[0])
          cy.print({
            title: 'limit',
            message: `Display ${pageLimit} datasets per page`,
            type: 'info'
          })
          if (pageLimit === 'View All') {
            // Check for page limit in URL
            cy.url().should((url) => {
              expect(url, 'URL should contain page limit parameter').to.contain(`limit=${numberOfDatasets}`)
            })
            // Check for the number of displayed datasets
            cy.get('.el-table__row').should(($tableRows) => {
              expect($tableRows, 'All datasets should be displayed').to.have.length(numberOfDatasets)
            })
          } else {
            // Check for page limit in URL
            cy.url().should((url) => {
              expect(url, 'URL should contain page limit parameter').to.contain(`limit=${pageLimit}`)
            })
            // Check for the number of displayed datasets
            if (numberOfDatasets < pageLimit) {
              cy.get('.el-table__row').should(($tableRows) => {
                expect($tableRows, 'Correct number of datasets should be displayed').to.have.length(numberOfDatasets)
              })
            } else {
              cy.get('.el-table__row').should(($tableRows) => {
                expect($tableRows, 'Number of displayed datasets should be equal to the page limit').to.have.length(pageLimit)
              })
            }
          }
        })
      })
    })

    describe('Keyword Search', { testIsolation: false }, function () {

      searchKeywords.forEach((keyword) => {

        it(keyword, function () {
          // In case previous test has been skipped
          cy.restoreUrlState(`data?type=${category}`)

          // Ckeck for placeholder
          cy.get('.el-input__inner').should(($input) => {
            expect($input, 'Placeholder should be visible').to.have.attr('placeholder', 'Enter search criteria (e.g., researcher name or other keywords)')
          })
          // Searching keyword
          cy.get('.el-input__inner').clear()
          cy.get('.el-input__inner').type(keyword)
          // Check for clear search icon after typing
          cy.get('.nuxt-icon.nuxt-icon--fill.body1.close-icon').should(($icon) => {
            expect($icon, 'Clear search icon should be visible').to.be.visible
          })
          cy.get('.search-text').click()
          // Check for keyword in URL
          cy.url().should((url) => {
            expect(url, 'URL should contain search keyword parameter').to.contain(`search=${keyword.replace(' ', '+')}`)
          })
          cy.wait(5000)
          cy.wait('@query', { timeout: 20000 }).then((intercept) => {
            cy.get('.el-col-md-16 > :nth-child(1) > p').then(($result) => {
              if (intercept.response.body.hits.length === 0 || $result.text().match(/^0 Results \| Showing/i)) {
                // Empty text should show up if no result
                cy.get('.el-table__empty-text').should(($text) => {
                  expect($text, 'Empty result message should be displayed').to.contain('No Results')
                })
                cy.print({
                  title: 'keyword',
                  message: 'Empty result, please try different keywords',
                  type: 'warning'
                })
              } else {
                // Show all datasets in order to check the sorting functionality
                cy.get(':nth-child(1) > p > .el-dropdown > .filter-dropdown').click()
                cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains('View All').click()
                cy.waitForBrowserLoading()
                // Check for keyword in table
                cy.get('.table-wrap').then(($table) => {
                  const keywordExistInTable = $table.text().toLowerCase().includes(keyword.toLowerCase())
                  if (keywordExistInTable) {
                    cy.get('b').contains(new RegExp('\(' + keyword.replace(' ', '|') + '\)', 'i')).should(($keyword) => {
                      expect($keyword, 'Highlighted keyword should exist in table').to.exist
                    })
                  } else {
                    cy.print({
                      title: 'keyword',
                      message: `${keyword} cannot be found in the table`,
                      type: 'warning'
                    })
                    cy.get('.img-dataset > img').first().click()
                    cy.waitForPageLoading()
                    cy.get('.details-container').then(($detail) => {
                      const keywordExistInDetail = $detail.text().toLowerCase().includes(keyword.toLowerCase())
                      if (keywordExistInDetail) {
                        cy.contains(new RegExp(keyword, 'i')).should(($keyword) => {
                          expect($keyword, 'Keyword should exist in detail page').to.exist
                        })
                      } else {
                        this.skip()
                      }
                    })
                    cy.go('back')
                    cy.waitForPageLoading()
                  }
                })
              }
            })
          })
        })
      })
    })

    describe('Faceted Browse Search', { testIsolation: false }, function () {

      filterFacets.forEach((facetList, ffIndex) => {

        it(facetList.join(','), function () {
          // In case previous test has been skipped
          cy.restoreUrlState(`data?type=${category}`)

          cy.wait(5000)
          cy.checkFilterInitialised()
          if (ffIndex === 0) {
            cy.get('.label-content-container').should(($filter) => {
              expect($filter, 'Filter content should not be visible').to.not.be.visible
            })
          }
          // Expand all filters
          cy.get('.expand-all-container > .el-link > .el-link__inner').click()
          cy.get('.label-content-container').should(($filter) => {
            expect($filter, 'Filter content should be visible').to.be.visible
            expect($filter.length, 'Filter content should be ready').to.be.greaterThan(0)
          })
          // Expand nested facet menu item
          cy.get('.el-icon.el-tree-node__expand-icon:visible').not('.is-leaf').each(($ele) => {
            const isExpanded = $ele.hasClass('expanded')
            if (!isExpanded) {
              cy.wrap($ele).click()
            }
          })
          // Check for filter
          cy.get('.el-tree-node__content > .custom-tree-node > .capitalize:visible').then(($node1) => {
            let facetsArray = []
            cy.wrap($node1).each($span => facetsArray.push($span.text().toLowerCase())).then(() => {
              let facetIsObserved = true
              facetList.forEach((facet) => {
                facetIsObserved = facetIsObserved && facetsArray.includes(facet.toLowerCase())
              })
              if (facetIsObserved) {
                facetList.forEach((facet) => {
                  // Check the matched facet checkbox
                  cy.wrap($node1).contains(new RegExp(`^${facet}$`, 'i')).then(($label) => {
                    cy.wrap($label).parent().siblings('.el-checkbox').then(($checkbox) => {
                      if (!$checkbox.hasClass('is-checked')) {
                        cy.wrap($label).click()
                      }
                    })
                  })
                  // Check for the number of facet tags in filters applied box
                  cy.get('.el-card__body > .capitalize:visible').contains(new RegExp(facet, 'i')).should(($card) => {
                    expect($card, 'Facet tag should be displayed in filters applied box').to.exist
                  })
                })
                // Check for URL
                cy.url().should((url) => {
                  expect(url, 'URL should contain facet ids parameter').to.contain('selectedFacetIds=')
                })
                cy.wait(5000)
                cy.wait('@query', { timeout: 20000 }).then((intercept) => {
                  cy.get('.el-col-md-16 > :nth-child(1) > p').then(($result) => {
                    if (intercept.response.body.hits.length === 0 || $result.text().match(/^0 Results \| Showing/i)) {
                      // Empty text should show up if no result
                      cy.get('.el-table__empty-text').should(($text) => {
                        expect($text, 'Empty result message should be displayed').to.contain('No Results')
                      })
                      cy.print({
                        title: 'facet',
                        message: 'Empty result, please try different facets',
                        type: 'warning'
                      })
                    } else {
                      // Show all datasets
                      cy.get(':nth-child(1) > p > .el-dropdown > .filter-dropdown').click()
                      cy.get('.el-dropdown-menu > .el-dropdown-menu__item:visible').contains('View All').click()
                      cy.waitForBrowserLoading()
                      // Check for facets exist in dataset card
                      cy.get('.table-wrap').then(($content) => {
                        facetList.forEach((facet) => {
                          const facetExistInTable = $content.text().toLowerCase().includes(facet.toLowerCase())
                          if (facetExistInTable) {
                            cy.get('.cell').contains(new RegExp(facet, 'i')).should(($facet) => {
                              expect($facet, 'Facet should exist in table').to.exist
                            })
                          } else {
                            cy.print({
                              title: 'facet',
                              message: `${facet} cannot be found in the table`,
                              type: 'warning'
                            })
                            cy.get('.img-dataset > img').first().click()
                            cy.waitForPageLoading()
                            cy.get('.details-container').then(($detail) => {
                              const facetExistInDetail = $detail.text().toLowerCase().includes(facet.toLowerCase())
                              if (facetExistInDetail) {
                                cy.contains(new RegExp(facet, 'i')).should(($facet) => {
                                  expect($facet, 'Facet should exist in detail page').to.exist
                                })
                              } else {
                                this.skip()
                              }
                            })
                            cy.go('back')
                            cy.waitForPageLoading()
                          }
                        })
                      })
                    }
                  })
                })
                // Don't use $node1 variable to avoid selector lost issue if previous test has accessed the detail page
                cy.get('.el-tree-node__content > .custom-tree-node > .capitalize:visible').then(($node2) => {
                  // Uncheck all
                  cy.print({
                    title: 'checkbox',
                    message: 'Uncheck all',
                    type: 'info'
                  })
                  cy.checkFacetCheckbox(facetList, 'uncheck', $node2)
                  cy.checkFilterInitialised()
                  // Only test 'dataset' category and multiple facets case
                  if (bcIndex === 0 && ffIndex === 1) {
                    for (let index = 0; index < 2; index++) {
                      if (index === 1) {
                        // Combine with search
                        cy.get('.el-input__inner').clear()
                        cy.get('.el-input__inner').type('dataset')
                        cy.checkFacetCheckbox(facetList, 'check', $node2)
                      }
                      // Close all tags in order
                      cy.print({
                        title: 'tag',
                        message: 'Close all tags',
                        type: 'info'
                      })
                      cy.checkFacetCheckbox(facetList, 'check', $node2)
                      cy.closeFacetTag(facetList, $node2)
                      cy.checkFilterInitialised()
                      // Reset all
                      cy.print({
                        title: 'tag',
                        message: 'Reset all',
                        type: 'info'
                      })
                      cy.checkFacetCheckbox(facetList, 'check', $node2)
                      cy.get('.tags-container > .flex > .el-link > .el-link__inner').click()
                      cy.checkFilterInitialised()
                      // Close one child facet tag and then click reset all
                      cy.print({
                        title: 'tag',
                        message: 'Close one tag and reset all',
                        type: 'info'
                      })
                      cy.checkFacetCheckbox(facetList, 'check', $node2)
                      cy.get('.el-card__body > .capitalize > .el-tag__close').last().click()
                      cy.get('.tags-container > .flex > .el-link > .el-link__inner').click()
                      cy.checkFilterInitialised()
                    }
                  }
                })
              } else {
                this.skip()
              }
            })
          })
        })
      })
    })
  })
})