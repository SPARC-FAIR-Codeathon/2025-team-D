import { retryableBefore, stringToArray, randomInteger } from '../../support/utils.js'

/**
 * List of dataset ids
 */
const datasetIds = stringToArray(Cypress.env('DATASET_IDS'), ',')

const galleryItems = ['Scaffold', 'Video', 'Flatmap', 'Segmentation', 'Plot', 'Image']

datasetIds.forEach((datasetId) => {

  describe(`Dataset ${datasetId}`, { testIsolation: false }, function () {

    let existGalleryItems = []

    retryableBefore(function () {
      cy.visit(`/datasets/${datasetId}?type=dataset&datasetDetailsTab=images`)
    })

    beforeEach(function () {
      cy.intercept('**/dataset_info/using_doi?**').as('dataset_info')
      cy.waitForPageLoading()
    })

    it('Gallery Item', function () {
      cy.wait(5000)
      cy.wait('@dataset_info', { timeout: 20000 }).then((intercept) => {
        const response = intercept.response.body.result[0]
        // Check if gallery cards loaded
        if (response) {          
          if (
            ('abi-scaffold-metadata-file' in response && response['abi-scaffold-metadata-file'].length) ||
            ('video' in response && response['video'].length) ||
            ('organs' in response && response['organs'].length) ||
            ('mbf-segmentation' in response && response['mbf-segmentation'].length) ||
            ('abi-plot' in response && response['abi-plot'].length) ||
            ('common-images' in response && response['common-images'].length) ||
            ('biolucida-2d' in response && response['biolucida-2d'].length) ||
            ('biolucida-3d' in response && response['biolucida-3d'].length)
          ) {
            if ('abi-scaffold-metadata-file' in response && response['abi-scaffold-metadata-file'].length) {
              existGalleryItems.push('Scaffold')
            }
            if ('video' in response && response['video'].length) {
              existGalleryItems.push('Video')
            }
            if ('organs' in response && response['organs'].length) {
              existGalleryItems.push('Flatmap')
            }
            if ('mbf-segmentation' in response && response['mbf-segmentation'].length) {
              existGalleryItems.push('Segmentation')
            }
            if ('abi-plot' in response && response['abi-plot'].length) {
              existGalleryItems.push('Plot')
            }
            if (
              ('common-images' in response && response['common-images'].length) ||
              ('biolucida-2d' in response && response['biolucida-2d'].length) ||
              ('biolucida-3d' in response && response['biolucida-3d'].length)
            ) {
              existGalleryItems.push('Image')
            }
            cy.checkGalleyCardState()
          }
        } else {
          cy.get('.content > .full-size').should(($message) => {
            expect($message, 'Gallery items not exist').to.contain('This dataset does not contain gallery items')
          })
        }
      })
    })

    describe('Viewer', { testIsolation: false }, function () {

      galleryItems.forEach((item) => {

        it(item, function () {
          if (existGalleryItems.includes(item)) {
            cy.waitForGalleryLoading()
            cy.get('.filter-container > .filter-dropdown').click()
            cy.get('.el-cascader-node').then(($content) => {
              if (!$content.text().includes(item) && !$content.text().includes(item.toLowerCase())) {
                this.skip()
              }
            })
            cy.get('.el-cascader-node').contains(new RegExp(item, 'i')).parent().siblings().click()
            cy.window().then((window) => {
              cy.stub(window.document.body, 'appendChild').as('cardClicked')
            })
            cy.get('.el-pager > .number').then(($pages) => {
              if ($pages.length > 1) {
                const randomPage = randomInteger(0, $pages.length - 1)
                cy.wrap($pages).eq(randomPage).click()
              }
              cy.get('.el-card > .el-card__body').then(($cards) => {
                const randomCard = randomInteger(0, $cards.length - 1)
                cy.wrap($cards).eq(randomCard).then(($card) => {
                  cy.wrap($card).find('.el-button').click()
                  cy.get('@cardClicked').should('be.calledWith', Cypress.sinon.match.any).then((stub) => {
                    // Appended link element
                    const element = stub.args[0][0]
                    expect(element, 'Button should open a new tab').to.have.attr('target').to.contain('blank')
                    cy.visit(element.href)
                    cy.waitForPageLoading()
                    if (item === 'Scaffold' || item === 'Flatmap') {
                      // Check whether map viewer loaded or not
                      cy.waitForViewerContainer('.mapClass')
                      cy.get('.page-hero > .container').should(($content) => {
                        expect($content, 'Map Viewer should display content').to.contain('Maps')
                      })
                      if (item === 'Scaffold') {
                        cy.get('.pane-1 > .content-container > .toolbar > .toolbar-flex-container > .el-select > .el-select__wrapper > .el-select__selection > .el-select__placeholder > span').should(($title) => {
                          expect($title, 'Map Viewer should display scaffold').to.contain('Scaffold')
                        })
                        cy.waitForScaffoldLoading()
                        cy.checkScaffoldContextCard()
                      }
                      if (item === 'Flatmap') {
                        cy.get('.toolbar-title').should(($title) => {
                          expect($title, 'Map Viewer should display flatmap').to.contain('MultiFlatmap')
                        })
                      }
                      cy.backToDetailPage(datasetId)
                      cy.waitForPageLoading()
                    } else {
                      // Check whether metadata exist or not
                      cy.waitForViewerContainer('.subpage')
                      if (item === 'Video') {
                        cy.get('video')
                          .should('have.prop', 'paused', true)
                          .and('have.prop', 'ended', false)
                          .then(($video) => {
                            $video[0].play()
                          })
                        // once the video starts playing, check props
                        cy.get('video')
                          .should('have.prop', 'paused', false)
                          .and('have.prop', 'ended', false)
                      }
                      if (item === 'Segmentation') {
                        cy.get('.biolucida-viewer > p > a').then(($link) => {
                          expect($link, 'Button should open a new tab').to.have.attr('target').to.contain('blank')
                        })
                      }
                      if (item === 'Plot') {
                        cy.get('.plot-container > .user-select-none.svg-container').then(($plot) => {
                          expect($plot, 'Plot should be displayed').to.exist
                        })
                      }
                      if (item === 'Image') {
                        let windowOpenStub
                        cy.get('.biolucida-viewer > .el-row > div > .el-button').each(($button, index) => {
                          cy.window().then((window) => {
                            windowOpenStub = cy.stub(window, 'open').as(`Open${index}`)
                          })
                          cy.wrap($button).click()
                          cy.get(`@Open${index}`).should('be.calledWith', Cypress.sinon.match.any).then((stub) => {
                            const link = stub.args[0][0]
                            expect(link.length, 'Button should contain external resource link').to.be.greaterThan(0)
                          })
                          cy.then(() => {
                            windowOpenStub.restore()
                          })
                        })
                      }
                      cy.wait(5000) // Wait for above actions to complete
                      cy.get('.subpage > .file-detail > :nth-child(2)').each(($row) => {
                        expect($row.text().length, 'Viewer metadata should exist').to.be.greaterThan(0)
                      })
                      cy.get('.subpage').contains('File location').siblings().find('a').then(($link) => {
                        cy.wrap($link).click()
                        cy.waitForPageLoading()
                        const breadcrumbs = $link.text().split('/')
                        cy.get('.breadcrumb-list .breadcrumb-link').each(($breadcrumb) => {
                          expect(breadcrumbs, 'Filepath should contain all breadcrumbs').to.include($breadcrumb.text())
                        })
                        const filenameList = breadcrumbs[breadcrumbs.length - 1].match(/[a-z0-9]+/gi)
                        const regex = new RegExp(filenameList.join('.*'), 'gi')
                        cy.get('.truncated > a').then(($filenames) => {
                          expect($filenames.text(), 'Filename should exist in the table').to.match(regex)
                        })
                      })
                    }
                    cy.then(() => {
                      cy.clickOnDetailTab('Gallery')
                    })
                  })
                })
              })
            })
          } else {
            this.skip()
          }
        })
      })
    })
  })
})