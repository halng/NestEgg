import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataTable } from '@/components/DataTable'
import { mockStocks } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'

jest.mock('../components/StockChart', () => ({
  StockChart: ({ ticker }: { ticker: string }) => <div data-testid="stock-chart">{ticker} chart</div>,
}))

const mockAgentSuggestion = {
  ticker: 'FPT',
  name: 'FPT Corporation',
  analysisDate: '2026-05-29',
  action: 'ACCUMULATE',
  conviction: 72,
  targetWeightPercent: 5,
  thesis: 'FPT has durable quality and improving momentum.',
  keyRisks: ['Beta: 0.92'],
  analystReports: [
    { role: 'Fundamentals Analyst', stance: 'Bullish', score: 78, summary: 'Quality profile.', evidence: ['ROE: 28.4'] },
    { role: 'Technical Analyst', stance: 'Neutral', score: 61, summary: 'Momentum profile.', evidence: ['Change: 2.1'] },
  ],
  researchDebate: { bullishCase: 'Bull case', bearishCase: 'Bear case', synthesis: 'Synthesis' },
  traderReport: { role: 'Trader Agent', stance: 'Bullish', score: 72, summary: 'Trade intent.', evidence: ['Consensus: 72'] },
  riskAssessment: { riskLevel: 'Moderate', riskScore: 54, suggestedStopLossPercent: 13.4, constraints: ['Beta: 0.92'] },
  portfolioDecision: { action: 'ACCUMULATE', approved: true, targetWeightPercent: 5, rationale: 'Portfolio manager approves.' },
  disclaimer: 'Not financial advice.',
}

describe('DataTable Compare Interactions', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => `event: suggestion\ndata: ${JSON.stringify(mockAgentSuggestion)}\n\n`,
    }) as jest.Mock
  })

  it('selects stocks and renders the Compare action button', () => {
    render(<DataTable data={mockStocks.slice(0, 3)} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(3)

    // The onClick is attached to the <td> wrapper
    const firstCheckboxTd = checkboxes[0].parentElement?.parentElement
    if (firstCheckboxTd) fireEvent.click(firstCheckboxTd)

    // Verify floating bar appears with count
    expect(screen.getByText('1 Selected')).toBeInTheDocument()

    const secondCheckboxTd = checkboxes[1].parentElement?.parentElement
    if (secondCheckboxTd) fireEvent.click(secondCheckboxTd)

    expect(screen.getByText('2 Selected')).toBeInTheDocument()
  })

  it('renders the TradingAgents suggestion returned by the API', async () => {
    render(<DataTable data={mockStocks.slice(0, 1)} />)

    expect(await screen.findAllByText('TradingAgents suggestion')).not.toHaveLength(0)
    expect(screen.getAllByText('ACCUMULATE')).not.toHaveLength(0)
    expect(screen.getAllByText('FPT has durable quality and improving momentum.')).not.toHaveLength(0)
    expect(screen.getAllByText('Fundamentals Analyst')).not.toHaveLength(0)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/backend/agents/suggestions?ticker=FPT',
      expect.objectContaining({ headers: { Accept: 'text/event-stream' } })
    )
  })

  it('falls back to a local agent preview when the API is unavailable', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network unavailable'))

    render(<DataTable data={mockStocks.slice(0, 1)} />)

    expect(await screen.findAllByText('TradingAgents suggestion')).not.toHaveLength(0)
    expect(screen.getAllByText('Live API unavailable; showing local preview.')).not.toHaveLength(0)
    await waitFor(() => expect(screen.getAllByText(/FPT combines a quality profile/i)).not.toHaveLength(0))
  })

  it('navigates to /compare with chosen tickers when Compare is clicked', () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    })

    render(<DataTable data={mockStocks.slice(0, 3)} />)

    const checkboxes = screen.getAllByRole('checkbox')
    const firstCheckboxTd = checkboxes[0].parentElement?.parentElement
    if (firstCheckboxTd) fireEvent.click(firstCheckboxTd)

    const compareButton = screen.getByRole('button', { name: /Compare/i })
    fireEvent.click(compareButton)

    // Our mock mockStocks.slice(0, 3) begins with FPT
    expect(mockPush).toHaveBeenCalledWith('/compare?tickers=FPT')
  })
})
