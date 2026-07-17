import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingTour, StartTourButton } from '@/components/paper-trading/OnboardingTour'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock the onboarding module
jest.mock('@/lib/paper-trading/onboarding', () => ({
  TOUR_STEPS: [
    {
      id: 'welcome',
      title: 'Welcome to Paper Trading',
      description: 'Practice trading with virtual money.',
      targetSelector: '[data-tour="welcome"]',
      position: 'bottom',
    },
    {
      id: 'portfolio-summary',
      title: 'Your Portfolio Summary',
      description: 'See your total portfolio value and performance.',
      targetSelector: '[data-tour="portfolio-summary"]',
      position: 'bottom',
    },
    {
      id: 'market-watch',
      title: 'Market Watch',
      description: 'Browse and select stocks to trade.',
      targetSelector: '[data-tour="market-watch"]',
      position: 'right',
    },
    {
      id: 'ready',
      title: 'You are Ready!',
      description: 'Start trading with confidence.',
      targetSelector: '[data-tour="ready"]',
      position: 'bottom',
    },
  ],
  shouldShowOnboarding: () => {
    const stored = mockLocalStorage.getItem('paper-trading-onboarding')
    if (!stored) return true
    const state = JSON.parse(stored)
    return !state.hasCompletedTour && !state.dontShowAgain
  },
  completeTour: (dontShowAgain: boolean) => {
    mockLocalStorage.setItem('paper-trading-onboarding', JSON.stringify({
      hasCompletedTour: true,
      dontShowAgain,
      completedAt: new Date().toISOString(),
    }))
  },
}))

// Mock TourStep component
jest.mock('@/components/paper-trading/TourStep', () => ({
  TourStep: ({ step, currentStep, totalSteps, onNext, onBack, onSkip, isFirst, isLast }: any) => (
    <div data-testid="tour-step">
      <div>Step {currentStep} of {totalSteps}</div>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
      <button onClick={onBack} disabled={isFirst}>Back</button>
      <button onClick={onNext}>{isLast ? 'Finish' : 'Next'}</button>
      <button onClick={onSkip}>Skip</button>
    </div>
  ),
}))

describe('OnboardingTour', () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
  })

  it('does not render when tour was already completed', () => {
    // Mark tour as completed
    mockLocalStorage.setItem('paper-trading-onboarding', JSON.stringify({
      hasCompletedTour: true,
      dontShowAgain: false,
    }))

    render(<OnboardingTour />)

    expect(screen.queryByText('Welcome to Paper Trading!')).not.toBeInTheDocument()
  })

  it('renders welcome modal when shouldShowOnboarding returns true', () => {
    render(<OnboardingTour />)

    expect(screen.getByText('Welcome to Paper Trading!')).toBeInTheDocument()
  })

  it('renders welcome modal when forceShow is true', () => {
    // Even if tour was completed, forceShow should display it
    mockLocalStorage.setItem('paper-trading-onboarding', JSON.stringify({
      hasCompletedTour: true,
      dontShowAgain: true,
    }))

    render(<OnboardingTour forceShow={true} />)

    expect(screen.getByText('Welcome to Paper Trading!')).toBeInTheDocument()
  })

  it('shows feature highlights in welcome modal', () => {
    render(<OnboardingTour />)

    expect(screen.getByText('Track Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Trade Stocks')).toBeInTheDocument()
    expect(screen.getByText('Learn Trading')).toBeInTheDocument()
  })

  it('shows Start Tour and Skip buttons', () => {
    render(<OnboardingTour />)

    expect(screen.getByText('Start Tour')).toBeInTheDocument()
    expect(screen.getByText('Skip for now')).toBeInTheDocument()
  })

  it('shows tour steps when Start Tour is clicked', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    // TourStep should be rendered
    expect(screen.getByTestId('tour-step')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Paper Trading')).toBeInTheDocument()
  })

  it('shows progress indicator (step X of Y)', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('advances to next step when Next is clicked', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))
    fireEvent.click(screen.getByText('Next'))

    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
    expect(screen.getByText('Your Portfolio Summary')).toBeInTheDocument()
  })

  it('goes back to previous step when Back is clicked', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))
    fireEvent.click(screen.getByText('Next')) // Go to step 2
    fireEvent.click(screen.getByText('Back')) // Go back to step 1

    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('disables Back button on first step', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    const backButton = screen.getByText('Back')
    expect(backButton).toBeDisabled()
  })

  it('shows Finish button on last step', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    // Navigate to last step
    fireEvent.click(screen.getByText('Next')) // Step 2
    fireEvent.click(screen.getByText('Next')) // Step 3
    fireEvent.click(screen.getByText('Next')) // Step 4

    expect(screen.getByText('Finish')).toBeInTheDocument()
  })

  it('shows completion screen when Finish is clicked', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    // Navigate to last step and finish
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Finish'))

    expect(screen.getByText('Congratulations!')).toBeInTheDocument()
  })

  it('shows achievement badge in completion screen', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    // Complete the tour
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Finish'))

    expect(screen.getByText('Paper Trader')).toBeInTheDocument()
  })

  it('shows quick tips in completion screen', () => {
    render(<OnboardingTour />)

    fireEvent.click(screen.getByText('Start Tour'))

    // Complete the tour
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Finish'))

    expect(screen.getByText('Quick Tips:')).toBeInTheDocument()
    expect(screen.getByText(/Start with small trades/)).toBeInTheDocument()
  })

  it('calls onComplete when Skip is clicked in welcome modal', () => {
    render(<OnboardingTour onComplete={mockOnComplete} />)

    fireEvent.click(screen.getByText('Skip for now'))

    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('calls onComplete when Skip is clicked during tour', () => {
    render(<OnboardingTour onComplete={mockOnComplete} />)

    fireEvent.click(screen.getByText('Start Tour'))
    fireEvent.click(screen.getByText('Skip'))

    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('calls onComplete when Start Trading is clicked', () => {
    render(<OnboardingTour onComplete={mockOnComplete} />)

    fireEvent.click(screen.getByText('Start Tour'))

    // Complete the tour
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Finish'))

    // Click final button
    fireEvent.click(screen.getByText('Start Trading!'))

    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('shows "Don\'t show again" checkbox', () => {
    render(<OnboardingTour />)

    expect(screen.getByText('Do not show this again')).toBeInTheDocument()
  })

  it('saves preference when "Don\'t show again" is checked and tour is skipped', () => {
    render(<OnboardingTour />)

    // Check the checkbox
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    // Skip the tour
    fireEvent.click(screen.getByText('Skip for now'))

    // Check localStorage
    const stored = JSON.parse(mockLocalStorage.getItem('paper-trading-onboarding')!)
    expect(stored.dontShowAgain).toBe(true)
  })

  it('closes when X button is clicked', () => {
    render(<OnboardingTour onComplete={mockOnComplete} />)

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(mockOnComplete).toHaveBeenCalled()
  })
})

describe('StartTourButton', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('renders Take Tour button', () => {
    render(<StartTourButton />)

    expect(screen.getByText('Take Tour')).toBeInTheDocument()
  })

  it('opens tour when clicked', () => {
    render(<StartTourButton />)

    fireEvent.click(screen.getByText('Take Tour'))

    expect(screen.getByText('Welcome to Paper Trading!')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<StartTourButton className="custom-class" />)

    const button = screen.getByText('Take Tour').closest('button')
    expect(button).toHaveClass('custom-class')
  })
})
