describe('Screener Core Journeys', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.visit('/')
  })

  it('renders the VN Market table populated with data', () => {
    cy.contains('VN Market Screener').should('be.visible')
    cy.get('table').should('exist')
    cy.contains('FPT').should('be.visible')
    cy.contains('VCB').should('be.visible')
  })

  it('filters data via global Navbar search', () => {
    cy.get('input[placeholder*="Search ticker"]').type('SSI{enter}', { force: true })
    cy.url().should('include', '?q=SSI')
    
    cy.get('table').contains('SSI').should('be.visible')
    cy.contains('FPT Corporation').should('not.exist')
  })

  it('allows stock selection and transitions to the Compare view', () => {
    // Wait for data table to explicitly load FPT row and then click the first TD containing the checkbox wrapper
    cy.contains('FPT').should('be.visible')
    cy.get('table tbody tr').eq(0).find('td').first().click()
    cy.get('table tbody tr').eq(1).find('td').first().click()
    
    cy.contains('2 Selected').should('be.visible')
    cy.contains('Compare', { matchCase: false }).click()
    
    cy.url().should('include', '/compare')
    cy.contains('Compare 2 Stocks', { matchCase: false }).should('be.visible')
    cy.contains('Performance Comparison').should('be.visible')
  })
})
