import {
  TOUR_STEPS,
  completeTour,
  resetOnboarding,
  shouldShowOnboarding,
} from '@/lib/paper-trading/onboarding'
import type { TourStepPosition } from '@/lib/paper-trading/types'

describe('TOUR_STEPS', () => {
  describe('structure', () => {
    it('contains at least 5 tour steps', () => {
      expect(TOUR_STEPS.length).toBeGreaterThanOrEqual(5)
    })

    it('each step has required properties', () => {
      TOUR_STEPS.forEach(step => {
        expect(step).toHaveProperty('id')
        expect(step).toHaveProperty('title')
        expect(step).toHaveProperty('description')
        expect(step).toHaveProperty('targetSelector')
        expect(step).toHaveProperty('position')
        expect(typeof step.id).toBe('string')
        expect(typeof step.title).toBe('string')
        expect(typeof step.description).toBe('string')
        expect(typeof step.targetSelector).toBe('string')
        expect(typeof step.position).toBe('string')
      })
    })

    it('steps have unique ids', () => {
      const ids = TOUR_STEPS.map(s => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('step order', () => {
    it('starts with welcome step', () => {
      expect(TOUR_STEPS[0].id).toBe('welcome')
    })

    it('ends with ready step', () => {
      expect(TOUR_STEPS[TOUR_STEPS.length - 1].id).toBe('ready')
    })
  })

  describe('step content', () => {
    it('titles are non-empty', () => {
      TOUR_STEPS.forEach(step => {
        expect(step.title.length).toBeGreaterThan(0)
      })
    })

    it('descriptions are non-empty', () => {
      TOUR_STEPS.forEach(step => {
        expect(step.description.length).toBeGreaterThan(0)
      })
    })

    it('descriptions are meaningful (more than 20 characters)', () => {
      TOUR_STEPS.forEach(step => {
        expect(step.description.length).toBeGreaterThan(20)
      })
    })
  })

  describe('targetSelector', () => {
    it('all selectors use data-tour attribute', () => {
      TOUR_STEPS.forEach(step => {
        expect(step.targetSelector).toMatch(/^\[data-tour=['"][a-z-]+['"]\]$/)
      })
    })

    it('selectors are unique', () => {
      const selectors = TOUR_STEPS.map(s => s.targetSelector)
      const uniqueSelectors = new Set(selectors)
      expect(uniqueSelectors.size).toBe(selectors.length)
    })
  })

  describe('position', () => {
    it('all positions are valid', () => {
      const validPositions: TourStepPosition[] = ['top', 'bottom', 'left', 'right']
      TOUR_STEPS.forEach(step => {
        expect(validPositions).toContain(step.position)
      })
    })
  })

  describe('expected steps', () => {
    it('has welcome step', () => {
      const welcome = TOUR_STEPS.find(s => s.id === 'welcome')
      expect(welcome).toBeDefined()
      expect(welcome?.title).toContain('Welcome')
    })

    it('has portfolio-summary step', () => {
      const portfolioSummary = TOUR_STEPS.find(s => s.id === 'portfolio-summary')
      expect(portfolioSummary).toBeDefined()
    })

    it('has market-watch step', () => {
      const marketWatch = TOUR_STEPS.find(s => s.id === 'market-watch')
      expect(marketWatch).toBeDefined()
    })

    it('has trade-ticket step', () => {
      const tradeTicket = TOUR_STEPS.find(s => s.id === 'trade-ticket')
      expect(tradeTicket).toBeDefined()
    })

    it('has holdings step', () => {
      const holdings = TOUR_STEPS.find(s => s.id === 'holdings')
      expect(holdings).toBeDefined()
    })

    it('has transactions step', () => {
      const transactions = TOUR_STEPS.find(s => s.id === 'transactions')
      expect(transactions).toBeDefined()
    })

    it('has ready step', () => {
      const ready = TOUR_STEPS.find(s => s.id === 'ready')
      expect(ready).toBeDefined()
      expect(ready?.title).toContain('Ready')
    })
  })

  describe('step count', () => {
    it('has exactly 7 steps', () => {
      expect(TOUR_STEPS.length).toBe(7)
    })
  })
})

describe('onboarding state functions (with localStorage)', () => {
  const STORAGE_KEY = 'paper-trading-onboarding'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('completeTour', () => {
    it('saves completed state with dontShowAgain true', () => {
      completeTour(true)
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored.hasCompletedTour).toBe(true)
      expect(stored.dontShowAgain).toBe(true)
    })

    it('saves completed state with dontShowAgain false', () => {
      completeTour(false)
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored.hasCompletedTour).toBe(true)
      expect(stored.dontShowAgain).toBe(false)
    })

    it('sets completedAt timestamp', () => {
      const before = new Date()
      completeTour(true)
      const after = new Date()
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const completedAt = new Date(stored.completedAt)
      
      expect(completedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(completedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('resetOnboarding', () => {
    it('removes onboarding state from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hasCompletedTour: true,
        dontShowAgain: true,
      }))

      resetOnboarding()
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('shouldShowOnboarding', () => {
    it('returns true when tour not completed and not opted out', () => {
      // Empty localStorage - default state
      const result = shouldShowOnboarding()
      expect(result).toBe(true)
    })

    it('returns false when tour is completed', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hasCompletedTour: true,
        dontShowAgain: false,
      }))

      const result = shouldShowOnboarding()
      expect(result).toBe(false)
    })

    it('returns false when dontShowAgain is true', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hasCompletedTour: false,
        dontShowAgain: true,
      }))

      const result = shouldShowOnboarding()
      expect(result).toBe(false)
    })

    it('returns false when both completed and opted out', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hasCompletedTour: true,
        dontShowAgain: true,
      }))

      const result = shouldShowOnboarding()
      expect(result).toBe(false)
    })
  })
})

describe('tour steps data consistency', () => {
  it('step ids match target selector values', () => {
    TOUR_STEPS.forEach(step => {
      const selectorValue = step.targetSelector.match(/\[data-tour=['"]([^'"]+)['"]\]/)
      if (selectorValue && selectorValue[1]) {
        expect(selectorValue[1]).toBe(step.id)
      }
    })
  })
})
