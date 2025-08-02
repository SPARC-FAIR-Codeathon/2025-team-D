import { retryableBefore } from "../support/utils.js"

describe('Homepage', { testIsolation: false }, function () {

  retryableBefore(function () {
    cy.visit('')
    cy.waitForPageLoading()
  })

  it.skip(`Portal Target: ${Cypress.config().baseUrl}`, function () { })

  it('Navigation Bar', function () {
    // Check for navigation bar
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(1) > a').should(($navbar) => {
      expect($navbar, 'Navigation bar should contain correct tab').to.contain('Data & Models')
      expect($navbar, 'Navigation tab "Data & Models" should have correct href').to.have.attr('href', '/data?type=dataset')
    })
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(2) > a').should(($navbar) => {
      expect($navbar, 'Navigation bar should contain correct tab').to.contain('SPARC Apps')
      expect($navbar, 'Navigation tab "SPARC Apps" should have correct href').to.have.attr('href', '/apps')
    })
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(3) > a').should(($navbar) => {
      expect($navbar, 'Navigation bar should contain correct tab').to.contain('Tools & Resources')
      expect($navbar, 'Navigation tab "Tools & Resources" should have correct href').to.have.attr('href', '/tools-and-resources')
    })
    cy.get('.mobile-navigation > :nth-child(1) > :nth-child(4) > a').should(($navbar) => {
      expect($navbar, 'Navigation bar should contain correct tab').to.contain('News & Events')
      expect($navbar, 'Navigation tab "News & Events" should have correct href').to.have.attr('href', '/news-and-events')
    })
    cy.get(':nth-child(1) > :nth-child(5) > a').should(($navbar) => {
      expect($navbar, 'Navigation bar should contain correct tab').to.contain('About')
      expect($navbar, 'Navigation tab "About" should have correct href').to.have.attr('href', '/about')
    })
    cy.get(':nth-child(1) > :nth-child(6) > a').should(($navbar) => {
      expect($navbar, 'Navigation bar should contain correct tab').to.contain('Submit to SPARC')
      expect($navbar, 'Navigation tab "Submit to SPARC" should have correct href').to.have.attr('href', '/share-data')
    })
  })

  it('Page hero', function () {
    // Check for page hero
    cy.get('.page-hero').within(() => {
      // Check for content title
      cy.get('h1').should(($title) => {
        expect($title, 'Title should contain specific content').to.contain('SPARC')
      })
      // Check for content description
      cy.get('h5').should(($title) => {
        expect($title, 'Page hero should have a description').to.exist
      })
      // Check for content image
      cy.get('[class="page-hero-img"]').should(($image) => {
        expect($image, 'Image should be displayed').to.have.prop('naturalWidth').to.be.greaterThan(0)
      })
    })
  })

  it('SPARC by the numbers', function () {
    // Check for content title
    cy.get('.container.p-24 > .heading2').should(($title) => {
      expect($title, 'Title should contain specific content').to.contain('SPARC by the numbers')
    })
    // Check for consortia
    cy.get('.container.p-24 > .body1 > b > .heading2').first().then(($el) => {
      const numberOfConsortia = parseInt($el.text())
      cy.get('.container.p-24 > .data-wrap.py-16 > .consortia-item').should(($item) => {
        expect($item, 'Correct number of consortia items should be displayed').to.have.length(numberOfConsortia)
        expect($item, 'Consortia items should have correct href').to.have.attr('href').to.contain('/about/consortia/')
      })
    })
    // Check for explore the data
    cy.get('.container.p-24 .data-wrap.py-16').eq(1).find('.sparc-number').should(($item) => {
      expect($item, 'Correct number of data explorations should be displayed').to.have.length(4)
      expect($item, 'Data exploration item should have correct href').to.have.attr('href').to.contain('/data?type=')
    })
    // Check for key metrics
    cy.get('.container.p-24 .data-wrap.pt-16').find('.sparc-number').should(($item) => {
      expect($item, 'Correct number of key metrics should be displayed').to.have.length(4)
      expect($item, 'Key metrics should have correct href').to.have.attr('href').to.contain('/about/metrics')
    })
  })

  it('Portal features', function () {
    // Check for the number of features
    cy.get('.feature-container').should(($feature) => {
      expect($feature, 'Correct number of feature items should be displayed').to.have.length(4)
    })
    // Check for feature card
    cy.get(':nth-child(1) > .feature-container').within(() => {
      cy.get('.icon').should(($icon) => {
        expect($icon, 'Feature card should have an icon').to.exist
      })
      cy.get('.heading2').should(($title) => {
        expect($title, 'Feature card should have a title').to.exist
      })
      cy.get('.body1').should(($description) => {
        expect($description, 'Feature card should have a description').to.exist
      })
      cy.get('.button-link > .el-button > span').should(($button) => {
        expect($button, 'Feature card should have a button').to.exist
      })
    })
    // Check for button link
    cy.get(':nth-child(1) > .feature-container > .button-link').should(($feature) => {
      expect($feature, 'Feature card button should have correct text').to.contain('Data and Models')
      expect($feature, 'Feature card "Data and Models" should have correct href').to.have.attr('href', '/data?type=dataset')
    })
    cy.get(':nth-child(2) > .feature-container > .button-link').should(($feature) => {
      expect($feature, 'Feature card button should have correct text').to.contain('Maps')
      expect($feature, 'Feature card "Maps" should have correct href').to.have.attr('href', '/apps/maps?type=ac')
    })
    cy.get(':nth-child(3) > .feature-container > .button-link').should(($feature) => {
      expect($feature, 'Feature card button should have correct text').to.contain('Discover')
      expect($feature, 'Feature card "Discover" should have correct href').to.have.attr('href').to.contain('/tools-and-resources')
    })
    cy.get(':nth-child(4) > .feature-container > .button-link').should(($feature) => {
      expect($feature, 'Feature card button should have correct text').to.contain('Submit')
      expect($feature, 'Feature card "Submits" should have correct href').to.have.attr('href', '/share-data')
    })
  })

  it('Find by', function () {
    cy.get('.categories-container > .heading2').should(($title) => {
      expect($title, 'Title should contain specific content').to.have.text('Find by')
    })
    // Check for categories selection item
    cy.get('.categories-container > .categories-select').as('findBy')
    cy.get('@findBy').click()
    cy.get('.el-select-dropdown > .el-scrollbar > .el-select-dropdown__wrap > .el-select-dropdown__list > .el-select-dropdown__item').as('options')
    cy.get('@options').then(($dropdown) => {
      expect($dropdown, 'Dropdown should have at least one item').to.have.length.above(0)
      for (let index = 0; index < $dropdown.length; index++) {
        cy.wrap($dropdown).eq(index).click()
        cy.get('.featured-data > .gallery > .resources-gallery-strip > .card-line > .key-image-span > .data-wrap > .data-item').should(($card) => {
          expect($card, 'Featured card should contain correct href').to.have.attr('href').to.contain('/data?type=dataset&selectedFacetIds=')
        })
        // Check for pagination
        cy.get('.sparc-design-system-pagination').should(($pagination) => {
          expect($pagination, 'Pagination should exist').to.exist
        })
        cy.get('.is-active').should(($page) => {
          expect($page, 'Pagination should have active page').to.contain('1')
        })
        cy.get('.btn-next').click()
        cy.get('.is-active').should(($page) => {
          expect($page, 'Pagination should have active page').to.contain('2')
        })
        cy.get('@findBy').click()
      }
    })
  })

  it('Resources and datasets', function () {
    // Check for title
    cy.get('.section-container.py-24 > .heading2').should('contain', 'Resources & Datasets')
    // Check for card description
    cy.get('.row > :nth-child(1) > .mb-16').should('contain', 'Here is a resource you might be interested in:')
    cy.get('.row > :nth-child(2) > .mb-16').should('have.text', 'Featured Datasets')
    // Check for card content
    cy.get(':nth-child(1) > .card-container').within(() => {
      cy.get('.subpage-row > :nth-child(1) > .image-container > .banner-image').should('exist')
      cy.get('.subpage-row > :nth-child(2) > .dataset-name').should('exist')
      cy.get('.subpage-row > :nth-child(2) > .dataset-description').should('exist')
      cy.get('.subpage-row > :nth-child(2) > .button-link > .el-button').should('exist')
    })
    // Check for title redirect link
    cy.get(':nth-child(1) > .card-container > .subpage-row > :nth-child(2) > .dataset-name').should('have.attr', 'href').and('contain', '/resources/')
    cy.get(':nth-child(2) > .card-container > .subpage-row > :nth-child(2) > .dataset-name').should('have.attr', 'href').and('contain', '/datasets/')
    // Check for card 'view all' link
    cy.get('.row > :nth-child(1) > .view-all-link').should('contain', 'View All Tools & Resources').and('have.attr', 'href', '/tools-and-resources/tools')
    cy.get(':nth-child(2) > .view-all-link').should('contain', 'View All Datasets').and('have.attr', 'href', '/data?type=dataset')
  })

  it('News and upcoming events', function () {
    // Check for title
    cy.get('.featured-datasets > .heading2').should(($title) => {
      expect($title, 'Title should contain specific content').to.contain('News & Upcoming Events')
    })
    // Check for card image
    cy.get('.sparc-card__image').should(($image) => {
      expect($image, 'Card should have an image').to.exist
    })
    // Check for card title
    cy.get('h3 > a').should(($title) => {
      expect($title, 'Card should have a title').to.exist
    })
    // Check for card description
    cy.get('.markdown-text > p').should(($description) => {
      expect($description, 'Card should have a description').to.exist
    })
    // Check for card button
    cy.get(':nth-child(2) > .el-button').should(($button) => {
      expect($button, 'Card should have a button').to.contain('Learn More')
    })
    // Check for card 'view all' link
    cy.get('.sparc-card__content-wrap__content > .view-all-link').should(($link) => {
      expect($link, 'Card should have a view all link').to.contain('View All News & Events')
      expect($link, 'Card link should have correct href').to.have.attr('href', '/news-and-events')
    })
  })

  it('Stay connected', function () {
    // Check for title
    cy.get('.subheader').should(($title) => {
      expect($title, 'Title should contain specific content').to.contain('Stay Connected')
    })
    // Check for content
    cy.get('.newsletter-wrap > .heading2').should(($title) => {
      expect($title, 'Title should contain specific content').to.contain('Sign up for the SPARC Newsletter')
    })
    cy.get('.office-hours-column > .heading2').should(($title) => {
      expect($title, 'Title should contain specific content').to.contain('Open Office Hours')
    })
  })

  it('Footer', function () {
    cy.get('.footer__links > :nth-child(1) > :nth-child(1) > h3').should(($text) => {
      expect($text, 'Footer should have correct text').to.contain('Learn More')
    })
    cy.get(':nth-child(1) > :nth-child(2) > h3').should(($text) => {
      expect($text, 'Footer should have correct text').to.contain('Policies')
    })
    cy.get(':nth-child(2) > :nth-child(1) > h3').should(($text) => {
      expect($text, 'Footer should have correct text').to.contain('Help Us Improve')
    })
    cy.get(':nth-child(2) > :nth-child(2) > h3').should(($text) => {
      expect($text, 'Footer should have correct text').to.contain('Stay Up-to-Date')
    })
    cy.get('.footer__info--logo > .router-link-active > .logo').should(($logo) => {
      expect($logo, 'Footer should have correct logo').to.have.attr('alt').to.contain('Logo for SPARC')
    })
    cy.get('.footer__info--blurb > p').should(($text) => {
      expect($text, 'Footer should have correct text').to.contain('The open community platform for bridging the body and the brain through neuroscience and systems physiology data, computational and spatial modeling, and device design.')
    })
  })
})
