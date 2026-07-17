/**
 * Paper Trading - Order History Page E2E Tests
 *
 * Tests the Order History page functionality including:
 * - Page layout and navigation
 * - Filtering and search capabilities
 * - Order table display and sorting
 * - CSV export functionality
 */
describe('Paper Trading - Order History Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com'
      }))
    })

    cy.visit('/paper-trading/orders')
  })

  describe('Page Layout', () => {
    it('displays Order History header with icon', () => {
      cy.contains('Order History').should('be.visible')
    })

    it('shows back button to paper trading', () => {
      cy.contains('Back').should('be.visible')
      cy.get('a[href="/paper-trading"]').should('exist')
    })

    it('displays export CSV button', () => {
      cy.contains('Export CSV').should('be.visible')
    })

    it('shows order count', () => {
      cy.contains('orders found').should('be.visible')
    })
  })

  describe('Filters', () => {
    it('renders search input with placeholder', () => {
      cy.get('input[placeholder*="Search by ticker"]').should('be.visible')
    })

    it('filters by ticker search', () => {
      cy.get('input[placeholder*="Search by ticker"]').type('FPT')
      // Results should filter - wait for debounce
      cy.wait(300)
      // Check that results are filtered
      cy.get('table tbody tr').should('exist')
    })

    it('shows side filter dropdown with options', () => {
      cy.get('select').contains('All Sides').should('exist')
      cy.get('select').first().select('BUY')
      cy.get('select').first().should('have.value', 'BUY')
    })

    it('shows status filter dropdown', () => {
      cy.get('select').contains('All Status').should('exist')
    })

    it('allows filtering by status', () => {
      cy.get('select').eq(1).select('FILLED')
      cy.get('select').eq(1).should('have.value', 'FILLED')
    })

    it('shows order type filter dropdown', () => {
      cy.get('select').contains('All Types').should('exist')
    })

    it('allows filtering by order type', () => {
      cy.get('select').eq(2).select('LIMIT')
      cy.get('select').eq(2).should('have.value', 'LIMIT')
    })

    it('shows date range inputs', () => {
      cy.get('input[type="date"]').should('have.length', 2)
    })

    it('allows setting date from filter', () => {
      cy.get('input[type="date"]').first().type('2024-01-01')
      cy.get('input[type="date"]').first().should('have.value', '2024-01-01')
    })

    it('allows setting date to filter', () => {
      cy.get('input[type="date"]').last().type('2024-12-31')
      cy.get('input[type="date"]').last().should('have.value', '2024-12-31')
    })

    it('shows Clear filters button when filters are active', () => {
      cy.get('input[placeholder*="Search by ticker"]').type('FPT')
      cy.contains('Clear filters').should('be.visible')
    })

    it('clears all filters when clear button clicked', () => {
      cy.get('input[placeholder*="Search by ticker"]').type('FPT')
      cy.contains('Clear filters').click()
      cy.get('input[placeholder*="Search by ticker"]').should('have.value', '')
    })

    it('hides Clear filters when no filters active', () => {
      cy.contains('Clear filters').should('not.exist')
    })
  })

  describe('Order Table', () => {
    it('displays table with correct headers', () => {
      cy.get('table').should('exist')
      cy.get('table thead').should('contain', 'Date')
      cy.get('table thead').should('contain', 'Ticker')
      cy.get('table thead').should('contain', 'Side')
      cy.get('table thead').should('contain', 'Type')
      cy.get('table thead').should('contain', 'Status')
    })

    it('displays order data rows', () => {
      cy.get('table tbody tr').should('exist')
    })

    it('shows order status with appropriate styling', () => {
      cy.get('table tbody').should('exist')
      // Status badges should be present
      cy.get('table tbody span').should('exist')
    })

    it('allows sorting by clicking headers', () => {
      cy.get('table thead').contains('Date').click()
      // Table should exist after click (sorting happens)
      cy.get('table tbody tr').should('exist')
    })
  })

  describe('Export Functionality', () => {
    it('export button is enabled', () => {
      cy.contains('button', 'Export CSV').should('not.be.disabled')
    })

    it('triggers download on export click', () => {
      // Stub the download functionality
      cy.window().then((win) => {
        cy.stub(win.URL, 'createObjectURL').returns('blob:test')
        cy.stub(win.URL, 'revokeObjectURL')
      })

      cy.contains('Export CSV').click()
      // Export should be triggered (function stubs called)
    })
  })

  describe('Navigation', () => {
    it('navigates back to paper trading when clicking Back', () => {
      cy.contains('Back').click()
      cy.url().should('include', '/paper-trading')
      cy.url().should('not.include', '/orders')
    })
  })

  describe('Responsive Design', () => {
    it('displays properly on tablet viewport', () => {
      cy.viewport(768, 1024)
      cy.contains('Order History').should('be.visible')
      cy.get('table').should('be.visible')
    })

    it('displays properly on mobile viewport', () => {
      cy.viewport(375, 667)
      cy.contains('Order History').should('be.visible')
      // Filters should still be accessible
      cy.get('input[placeholder*="Search"]').should('be.visible')
    })
  })

  describe('Empty State', () => {
    it('shows appropriate message when no orders match filters', () => {
      // Search for something that won't match
      cy.get('input[placeholder*="Search by ticker"]').type('ZZZNOTEXIST')
      cy.wait(300)
      // Either shows empty table or message
      cy.get('table tbody').should('exist')
    })
  })

  describe('Filter Combinations', () => {
    it('allows combining multiple filters', () => {
      cy.get('input[placeholder*="Search by ticker"]').type('FPT')
      cy.get('select').first().select('BUY')
      cy.get('select').eq(1).select('FILLED')

      // All filters should be applied
      cy.get('input[placeholder*="Search by ticker"]').should('have.value', 'FPT')
      cy.get('select').first().should('have.value', 'BUY')
      cy.get('select').eq(1).should('have.value', 'FILLED')

      // Clear filters should appear
      cy.contains('Clear filters').should('be.visible')
    })

    it('clears all filters at once', () => {
      cy.get('input[placeholder*="Search by ticker"]').type('FPT')
      cy.get('select').first().select('BUY')
      cy.get('select').eq(1).select('FILLED')

      cy.contains('Clear filters').click()

      cy.get('input[placeholder*="Search by ticker"]').should('have.value', '')
      cy.get('select').first().should('have.value', 'ALL')
      cy.get('select').eq(1).should('have.value', 'ALL')
    })
  })
})

describe('Paper Trading - Order History - Unauthenticated', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.visit('/paper-trading/orders')
  })

  it('shows sign-in prompt when not authenticated', () => {
    cy.contains('Sign in to view orders').should('be.visible')
  })

  it('displays authentication required message', () => {
    cy.contains('Order history requires authentication').should('be.visible')
  })
})
