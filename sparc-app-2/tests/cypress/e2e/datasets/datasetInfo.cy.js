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

    describe('Top Panel', { testIsolation: false }, function () {
      it('Thumbnail and Button', function () {
        // Should display image with correct dataset src
        cy.get('.dataset-image').should(($image) => {
          expect($image, 'Dataset image should have correct source').to.have.attr('src').to.contain(`https://assets.discover.pennsieve.io/dataset-assets/${datasetId}`)
        })
        //Check 'Get {dataset type}' directs to files tab (It could say either Get Dataset, Model, Scaffold, or Device based off the type of dataset)
        cy.contains('.button-container span', 'Get').click()
        cy.get('.active.style1.tab2.tab-link.p-16').should(($tab) => {
          expect($tab, 'Active tab should be Files').to.contain('Files')
        })
        cy.get('[style=""] > .heading2.mb-8').should(($title) => {
          expect($title, 'Title should be Download Dataset').to.contain('Download Dataset').to.be.visible
        })
        // Check 'Cite {dataset type}' directs to Cite tab (It could say either Cite Dataset, Model, Scaffold, or Device based off the type of dataset)
        cy.contains('.button-container span', 'Cite').click()
        cy.get('.active.style1.tab2.tab-link.p-16').should(($tab) => {
          expect($tab, 'Active tab should be Cite').to.contain('Cite')
        })
        cy.get('[style=""] > .heading2.mb-8').should(($title) => {
          expect($title, 'Title should be Dataset Citation').to.contain('Dataset Citation').to.be.visible
        })
      })

      it('Title and Contributor', function () {
        // Should display dataset title
        cy.get('.el-col-sm-16 > .heading2').should(($title) => {
          expect($title, 'Dataset title content should exist').to.exist
        })
        // Check for tooltip when hover over contributor 
        cy.get('.dataset-owners').should(($contributor) => {
          expect($contributor, 'Contributor content should exist').to.exist
        })
        cy.get('.dataset-owners > .contributor-item-wrap').each(($owner) => {
          const contributorName = $owner.text().replace(',', '').trim()
          cy.wrap($owner).children().as('contributor')
          cy.get('@contributor').invoke('attr', 'class').then((classList) => {
            if (classList.includes('has-orcid')) {
              cy.get('@contributor').trigger('mouseenter', { eventConstructor: 'MouseEvent' })
              // Popover should be visible for each contributor
              cy.get('.orcid-popover:visible').should(($tooltip) => {
                expect($tooltip, 'Orcid tooltip should be visible').to.be.visible
                expect($tooltip, 'Orcid tooltip should contain contributor name').to.contain(contributorName)
                expect($tooltip, 'Orcid tooltip should contain ORCID').to.contain('ORCID iD')
              })
              cy.get('@contributor').trigger('mouseleave', { eventConstructor: 'MouseEvent' })
            }
          })
        })
      })

      it('DOI and Version', function () {
        // DOI link should link to page with correct version
        cy.get('.dataset-information-box > :nth-child(2) > a').as('doiLink')
        cy.get('@doiLink').should(($link) => {
          expect($link, 'DOI link should contain correct link').to.have.attr('href').to.contain('https://doi.org/')
        })
        cy.get('@doiLink').invoke('attr', 'href').then((href) => {
          cy.request({ url: href, failOnStatusCode: false }).then((resp) => {
            expect(resp.redirects, 'Redirect should exist').to.have.length.greaterThan(0)
          })
        })
        // Check 'View other version' directs to Versions tab
        cy.get('.dataset-information-box > div').contains('View other versions').click()
        cy.get('.active.style1.tab2.tab-link.p-16').should('contain', 'Versions')
        cy.get('[style=""] > .heading2.mb-8').should('contain', 'Versions for this Dataset').and('be.visible')
      })
    })

    describe('Left Panel', { testIsolation: false }, function () {
      it('Project', function () {
        // Check project link if exist
        cy.get('.similar-datasets-container').then(($content) => {
          if ($content.text().includes('project(s):')) {
            cy.wrap($content).contains('project(s):').siblings('.mt-8').should(($project) => {
              expect($project, 'Project title should exist').to.exist
            })
            cy.get('.mt-8 > a').each(($link, index) => {
              const title = $link.children().text()
              cy.get('.mt-8 > a').eq(index).click()
              cy.waitForPageLoading()
              cy.url().should((url) => {
                expect(url, 'URL should contain correct slug').to.contain('/about/projects/')
              })
              // Check for the title
              cy.get('.row > .heading2', { timeout: 60000 }).should(($pTitle) => {
                expect($pTitle, 'Project title should match').to.contain(title)
              })
              cy.backToDetailPage(datasetId)
            })
          }
        })
      })

      it('Facet', function () {
        cy.get('.tooltip-item.facet-button').then(($facets) => {
          let exclude = 0
          let facetLabels = []
          cy.wrap($facets).each(($facet) => {
            const facetType = $facet.parents('.parent-facet').siblings('.capitalize').text()
            if (facetType !== 'Type:' && facetType !== 'Consortia:') {
              facetLabels.push($facet.text())
            } else {
              exclude += 1
            }
            if (facetLabels.length === $facets.length - exclude) {
              cy.get('.el-col-sm-16 > .heading2').then(($title) => {
                cy.get('.el-col-sm-16').contains(/Description:/i).parent().then(($description) => {
                  cy.get('.description-container').then(($abstract) => {
                    const labels = facetLabels.map((label) => label.split(' ')).flat()
                    const regex = new RegExp('\(' + labels.join('|') + '\)', 'gi')
                    const text = $title.text() + $description.text() + $abstract.text()
                    expect(text, 'Metadata tags should be suitable for the dataset').to.match(regex)
                  })
                })
              })
            }
          })
          const randomIndex = randomInteger(0, $facets.length - 1)
          const facetName = $facets.eq(randomIndex).text()
          cy.wrap($facets).eq(randomIndex).click()
          cy.waitForPageLoading()
          cy.get('.el-tag__content').should(($tag) => {
            expect($tag.length, 'Tag content should exist in applied').to.be.greaterThan(0)
            expect($tag, 'Tag should match with facet').to.contain(facetName)
          })
          cy.backToDetailPage(datasetId)
        })
      })

      it('Contributor', function () {
        // Wait for the link in the clicked name
        cy.wait(5000)
        // Should search for contributor in find data page
        cy.get('.contributor-list > li > .el-tooltip__trigger > .tooltip-item').then(($contributors) => {
          const randomIndex = randomInteger(0, $contributors.length - 1)
          const contributorName = $contributors.eq(randomIndex).text()
          cy.get('.contributor-list > li > .el-tooltip__trigger > .tooltip-item').eq(randomIndex).click()
          cy.waitForPageLoading()
          cy.get('.el-input__inner').should(($input) => {
            expect($input, 'Search input should match with contributor').to.have.value(contributorName)
          })
          cy.backToDetailPage(datasetId)
        })
      })
    })
  })
})