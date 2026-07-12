import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GlossaryTooltip, GlossaryHighlight } from '@/components/paper-trading/GlossaryTooltip'

// Mock the glossary module
jest.mock('@/lib/paper-trading/glossary', () => ({
  getGlossaryTerm: (term: string) => {
    const terms: Record<string, any> = {
      'P/E Ratio': {
        term: 'P/E Ratio',
        definition: 'Price-to-Earnings Ratio measures a company\'s current stock price relative to its earnings per share.',
        example: 'If a stock trades at $100 and has EPS of $5, its P/E ratio is 20.',
        learnMoreUrl: 'https://investopedia.com/pe-ratio',
      },
      ROI: {
        term: 'ROI',
        definition: 'Return on Investment is a performance metric used to evaluate the efficiency of an investment.',
        example: 'If you invest $1,000 and it grows to $1,200, your ROI is 20%.',
      },
      'Stop-Loss': {
        term: 'Stop-Loss',
        definition: 'A stop-loss order is designed to limit an investor\'s loss on a position.',
      },
    }
    return terms[term]
  },
  GLOSSARY_TERMS: {
    'P/E Ratio': { term: 'P/E Ratio', definition: 'Price-to-Earnings Ratio' },
    ROI: { term: 'ROI', definition: 'Return on Investment' },
    'Stop-Loss': { term: 'Stop-Loss', definition: 'Loss limiting order' },
  },
}))

describe('GlossaryTooltip', () => {
  it('renders trigger element with term', () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    expect(screen.getByText('P/E Ratio')).toBeInTheDocument()
  })

  it('renders children as trigger when provided', () => {
    render(<GlossaryTooltip term="P/E Ratio">Custom Trigger</GlossaryTooltip>)

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
  })

  it('shows tooltip on hover', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('displays term definition in tooltip', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByText(/Price-to-Earnings Ratio measures/)).toBeInTheDocument()
    })
  })

  it('shows example when provided', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByText(/Example:/)).toBeInTheDocument()
      expect(screen.getByText(/If a stock trades at \$100/)).toBeInTheDocument()
    })
  })

  it('shows Learn more link when learnMoreUrl is provided', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      const learnMoreLink = screen.getByText('Learn more')
      expect(learnMoreLink).toBeInTheDocument()
      expect(learnMoreLink).toHaveAttribute('href', 'https://investopedia.com/pe-ratio')
    })
  })

  it('does not show Learn more link when no URL provided', async () => {
    render(<GlossaryTooltip term="Stop-Loss" />)

    const trigger = screen.getByText('Stop-Loss')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.queryByText('Learn more')).not.toBeInTheDocument()
    })
  })

  it('hides tooltip on mouse leave', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')

    // Show tooltip
    fireEvent.mouseEnter(trigger)
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Hide tooltip
    fireEvent.mouseLeave(trigger)
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('shows tooltip on focus (keyboard accessible)', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')
    fireEvent.focus(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('hides tooltip on blur', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')

    // Show with focus
    fireEvent.focus(trigger)
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Hide with blur
    fireEvent.blur(trigger)
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('toggles tooltip with Enter key', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')

    // Press Enter to show
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Press Enter again to hide
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('toggles tooltip with Space key', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')

    // Press Space to show
    fireEvent.keyDown(trigger, { key: ' ' })
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('closes tooltip with Escape key', async () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')

    // Show tooltip
    fireEvent.mouseEnter(trigger)
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Press Escape
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('renders plain text for unknown terms', () => {
    render(<GlossaryTooltip term="Unknown Term" />)

    expect(screen.getByText('Unknown Term')).toBeInTheDocument()
    // Should not have tooltip functionality
    const trigger = screen.getByText('Unknown Term')
    fireEvent.mouseEnter(trigger)

    // No tooltip should appear
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows help icon by default', () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    // HelpCircle icon should be present
    const trigger = screen.getByText('P/E Ratio').closest('span')
    expect(trigger?.querySelector('svg')).toBeInTheDocument()
  })

  it('hides help icon when showIcon is false', () => {
    render(<GlossaryTooltip term="P/E Ratio" showIcon={false} />)

    const trigger = screen.getByText('P/E Ratio').closest('span')
    expect(trigger?.querySelector('svg')).not.toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<GlossaryTooltip term="P/E Ratio" />)

    const trigger = screen.getByText('P/E Ratio')

    expect(trigger).toHaveAttribute('role', 'button')
    expect(trigger).toHaveAttribute('tabIndex', '0')
    expect(trigger).toHaveAttribute('aria-describedby')
  })

  it('applies custom className', () => {
    render(<GlossaryTooltip term="P/E Ratio" className="custom-class" />)

    const trigger = screen.getByText('P/E Ratio')
    expect(trigger).toHaveClass('custom-class')
  })
})

describe('GlossaryHighlight', () => {
  it('highlights glossary terms in text', () => {
    render(<GlossaryHighlight text="Check the P/E Ratio and ROI for this stock." />)

    expect(screen.getByText('P/E Ratio')).toBeInTheDocument()
    expect(screen.getByText('ROI')).toBeInTheDocument()
  })

  it('wraps matching terms in GlossaryTooltip', async () => {
    render(<GlossaryHighlight text="The P/E Ratio is important." />)

    const peRatio = screen.getByText('P/E Ratio')
    fireEvent.mouseEnter(peRatio)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('renders non-matching text as plain spans', () => {
    render(<GlossaryHighlight text="This has no glossary terms." />)

    expect(screen.getByText(/This has no glossary terms/)).toBeInTheDocument()
  })

  it('limits to specified terms when provided', () => {
    render(
      <GlossaryHighlight
        text="Check the P/E Ratio and ROI for this stock."
        terms={['P/E Ratio']}
      />
    )

    // P/E Ratio should be highlighted
    const peRatio = screen.getByText('P/E Ratio')
    expect(peRatio.closest('span[role="button"]')).toBeInTheDocument()

    // ROI should be plain text (not highlighted) when not in terms array
    // This depends on implementation - it may still render but without tooltip
  })
})
