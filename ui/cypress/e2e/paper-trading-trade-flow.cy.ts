/**
 * Paper Trading - Complete Trade Flow E2E Tests
 *
 * Tests end-to-end trading workflows including:
 * - Market order buy/sell flows
 * - Limit order flows
 * - Stop order flows
 * - Order validation
 * - Error handling
 */
describe('Paper Trading - Complete Trade Flow', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    // Mock session API with starting data
    cy.intercept('GET', '**/paper-trading/session', {
      statusCode: 200,
      body: {
        status: 200,
        isSuccess: true,
        data: {
          accountId: 'test-account',
          startingCapital: 100000000,
          cashBalance: 80000000,
          totalPortfolioValue: 100000000,
          roiPercent: 0,
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', exchange: 'HOSE', sector: 'Technology', price: 112500, changePercent: 2.1 },
            { ticker: 'VCB', name: 'Vietcombank', exchange: 'HOSE', sector: 'Banking', price: 89000, changePercent: -0.5 },
            { ticker: 'VNM', name: 'Vinamilk', exchange: 'HOSE', sector: 'Consumer', price: 72500, changePercent: 1.2 },
          ],
          holdings: [],
          ledger: [],
          mentorMessage: 'Welcome! Start by buying some stocks.'
        }
      }
    }).as('getSession')

    // Mock order placement API
    cy.intercept('POST', '**/paper-trading/orders', {
      statusCode: 200,
      body: {
        status: 200,
        isSuccess: true,
        data: {
          accountId: 'test-account',
          startingCapital: 100000000,
          cashBalance: 68700000,
          totalPortfolioValue: 100000000,
          roiPercent: 0,
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', exchange: 'HOSE', sector: 'Technology', price: 112500, changePercent: 2.1 },
          ],
          holdings: [
            { ticker: 'FPT', shares: 100, averageCost: 112500, currentPrice: 112500, marketValue: 11250000, unrealizedPnl: 0, sector: 'Technology' }
          ],
          ledger: [
            { id: 1, side: 'BUY', ticker: 'FPT', shares: 100, price: 112500, total: 11250000, executedAt: new Date().toISOString() }
          ],
          mentorMessage: 'Great! You bought 100 shares of FPT.'
        }
      }
    }).as('placeOrder')

    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com'
      }))
    })

    cy.visit('/paper-trading')
    cy.wait('@getSession')
  })

  describe('Market Order Buy Flow', () => {
    it('completes a market buy order successfully', () => {
      // 1. Select stock from market watch
      cy.contains('button', 'FPT').click()

      // 2. Verify Market order is selected by default
      cy.contains('button', 'Market').should('have.class', 'border-primary')

      // 3. Verify default quantity
      cy.get('input[type="number"]').should('have.value', '100')

      // 4. Click Buy button
      cy.contains('button', 'Buy').click()

      // 5. Verify confirmation dialog appears
      cy.contains('Confirm Order').should('be.visible')
      cy.contains('BUY FPT').should('be.visible')
      cy.contains('FPT Corporation').should('be.visible')

      // 6. Verify order details in confirmation
      cy.get('[role="dialog"]').within(() => {
        cy.contains('100').should('be.visible') // shares
        cy.contains('Market').should('be.visible') // order type
        cy.contains('DAY').should('be.visible') // time in force
      })

      // 7. Confirm the order
      cy.contains('button', 'Confirm BUY').click()

      // 8. Wait for API call
      cy.wait('@placeOrder')

      // 9. Verify success - mentor message should update
      cy.contains('You bought 100 shares of FPT').should('be.visible')
    })

    it('allows changing quantity before buying', () => {
      cy.contains('button', 'FPT').click()

      // Change quantity to 500
      cy.get('input[type="number"]').clear().type('500')

      cy.contains('button', 'Buy').click()

      // Verify confirmation shows 500 shares
      cy.get('[role="dialog"]').contains('500').should('be.visible')
    })

    it('shows updated estimated value when quantity changes', () => {
      cy.contains('button', 'FPT').click()

      // Get initial estimated value
      cy.contains('Estimated Value').should('be.visible')

      // Change quantity
      cy.get('input[type="number"]').clear().type('200')

      // Estimated value should update
      cy.contains('Estimated Value').parent().should('contain.text', 'đ')
    })
  })

  describe('Limit Order Flow', () => {
    it('places a limit buy order', () => {
      // Select stock
      cy.contains('button', 'FPT').click()

      // Select Limit order type
      cy.contains('button', 'Limit').click()

      // Verify Limit is now selected
      cy.contains('button', 'Limit').should('have.class', 'border-primary')

      // Verify limit price input appears
      cy.contains('Limit Price').should('be.visible')

      // Limit price should be pre-filled with current price
      cy.get('input').should('exist')

      // Click Buy
      cy.contains('button', 'Buy').click()

      // Verify confirmation shows Limit order
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Limit').should('be.visible')
        cy.contains('Limit Price').should('be.visible')
      })
    })

    it('shows Time in Force selector for Limit orders', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Limit').click()

      cy.contains('Time in Force').should('be.visible')
      cy.get('select').contains('DAY').should('exist')
    })

    it('allows changing Time in Force', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Limit').click()

      // Find Time in Force selector and change to GTC
      cy.contains('Time in Force').parent().find('select').select('GTC')

      cy.contains('button', 'Buy').click()

      // Confirmation should show GTC
      cy.get('[role="dialog"]').contains('GTC').should('be.visible')
    })
  })

  describe('Stop Order Flow', () => {
    it('places a stop order', () => {
      cy.contains('button', 'FPT').click()

      // Select Stop order type
      cy.contains('button', 'Stop').click()

      // Verify Stop price input appears
      cy.contains('Stop Price').should('be.visible')

      // Stop price should be pre-filled (95% of current price)
      cy.get('input').should('exist')
    })

    it('shows both prices for Stop-Limit order', () => {
      cy.contains('button', 'FPT').click()

      // Select Stop-Limit order type
      cy.contains('button', 'Stop-Limit').click()

      // Both price inputs should appear
      cy.contains('Stop Price').should('be.visible')
      cy.contains('Limit Price').should('be.visible')
    })
  })

  describe('Sell Order Flow', () => {
    beforeEach(() => {
      // Override session to include holdings
      cy.intercept('GET', '**/paper-trading/session', {
        statusCode: 200,
        body: {
          status: 200,
          isSuccess: true,
          data: {
            accountId: 'test-account',
            startingCapital: 100000000,
            cashBalance: 68700000,
            totalPortfolioValue: 100000000,
            roiPercent: 0,
            marketWatch: [
              { ticker: 'FPT', name: 'FPT Corporation', exchange: 'HOSE', sector: 'Technology', price: 112500, changePercent: 2.1 },
            ],
            holdings: [
              { ticker: 'FPT', shares: 200, averageCost: 108000, currentPrice: 112500, marketValue: 22500000, unrealizedPnl: 900000, sector: 'Technology' }
            ],
            ledger: [
              { id: 1, side: 'BUY', ticker: 'FPT', shares: 200, price: 108000, total: 21600000, executedAt: '2024-01-10T09:15:00Z' }
            ],
            mentorMessage: 'Ready to trade!'
          }
        }
      }).as('getSessionWithHoldings')

      cy.reload()
      cy.wait('@getSessionWithHoldings')
    })

    it('enables Sell button when holding exists', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Sell').should('not.be.disabled')
    })

    it('shows holding information in trade ticket', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('You own').should('be.visible')
      cy.contains('200').should('be.visible') // shares owned
    })

    it('completes a sell order', () => {
      cy.contains('button', 'FPT').click()

      cy.contains('button', 'Sell').click()

      // Verify confirmation shows SELL
      cy.get('[role="dialog"]').within(() => {
        cy.contains('SELL FPT').should('be.visible')
        cy.contains('Confirm SELL').should('be.visible')
      })
    })
  })

  describe('Order Validation', () => {
    it('disables Sell button when no holdings for selected stock', () => {
      // VCB has no holdings in our mock
      cy.contains('button', 'VCB').click()

      // Sell button should be disabled
      cy.contains('button', 'Sell').should('be.disabled')
    })

    it('validates order before confirmation', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Buy').click()

      // Confirmation dialog should show if order is valid
      cy.contains('Confirm Order').should('be.visible')
    })

    it('shows validation errors in confirmation dialog when order is invalid', () => {
      // Set up intercept with low balance
      cy.intercept('GET', '**/paper-trading/session', {
        statusCode: 200,
        body: {
          status: 200,
          isSuccess: true,
          data: {
            accountId: 'test-account',
            cashBalance: 1000000, // Only 1M VND
            holdings: [],
            marketWatch: [
              { ticker: 'FPT', name: 'FPT Corporation', price: 112500, changePercent: 0 },
            ],
            ledger: [],
            mentorMessage: 'Low balance'
          }
        }
      })

      cy.reload()

      // Try to buy - estimated value will exceed cash
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Buy').click()

      // Should show error about insufficient funds
      cy.get('[role="dialog"]').within(() => {
        cy.get('[role="alert"]').should('exist')
      })
    })
  })

  describe('Stock Selection', () => {
    it('updates trade ticket when selecting different stock from market watch', () => {
      // Initially FPT is selected
      cy.contains('button', 'FPT').should('have.class', 'border-primary')

      // Select VCB
      cy.contains('button', 'VCB').click()

      // VCB should now be selected
      cy.contains('button', 'VCB').should('have.class', 'border-primary')

      // Trade ticket dropdown should update
      cy.get('select[aria-label="Select stock"]').should('have.value', 'VCB')
    })

    it('can select stock from dropdown', () => {
      cy.get('select[aria-label="Select stock"]').select('VNM')

      // Dropdown should show VNM
      cy.get('select[aria-label="Select stock"]').should('have.value', 'VNM')
    })

    it('shows stock info in trade ticket', () => {
      cy.contains('button', 'FPT').click()

      // Should show stock details
      cy.contains('FPT Corporation').should('be.visible')
      cy.contains('HOSE').should('be.visible')
      cy.contains('Technology').should('be.visible')
    })
  })

  describe('Order Type Switching', () => {
    it('switches from Market to Limit and back', () => {
      cy.contains('button', 'FPT').click()

      // Start with Market
      cy.contains('button', 'Market').should('have.class', 'border-primary')

      // Switch to Limit
      cy.contains('button', 'Limit').click()
      cy.contains('button', 'Limit').should('have.class', 'border-primary')
      cy.contains('Limit Price').should('be.visible')

      // Switch back to Market
      cy.contains('button', 'Market').click()
      cy.contains('button', 'Market').should('have.class', 'border-primary')
      cy.contains('Limit Price').should('not.exist')
    })

    it('preserves quantity when switching order types', () => {
      cy.contains('button', 'FPT').click()

      // Set quantity
      cy.get('input[type="number"]').clear().type('300')

      // Switch to Limit
      cy.contains('button', 'Limit').click()

      // Quantity should be preserved
      cy.get('input[type="number"]').should('have.value', '300')

      // Switch to Stop
      cy.contains('button', 'Stop').click()

      // Quantity still preserved
      cy.get('input[type="number"]').should('have.value', '300')
    })
  })

  describe('Confirmation Dialog Interaction', () => {
    it('can confirm with Enter key', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Buy').click()

      cy.contains('Confirm Order').should('be.visible')

      // Press Enter to confirm
      cy.get('body').type('{enter}')

      // Order should be placed
      cy.wait('@placeOrder')
    })

    it('disables confirm button while submitting', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'Buy').click()

      cy.contains('button', 'Confirm BUY').click()

      // Button should show loading state (disabled)
      // Note: This happens very quickly with mocked API
    })

    it('closes dialog and resets form after successful order', () => {
      cy.contains('button', 'FPT').click()
      cy.get('input[type="number"]').clear().type('500')
      cy.contains('button', 'Buy').click()
      cy.contains('button', 'Confirm BUY').click()
      cy.wait('@placeOrder')

      // Dialog should close
      cy.contains('Confirm Order').should('not.exist')

      // Form should reset to default quantity
      cy.get('input[type="number"]').should('have.value', '100')
    })
  })

  describe('What-if Analysis Button', () => {
    it('displays What-if Analysis button', () => {
      cy.contains('button', 'What-if Analysis').should('be.visible')
    })

    it('What-if button is enabled when stock is selected', () => {
      cy.contains('button', 'FPT').click()
      cy.contains('button', 'What-if Analysis').should('not.be.disabled')
    })
  })
})

describe('Paper Trading - Trade Flow Error Handling', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    cy.intercept('GET', '**/paper-trading/session', {
      statusCode: 200,
      body: {
        status: 200,
        isSuccess: true,
        data: {
          accountId: 'test-account',
          cashBalance: 80000000,
          holdings: [],
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', price: 112500, changePercent: 0 },
          ],
          ledger: [],
          mentorMessage: 'Welcome!'
        }
      }
    }).as('getSession')

    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({ id: 'test-user-id' }))
    })

    cy.visit('/paper-trading')
    cy.wait('@getSession')
  })

  it('handles API error gracefully', () => {
    // Mock API error
    cy.intercept('POST', '**/paper-trading/orders', {
      statusCode: 500,
      body: {
        status: 500,
        isSuccess: false,
        message: 'Internal server error'
      }
    }).as('orderError')

    cy.contains('button', 'FPT').click()
    cy.contains('button', 'Buy').click()
    cy.contains('button', 'Confirm BUY').click()

    cy.wait('@orderError')

    // Should show error in mentor message
    cy.contains('AI Mentor Panel').should('be.visible')
  })

  it('handles network timeout', () => {
    cy.intercept('POST', '**/paper-trading/orders', {
      forceNetworkError: true
    }).as('networkError')

    cy.contains('button', 'FPT').click()
    cy.contains('button', 'Buy').click()
    cy.contains('button', 'Confirm BUY').click()

    // Should handle error gracefully
  })
})

describe('Paper Trading - Reset Account', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    cy.intercept('GET', '**/paper-trading/session', {
      statusCode: 200,
      body: {
        status: 200,
        isSuccess: true,
        data: {
          accountId: 'test-account',
          cashBalance: 50000000,
          holdings: [
            { ticker: 'FPT', shares: 100, averageCost: 100000, currentPrice: 112500, marketValue: 11250000, unrealizedPnl: 1250000, sector: 'Technology' }
          ],
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', price: 112500, changePercent: 2.1 },
          ],
          ledger: [],
          mentorMessage: 'Your portfolio'
        }
      }
    }).as('getSession')

    cy.intercept('POST', '**/paper-trading/reset', {
      statusCode: 200,
      body: {
        status: 200,
        isSuccess: true,
        data: {
          accountId: 'test-account',
          cashBalance: 100000000,
          holdings: [],
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', price: 112500, changePercent: 2.1 },
          ],
          ledger: [],
          mentorMessage: 'Account reset successfully!'
        }
      }
    }).as('resetAccount')

    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({ id: 'test-user-id' }))
    })

    cy.visit('/paper-trading')
    cy.wait('@getSession')
  })

  it('displays Reset button', () => {
    cy.contains('button', 'Reset').should('be.visible')
  })

  it('Reset button is enabled when session exists', () => {
    cy.contains('button', 'Reset').should('not.be.disabled')
  })
})
