import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RiskQuiz, RiskQuizTrigger } from '@/components/paper-trading/RiskQuiz'

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

// Mock the risk-profile module
jest.mock('@/lib/paper-trading/risk-profile', () => ({
  RISK_QUIZ_QUESTIONS: [
    {
      id: 'portfolio-drop',
      question: 'How would you react if your portfolio dropped 20% in a month?',
      options: [
        { value: 'sell-all', label: 'Sell everything immediately', score: 1 },
        { value: 'sell-some', label: 'Sell some holdings', score: 2 },
        { value: 'hold', label: 'Hold steady and wait', score: 3 },
        { value: 'buy-more', label: 'Buy more at lower prices', score: 4 },
      ],
    },
    {
      id: 'investment-goal',
      question: 'What is your primary investment goal?',
      options: [
        { value: 'preserve', label: 'Preserve capital', score: 1 },
        { value: 'income', label: 'Generate income', score: 2 },
        { value: 'growth', label: 'Grow wealth moderately', score: 3 },
        { value: 'aggressive', label: 'Maximize growth', score: 4 },
      ],
    },
    {
      id: 'time-horizon',
      question: 'How long do you plan to keep your money invested?',
      options: [
        { value: 'short', label: 'Less than 1 year', score: 1 },
        { value: 'medium', label: '1-3 years', score: 2 },
        { value: 'long', label: '3-7 years', score: 3 },
        { value: 'very-long', label: 'More than 7 years', score: 4 },
      ],
    },
  ],
  RISK_PROFILES: {
    conservative: {
      tolerance: 'conservative',
      maxPositionSizePercent: 5,
      description: 'You prefer stability and capital preservation.',
      recommendation: 'Focus on blue-chip stocks.',
    },
    moderate: {
      tolerance: 'moderate',
      maxPositionSizePercent: 10,
      description: 'You seek a balance between growth and stability.',
      recommendation: 'Build a diversified portfolio.',
    },
    aggressive: {
      tolerance: 'aggressive',
      maxPositionSizePercent: 20,
      description: 'You are comfortable with significant volatility.',
      recommendation: 'Take larger positions in high-conviction opportunities.',
    },
  },
  calculateRiskProfile: (answers: Record<string, number>) => {
    const scores = Object.values(answers)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)

    if (totalScore <= 6) {
      return {
        tolerance: 'conservative',
        score: totalScore,
        maxPositionSizePercent: 5,
        description: 'You prefer stability.',
        recommendation: 'Focus on blue-chip stocks.',
      }
    } else if (totalScore <= 9) {
      return {
        tolerance: 'moderate',
        score: totalScore,
        maxPositionSizePercent: 10,
        description: 'You seek balance.',
        recommendation: 'Build diversified portfolio.',
      }
    }
    return {
      tolerance: 'aggressive',
      score: totalScore,
      maxPositionSizePercent: 20,
      description: 'You are comfortable with volatility.',
      recommendation: 'Take larger positions.',
    }
  },
  getRiskProfileState: () => mockLocalStorage.getItem('paper-trading-risk-profile')
    ? JSON.parse(mockLocalStorage.getItem('paper-trading-risk-profile')!)
    : null,
  saveRiskProfile: (result: any) => {
    mockLocalStorage.setItem('paper-trading-risk-profile', JSON.stringify({
      tolerance: result.tolerance,
      score: result.score,
      completedAt: new Date().toISOString(),
    }))
  },
  clearRiskProfile: () => {
    mockLocalStorage.removeItem('paper-trading-risk-profile')
  },
}))

describe('RiskQuiz', () => {
  const mockOnClose = jest.fn()
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
  })

  it('does not render when isOpen is false', () => {
    render(<RiskQuiz isOpen={false} onClose={mockOnClose} />)

    expect(screen.queryByText('Risk Assessment Quiz')).not.toBeInTheDocument()
  })

  it('renders intro screen when isOpen is true', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText('Risk Assessment Quiz')).toBeInTheDocument()
    expect(screen.getByText(/Answer a few questions/)).toBeInTheDocument()
  })

  it('shows what you will learn section', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText("What you will learn:")).toBeInTheDocument()
    expect(screen.getByText('Your risk tolerance profile')).toBeInTheDocument()
    expect(screen.getByText('Recommended position sizes')).toBeInTheDocument()
  })

  it('shows question count and estimated time', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText(/3 questions/)).toBeInTheDocument()
    expect(screen.getByText(/Takes ~2 minutes/)).toBeInTheDocument()
  })

  it('starts quiz when Start Assessment is clicked', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Should show first question
    expect(screen.getByText('How would you react if your portfolio dropped 20% in a month?')).toBeInTheDocument()
  })

  it('shows progress indicator during quiz', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
  })

  it('shows progress bar percentage', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('allows selecting an answer', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Select first option
    fireEvent.click(screen.getByText('Sell everything immediately'))

    // Should advance to next question
    await waitFor(() => {
      expect(screen.getByText('What is your primary investment goal?')).toBeInTheDocument()
    })
  })

  it('advances to next question after selection', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Answer first question
    fireEvent.click(screen.getByText('Hold steady and wait'))

    await waitFor(() => {
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument()
    })
  })

  it('allows navigation back to previous question', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Answer first question
    fireEvent.click(screen.getByText('Hold steady and wait'))

    await waitFor(() => {
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument()
    })

    // Go back
    fireEvent.click(screen.getByText('Previous'))

    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
  })

  it('disables back button on first question', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    const previousButton = screen.getByText('Previous')
    expect(previousButton).toBeDisabled()
  })

  it('shows results after answering all questions', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Answer all 3 questions with aggressive answers (score 4 each = 12 total)
    fireEvent.click(screen.getByText('Buy more at lower prices'))

    await waitFor(() => {
      expect(screen.getByText('What is your primary investment goal?')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Maximize growth'))

    await waitFor(() => {
      expect(screen.getByText('How long do you plan to keep your money invested?')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('More than 7 years'))

    // Should show results
    await waitFor(() => {
      expect(screen.getByText('Your Risk Profile')).toBeInTheDocument()
    })
  })

  it('shows calculated risk profile in results', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Answer with low scores (conservative)
    fireEvent.click(screen.getByText('Sell everything immediately'))

    await waitFor(() => {
      expect(screen.getByText('What is your primary investment goal?')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Preserve capital'))

    await waitFor(() => {
      expect(screen.getByText('How long do you plan to keep your money invested?')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Less than 1 year'))

    // Should show conservative profile
    await waitFor(() => {
      expect(screen.getByText('Conservative Investor')).toBeInTheDocument()
    })
  })

  it('shows max position size recommendation', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Answer with moderate scores
    fireEvent.click(screen.getByText('Sell some holdings'))
    await waitFor(() => expect(screen.getByText('Question 2 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Generate income'))
    await waitFor(() => expect(screen.getByText('Question 3 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('1-3 years'))

    await waitFor(() => {
      expect(screen.getByText('Max Position Size')).toBeInTheDocument()
    })
  })

  it('calls onComplete with result when quiz is finished', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} onComplete={mockOnComplete} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Answer all questions
    fireEvent.click(screen.getByText('Hold steady and wait'))
    await waitFor(() => expect(screen.getByText('Question 2 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Grow wealth moderately'))
    await waitFor(() => expect(screen.getByText('Question 3 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('3-7 years'))

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('shows Retake Quiz button in results', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Complete quiz
    fireEvent.click(screen.getByText('Sell everything immediately'))
    await waitFor(() => expect(screen.getByText('Question 2 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Preserve capital'))
    await waitFor(() => expect(screen.getByText('Question 3 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Less than 1 year'))

    await waitFor(() => {
      expect(screen.getByText('Retake Quiz')).toBeInTheDocument()
    })
  })

  it('restarts quiz when Retake Quiz is clicked', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Complete quiz quickly
    fireEvent.click(screen.getByText('Sell everything immediately'))
    await waitFor(() => expect(screen.getByText('Question 2 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Preserve capital'))
    await waitFor(() => expect(screen.getByText('Question 3 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Less than 1 year'))

    await waitFor(() => {
      expect(screen.getByText('Retake Quiz')).toBeInTheDocument()
    })

    // Retake
    fireEvent.click(screen.getByText('Retake Quiz'))

    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
  })

  it('calls onClose when Done button is clicked in results', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Complete quiz
    fireEvent.click(screen.getByText('Hold steady and wait'))
    await waitFor(() => expect(screen.getByText('Question 2 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Grow wealth moderately'))
    await waitFor(() => expect(screen.getByText('Question 3 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('3-7 years'))

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Done'))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when X button is clicked', () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows score in results', async () => {
    render(<RiskQuiz isOpen={true} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText('Start Assessment'))

    // Complete quiz with known scores
    fireEvent.click(screen.getByText('Hold steady and wait')) // score 3
    await waitFor(() => expect(screen.getByText('Question 2 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Grow wealth moderately')) // score 3
    await waitFor(() => expect(screen.getByText('Question 3 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('3-7 years')) // score 3

    await waitFor(() => {
      expect(screen.getByText('Your Score')).toBeInTheDocument()
      expect(screen.getByText('9 / 12')).toBeInTheDocument()
    })
  })
})

describe('RiskQuizTrigger', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('renders Risk Assessment button when no existing profile', () => {
    render(<RiskQuizTrigger />)

    expect(screen.getByText('Risk Assessment')).toBeInTheDocument()
  })

  it('opens quiz when button is clicked', () => {
    render(<RiskQuizTrigger />)

    fireEvent.click(screen.getByText('Risk Assessment'))

    expect(screen.getByText('Risk Assessment Quiz')).toBeInTheDocument()
  })
})
