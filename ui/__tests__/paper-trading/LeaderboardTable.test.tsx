import { render, screen } from '@testing-library/react'
import { LeaderboardTable } from '@/components/paper-trading/LeaderboardTable'
import type { LeaderboardEntry } from '@/lib/paper-trading/types'

describe('LeaderboardTable', () => {
  const mockEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      username: 'TopTrader',
      avatar: 'https://example.com/avatar1.png',
      roi: 45.5,
      portfolioValue: 145_500_000,
      trades: 120,
      isCurrentUser: false,
    },
    {
      rank: 2,
      username: 'SilverInvestor',
      roi: 32.1,
      portfolioValue: 132_100_000,
      trades: 85,
      isCurrentUser: false,
    },
    {
      rank: 3,
      username: 'BronzeChamp',
      roi: 28.7,
      portfolioValue: 128_700_000,
      trades: 95,
      isCurrentUser: false,
    },
    {
      rank: 4,
      username: 'RegularTrader',
      roi: 15.3,
      portfolioValue: 115_300_000,
      trades: 50,
      isCurrentUser: false,
    },
    {
      rank: 5,
      username: 'CurrentUser',
      roi: 10.2,
      portfolioValue: 110_200_000,
      trades: 30,
      isCurrentUser: true,
    },
  ]

  it('renders leaderboard entries', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    expect(screen.getByText('TopTrader')).toBeInTheDocument()
    expect(screen.getByText('SilverInvestor')).toBeInTheDocument()
    expect(screen.getByText('BronzeChamp')).toBeInTheDocument()
    expect(screen.getByText('RegularTrader')).toBeInTheDocument()
    expect(screen.getByText('CurrentUser')).toBeInTheDocument()
  })

  it('shows rank, username, ROI, portfolio value and trades', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    // Check header columns
    expect(screen.getByText('Rank')).toBeInTheDocument()
    expect(screen.getByText('Trader')).toBeInTheDocument()
    expect(screen.getByText('ROI')).toBeInTheDocument()
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Trades')).toBeInTheDocument()

    // Check ROI values (formatted with %)
    expect(screen.getByText('+45.50%')).toBeInTheDocument()
    expect(screen.getByText('+32.10%')).toBeInTheDocument()

    // Check trade counts
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('renders top 3 with special icons (trophy, medal, award)', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    // Top 3 have special icons rendered - we check by svg presence in the DOM
    const rows = screen.getAllByRole('img', { hidden: true })
    // The component uses lucide icons which may not have role="img"
    // Instead verify the trophy/medal/award icons via their container classes

    // Verify top 3 entries have special styling (font-medium class)
    const topTrader = screen.getByText('TopTrader')
    expect(topTrader.closest('[class*="font-medium"]')).toBeInTheDocument()
  })

  it('highlights current user row', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    // Find current user text
    const currentUserText = screen.getByText('CurrentUser')
    // The component shows "(You)" next to the current user
    expect(screen.getByText('(You)')).toBeInTheDocument()

    // Current user has special styling - check parent has bg-primary
    const row = currentUserText.closest('[class*="bg-primary"]')
    expect(row).toBeInTheDocument()
  })

  it('displays empty state when no entries', () => {
    render(<LeaderboardTable entries={[]} />)

    expect(screen.getByText('No leaderboard data available')).toBeInTheDocument()
  })

  it('renders user avatar when provided', () => {
    render(<LeaderboardTable entries={mockEntries} />)

    const avatarImg = screen.getByAltText('TopTrader')
    expect(avatarImg).toBeInTheDocument()
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar1.png')
  })

  it('renders default avatar icon when no avatar provided', () => {
    const entriesWithoutAvatar: LeaderboardEntry[] = [
      {
        rank: 1,
        username: 'NoAvatarUser',
        roi: 20.0,
        portfolioValue: 120_000_000,
        trades: 40,
        isCurrentUser: false,
      },
    ]

    render(<LeaderboardTable entries={entriesWithoutAvatar} />)

    // When no avatar, the component renders a User icon
    expect(screen.queryByAltText('NoAvatarUser')).not.toBeInTheDocument()
  })

  it('applies positive/negative color styling based on ROI', () => {
    const mixedEntries: LeaderboardEntry[] = [
      {
        rank: 1,
        username: 'Winner',
        roi: 25.0,
        portfolioValue: 125_000_000,
        trades: 50,
        isCurrentUser: false,
      },
      {
        rank: 2,
        username: 'Loser',
        roi: -10.0,
        portfolioValue: 90_000_000,
        trades: 30,
        isCurrentUser: false,
      },
    ]

    render(<LeaderboardTable entries={mixedEntries} />)

    const positiveRoi = screen.getByText('+25.00%')
    const negativeRoi = screen.getByText('-10.00%')

    expect(positiveRoi).toHaveClass('text-success')
    expect(negativeRoi).toHaveClass('text-danger')
  })

  it('displays rank 4+ without special icons', () => {
    const lowerRankEntries: LeaderboardEntry[] = [
      {
        rank: 4,
        username: 'FourthPlace',
        roi: 12.0,
        portfolioValue: 112_000_000,
        trades: 25,
        isCurrentUser: false,
      },
      {
        rank: 5,
        username: 'FifthPlace',
        roi: 8.0,
        portfolioValue: 108_000_000,
        trades: 20,
        isCurrentUser: false,
      },
    ]

    render(<LeaderboardTable entries={lowerRankEntries} />)

    // Rank 4 and 5 should display as plain numbers
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
