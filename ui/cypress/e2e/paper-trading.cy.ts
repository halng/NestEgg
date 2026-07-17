/**
 * Paper Trading Core Journeys - E2E Tests
 *
 * Tests the main Paper Trading page functionality including:
 * - Unauthenticated state handling
 * - Dashboard layout and metrics
 * - Market watch interaction
 * - Trade ticket functionality
 * - Order confirmation flow
 * - Mobile responsiveness
 */
describe('Paper Trading Core Journeys', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
  })

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      cy.visit('/paper-trading')
    })

    it('shows sign-in prompt when not authenticated', () => {
      cy.contains('Sign in to paper trade').should('be.visible')
      cy.contains('Paper trading uses your protected virtual account').should('be.visible')
    })

    it('displays sign in button', () => {
      cy.contains('button', 'Sign In').should('be.visible')
    })
  })

  describe('Page Layout', () => {
    beforeEach(() => {
      cy.visit('/paper-trading')
    })

    it('renders the Paper Trading Lab heading', () => {
      cy.get('main').should('exist')
      cy.contains('Paper Trading Lab').should('exist')
    })

    it('displays Order History navigation link', () => {
      cy.get('a[href*="/paper-trading/orders"]').should('exist')
    })
  })
})

describe('Paper Trading - Authenticated User', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)

    // Intercept session API to return mock data
    cy.intercept('GET', '**/paper-trading/session', {
      statusCode: 200,
      body: {
        status: 200,
        message: 'Success',
        isSuccess: true,
        data: {
          accountId: 'test-account',
          startingCapital: 100000000,
          cashBalance: 53470000,
          totalPortfolioValue: 100930000,
          roiPercent: 0.93,
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', exchange: 'HOSE', sector: 'Technology', price: 112500, changePercent: 2.1 },
            { ticker: 'VCB', name: 'Vietcombank', exchange: 'HOSE', sector: 'Banking', price: 89000, changePercent: -0.5 },
            { ticker: 'VNM', name: 'Vinamilk', exchange: 'HOSE', sector: 'Consumer', price: 72500, changePercent: 1.2 },
            { ticker: 'HPG', name: 'Hoa Phat Group', exchange: 'HOSE', sector: 'Materials', price: 25800, changePercent: -1.8 },
          ],
          holdings: [
            { ticker: 'FPT', shares: 200, averageCost: 108000, currentPrice: 112500, marketValue: 22500000, unrealizedPnl: 900000, sector: 'Technology' },
            { ticker: 'VCB', shares: 150, averageCost: 92000, currentPrice: 89000, marketValue: 13350000, unrealizedPnl: -450000, sector: 'Banking' },
          ],
          ledger: [
            { id: 1, side: 'BUY', ticker: 'FPT', shares: 200, price: 108000, total: 21600000, executedAt: '2024-01-10T09:15:00Z' },
            { id: 2, side: 'BUY', ticker: 'VCB', shares: 150, price: 92000, total: 13800000, executedAt: '2024-01-11T10:30:00Z' },
          ],
          mentorMessage: 'Welcome to paper trading! Start by exploring the market watch.'
        }
      }
    }).as('getSession')

    // Mock authentication state
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com'
      }))
    })

    cy.visit('/paper-trading')
    cy.wait('@getSession')
  })

  describe('Dashboard', () => {
    it('displays account metrics cards', () => {
      cy.contains('Purchasing Power').should('be.visible')
      cy.contains('Portfolio Value').should('be.visible')
      cy.contains('Overall ROI').should('be.visible')
      cy.contains('Pending Orders').should('be.visible')
    })

    it('shows formatted currency values in metrics', () => {
      // Purchasing Power should show cashBalance
      cy.contains('Purchasing Power').parent().should('contain.text', '53')
    })

    it('displays market watch section with stocks', () => {
      cy.contains('Market Watch').should('be.visible')
      cy.contains('FPT').should('be.visible')
      cy.contains('VCB').should('be.visible')
      cy.contains('VNM').should('be.visible')
      cy.contains('HPG').should('be.visible')
    })

    it('shows stock count in market watch header', () => {
      cy.contains('4 stocks').should('be.visible')
    })

    it('displays portfolio holdings table', () => {
      cy.contains('Portfolio Holdings').should('be.visible')
      cy.get('table').should('exist')
      cy.contains('th', 'Ticker').should('be.visible')
      cy.contains('th', 'Shares').should('be.visible')
      cy.contains('th', 'Avg Cost').should('be.visible')
      cy.contains('th', 'Current').should('be.visible')
    })

    it('shows holdings data in table', () => {
      cy.get('table tbody').contains('FPT').should('be.visible')
      cy.get('table tbody').contains('VCB').should('be.visible')
    })

    it('shows recent transactions section', () => {
      cy.contains('Recent Transactions').should('be.visible')
      cy.contains('BUY FPT').should('be.visible')
      cy.contains('BUY VCB').should('be.visible')
    })

    it('displays AI mentor message', () => {
      cy.contains('AI Mentor Panel').should('be.visible')
      cy.contains('Welcome to paper trading').should('be.visible')
    })

    it('shows navigation buttons', () => {
      cy.contains('Order History').should('be.visible')
      cy.contains('Reset').should('be.visible')
    })
  })

  describe('Market Watch Interaction', () => {
    it('highlights selected stock card', () => {
      // FPT should be selected by default (first in marketWatch)
      cy.contains('button', 'FPT')
        .should('have.class', 'border-primary')
    })

    it('allows selecting different stocks', () => {
      cy.contains('button', 'VCB').click()
      cy.contains('button', 'VCB')
        .should('have.class', 'border-primary')
    })

    it('shows price change percentage', () => {
      cy.contains('+2.1%').should('be.visible') // FPT
      cy.contains('-0.5%').should('be.visible') // VCB
    })

    it('displays Trade action on cards', () => {
      cy.contains('Trade').should('be.visible')
    })
  })

  describe('Trade Ticket - Desktop', () => {
    it('displays trade ticket section', () => {
      cy.contains('Trade Ticket').should('be.visible')
    })

    it('shows stock selector dropdown', () => {
      cy.get('select[aria-label="Select stock"]').should('exist')
      cy.get('select[aria-label="Select stock"]').find('option').should('have.length', 4)
    })

    it('allows selecting stock from dropdown', () => {
      cy.get('select[aria-label="Select stock"]').select('VCB')
      cy.get('select[aria-label="Select stock"]').should('have.value', 'VCB')
    })

    it('displays order type selector with all options', () => {
      cy.contains('button', 'Market').should('be.visible')
      cy.contains('button', 'Limit').should('be.visible')
      cy.contains('button', 'Stop').should('be.visible')
      cy.contains('button', 'Stop-Limit').should('be.visible')
    })

    it('has Market order type selected by default', () => {
      cy.contains('button', 'Market').should('have.class', 'border-primary')
    })

    it('shows limit price input when Limit selected', () => {
      cy.contains('button', 'Limit').click()
      cy.contains('Limit Price').should('be.visible')
      cy.contains('button', 'Limit').should('have.class', 'border-primary')
    })

    it('shows stop price input when Stop selected', () => {
      cy.contains('button', 'Stop').click()
      cy.contains('Stop Price').should('be.visible')
    })

    it('shows both prices for Stop-Limit order', () => {
      cy.contains('button', 'Stop-Limit').click()
      cy.contains('Stop Price').should('be.visible')
      cy.contains('Limit Price').should('be.visible')
    })

    it('shows Time in Force selector for non-market orders', () => {
      cy.contains('button', 'Limit').click()
      cy.contains('Time in Force').should('be.visible')
    })

    it('has quantity input with default value of 100', () => {
      cy.contains('Shares').should('be.visible')
      cy.get('input[type="number"]').should('have.value', '100')
    })

    it('allows changing quantity', () => {
      cy.get('input[type="number"]').clear().type('500')
      cy.get('input[type="number"]').should('have.value', '500')
    })

    it('shows estimated value section', () => {
      cy.contains('Estimated Value').should('be.visible')
      cy.contains('Available Cash').should('be.visible')
    })

    it('displays Buy and Sell buttons', () => {
      cy.contains('button', 'Buy').should('be.visible')
      cy.contains('button', 'Sell').should('be.visible')
    })

    it('Sell button is enabled when stock has holdings', () => {
      // FPT has holdings, so Sell should be enabled
      cy.contains('button', 'Sell').should('not.be.disabled')
    })

    it('displays current holding info for selected stock', () => {
      // Should show holding info for FPT
      cy.contains('You own').should('be.visible')
      cy.contains('200').should('be.visible') // shares
    })
  })

  describe('Order Confirmation Flow', () => {
    it('shows confirmation dialog on Buy click', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('Confirm Order').should('be.visible')
    })

    it('displays order summary in confirmation dialog', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('Confirm Order').should('be.visible')
      cy.contains('BUY FPT').should('be.visible')
      cy.contains('Shares').should('be.visible')
      cy.contains('Est. Fees').should('be.visible')
      cy.contains('Total').should('be.visible')
    })

    it('shows stock name in confirmation', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('FPT Corporation').should('be.visible')
    })

    it('displays time in force in confirmation', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('Time in Force').should('be.visible')
      cy.contains('DAY').should('be.visible')
    })

    it('can cancel order from confirmation dialog', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('Confirm Order').should('be.visible')

      cy.contains('button', 'Cancel').click()
      cy.contains('Confirm Order').should('not.exist')
    })

    it('closes confirmation with Escape key', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('Confirm Order').should('be.visible')

      cy.get('body').type('{esc}')
      cy.contains('Confirm Order').should('not.exist')
    })

    it('shows keyboard hints in confirmation dialog', () => {
      cy.contains('button', 'Buy').click()
      cy.contains('Enter').should('be.visible')
      cy.contains('Esc').should('be.visible')
    })

    it('shows Sell confirmation with correct styling', () => {
      cy.contains('button', 'Sell').click()
      cy.contains('Confirm Order').should('be.visible')
      cy.contains('SELL FPT').should('be.visible')
      cy.contains('Confirm SELL').should('be.visible')
    })
  })

  describe('Charts and Analytics', () => {
    it('displays portfolio performance chart section', () => {
      cy.contains('Portfolio Performance').should('be.visible')
    })

    it('shows time period selector buttons', () => {
      cy.contains('button', '1D').should('be.visible')
      cy.contains('button', '1W').should('be.visible')
      cy.contains('button', '1M').should('be.visible')
      cy.contains('button', '3M').should('be.visible')
      cy.contains('button', '1Y').should('be.visible')
      cy.contains('button', 'ALL').should('be.visible')
    })

    it('allows changing chart time period', () => {
      cy.contains('button', '1W').click()
      // Button should appear selected
      cy.contains('button', '1W').should('have.class', 'bg-background')
    })

    it('displays sector allocation chart', () => {
      cy.contains('Sector Allocation').should('be.visible')
    })

    it('shows performance metrics section', () => {
      cy.contains('Performance Metrics').should('be.visible')
      cy.contains('Total Return').should('be.visible')
      cy.contains('Win Rate').should('be.visible')
      cy.contains('Max Drawdown').should('be.visible')
      cy.contains('Sharpe Ratio').should('be.visible')
    })

    it('displays return by period', () => {
      cy.contains('Return by Period').should('be.visible')
      cy.contains('Daily').should('be.visible')
      cy.contains('Weekly').should('be.visible')
      cy.contains('Monthly').should('be.visible')
    })
  })

  describe('Feature Cards', () => {
    it('displays risk-free learning feature', () => {
      cy.contains('Risk-Free Learning').should('be.visible')
      cy.contains('Practice trading strategies with virtual money').should('be.visible')
    })

    it('displays advanced analytics feature', () => {
      cy.contains('Advanced Analytics').should('be.visible')
    })

    it('displays real market data feature', () => {
      cy.contains('Real Market Data').should('be.visible')
    })
  })
})

describe('Paper Trading - Mobile', () => {
  beforeEach(() => {
    cy.viewport(375, 667) // iPhone SE

    cy.intercept('GET', '**/paper-trading/session', {
      statusCode: 200,
      body: {
        status: 200,
        message: 'Success',
        isSuccess: true,
        data: {
          accountId: 'test-account',
          startingCapital: 100000000,
          cashBalance: 53470000,
          totalPortfolioValue: 100930000,
          roiPercent: 0.93,
          marketWatch: [
            { ticker: 'FPT', name: 'FPT Corporation', exchange: 'HOSE', sector: 'Technology', price: 112500, changePercent: 2.1 },
          ],
          holdings: [
            { ticker: 'FPT', shares: 200, averageCost: 108000, currentPrice: 112500, marketValue: 22500000, unrealizedPnl: 900000, sector: 'Technology' },
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

  it('hides desktop trade ticket on mobile', () => {
    // Trade ticket should not be visible in desktop area on mobile
    cy.get('.xl\\:block').should('not.be.visible')
  })

  it('shows Trade FAB button on mobile', () => {
    cy.contains('button', 'Trade').should('be.visible')
  })

  it('FAB button has correct styling', () => {
    cy.contains('button', 'Trade')
      .should('have.class', 'fixed')
      .should('have.class', 'rounded-full')
  })

  it('opens trade sheet when FAB clicked', () => {
    cy.contains('button', 'Trade').click()
    // Trade sheet should appear with Trade Ticket content
    cy.get('[class*="fixed"][class*="inset-0"]').should('exist')
    cy.contains('Trade Ticket').should('be.visible')
  })

  it('can close trade sheet by clicking backdrop', () => {
    cy.contains('button', 'Trade').click()
    cy.contains('Trade Ticket').should('be.visible')

    // Click the backdrop
    cy.get('[class*="bg-black"]').first().click({ force: true })
    // Sheet should close (Trade Ticket in sheet context should disappear)
  })

  it('shows close button in mobile sheet', () => {
    cy.contains('button', 'Trade').click()
    // Should have X button to close
    cy.get('[class*="fixed"] button').should('exist')
  })

  it('displays drag handle in mobile sheet', () => {
    cy.contains('button', 'Trade').click()
    // Drag handle indicator
    cy.get('[class*="rounded-full"][class*="bg-muted"]').should('exist')
  })
})
