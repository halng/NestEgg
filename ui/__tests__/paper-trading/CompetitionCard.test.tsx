import { render, screen, fireEvent } from '@testing-library/react'
import { CompetitionCard } from '@/components/paper-trading/CompetitionCard'
import type { Competition } from '@/lib/paper-trading/types'

describe('CompetitionCard', () => {
  const mockOnJoin = jest.fn()
  const mockOnLeave = jest.fn()
  const mockOnViewDetails = jest.fn()

  const createMockCompetition = (overrides: Partial<Competition> = {}): Competition => ({
    id: 'comp-1',
    name: 'Summer Trading Challenge',
    description: 'Compete with other traders for the top spot',
    status: 'active',
    startDate: '2026-07-01T00:00:00Z',
    endDate: '2026-08-31T23:59:59Z',
    participants: 150,
    maxParticipants: 500,
    prizePool: '50,000,000 VND',
    prizes: [
      { position: 1, prize: '25,000,000 VND + Trophy' },
      { position: 2, prize: '15,000,000 VND + Medal' },
      { position: 3, prize: '10,000,000 VND + Badge' },
    ],
    isJoined: false,
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders competition name and description', () => {
    const competition = createMockCompetition()

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Summer Trading Challenge')).toBeInTheDocument()
    expect(screen.getByText('Compete with other traders for the top spot')).toBeInTheDocument()
  })

  it('shows Active status badge for active competitions', () => {
    const competition = createMockCompetition({ status: 'active' })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows Upcoming status badge for upcoming competitions', () => {
    const competition = createMockCompetition({ status: 'upcoming' })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Upcoming')).toBeInTheDocument()
  })

  it('shows Ended status badge for ended competitions', () => {
    const competition = createMockCompetition({ status: 'ended' })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('displays start and end dates', () => {
    const competition = createMockCompetition()

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    // Dates are formatted by formatDate helper - match any reasonable date format
    // The component shows dates via formatDate which may vary by locale
    const dateElements = screen.getAllByText(/2026/)
    expect(dateElements.length).toBeGreaterThanOrEqual(2)
  })

  it('shows prize pool information', () => {
    const competition = createMockCompetition()

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('50,000,000 VND')).toBeInTheDocument()
  })

  it('shows participant count with max participants', () => {
    const competition = createMockCompetition({
      participants: 150,
      maxParticipants: 500,
    })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('150 / 500')).toBeInTheDocument()
  })

  it('shows participant count without max when no limit', () => {
    const competition = createMockCompetition({
      participants: 150,
      maxParticipants: undefined,
    })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('shows Join Competition button for active competitions when not joined', () => {
    const competition = createMockCompetition({ status: 'active', isJoined: false })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Join Competition')).toBeInTheDocument()
  })

  it('shows Register Now button for upcoming competitions when not joined', () => {
    const competition = createMockCompetition({ status: 'upcoming', isJoined: false })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Register Now')).toBeInTheDocument()
  })

  it('calls onJoin when Join/Register button is clicked', () => {
    const competition = createMockCompetition({ status: 'active', isJoined: false })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    fireEvent.click(screen.getByText('Join Competition'))
    expect(mockOnJoin).toHaveBeenCalledWith('comp-1')
  })

  it('shows Leave button when already joined and competition is not ended', () => {
    const competition = createMockCompetition({ status: 'active', isJoined: true })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Leave')).toBeInTheDocument()
    expect(screen.getByText('Joined')).toBeInTheDocument()
  })

  it('calls onLeave when Leave button is clicked', () => {
    const competition = createMockCompetition({ status: 'active', isJoined: true })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    fireEvent.click(screen.getByText('Leave'))
    expect(mockOnLeave).toHaveBeenCalledWith('comp-1')
  })

  it('does not show Leave button for ended competitions', () => {
    const competition = createMockCompetition({ status: 'ended', isJoined: true })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.queryByText('Leave')).not.toBeInTheDocument()
  })

  it('shows View Details button', () => {
    const competition = createMockCompetition()

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('calls onViewDetails when View Details button is clicked', () => {
    const competition = createMockCompetition()

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    fireEvent.click(screen.getByText('View Details'))
    expect(mockOnViewDetails).toHaveBeenCalledWith(competition)
  })

  it('shows "Competition full" when max participants reached', () => {
    const competition = createMockCompetition({
      status: 'active',
      participants: 500,
      maxParticipants: 500,
      isJoined: false,
    })

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText('Competition full')).toBeInTheDocument()
    expect(screen.queryByText('Join Competition')).not.toBeInTheDocument()
  })

  it('displays top 3 prizes preview', () => {
    const competition = createMockCompetition()

    render(
      <CompetitionCard
        competition={competition}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onViewDetails={mockOnViewDetails}
      />
    )

    expect(screen.getByText(/#1: 25,000,000/)).toBeInTheDocument()
    expect(screen.getByText(/#2: 15,000,000/)).toBeInTheDocument()
    expect(screen.getByText(/#3: 10,000,000/)).toBeInTheDocument()
  })
})
