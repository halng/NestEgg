import { render, screen, fireEvent } from '@testing-library/react'
import { AchievementsList } from '@/components/paper-trading/AchievementsList'
import type { Achievement } from '@/lib/paper-trading/types'

describe('AchievementsList', () => {
  const mockAchievements: Achievement[] = [
    {
      id: 'first-trade',
      name: 'First Trade',
      description: 'Complete your first order',
      icon: 'Rocket',
      category: 'trading',
      status: 'unlocked',
      unlockedAt: '2026-06-15T10:30:00Z',
    },
    {
      id: 'diversifier',
      name: 'Diversifier',
      description: 'Hold 5+ different stocks',
      icon: 'PieChart',
      category: 'trading',
      status: 'unlocked',
      unlockedAt: '2026-06-20T14:22:00Z',
    },
    {
      id: 'profit-master',
      name: 'Profit Master',
      description: 'Achieve 10% portfolio gain',
      icon: 'TrendingUp',
      category: 'trading',
      status: 'in-progress',
      progress: 7,
      maxProgress: 10,
    },
    {
      id: 'journal-keeper',
      name: 'Journal Keeper',
      description: 'Write 10 journal entries',
      icon: 'BookOpen',
      category: 'learning',
      status: 'in-progress',
      progress: 4,
      maxProgress: 10,
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Complete risk assessment quiz',
      icon: 'GraduationCap',
      category: 'learning',
      status: 'unlocked',
      unlockedAt: '2026-06-10T09:15:00Z',
    },
    {
      id: 'social-butterfly',
      name: 'Social Butterfly',
      description: 'Share a trade with the community',
      icon: 'Share2',
      category: 'social',
      status: 'locked',
    },
    {
      id: 'top-ten',
      name: 'Top 10',
      description: 'Reach the leaderboard top 10',
      icon: 'Trophy',
      category: 'social',
      status: 'locked',
    },
  ]

  it('renders list of achievements', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    expect(screen.getByText('First Trade')).toBeInTheDocument()
    expect(screen.getByText('Diversifier')).toBeInTheDocument()
    expect(screen.getByText('Profit Master')).toBeInTheDocument()
    expect(screen.getByText('Journal Keeper')).toBeInTheDocument()
    expect(screen.getByText('Quiz Master')).toBeInTheDocument()
    expect(screen.getByText('Social Butterfly')).toBeInTheDocument()
    expect(screen.getByText('Top 10')).toBeInTheDocument()
  })

  it('shows progress summary when showProgress is true', () => {
    render(<AchievementsList achievements={mockAchievements} showProgress={true} />)

    expect(screen.getByText('Achievement Progress')).toBeInTheDocument()
  })

  it('hides progress summary when showProgress is false', () => {
    render(<AchievementsList achievements={mockAchievements} showProgress={false} />)

    expect(screen.queryByText('Achievement Progress')).not.toBeInTheDocument()
  })

  it('displays category filter buttons', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trading/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Learning/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Social/i })).toBeInTheDocument()
  })

  it('filters achievements by Trading category', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    fireEvent.click(screen.getByRole('button', { name: /Trading/i }))

    // Should show trading achievements
    expect(screen.getByText('First Trade')).toBeInTheDocument()
    expect(screen.getByText('Diversifier')).toBeInTheDocument()
    expect(screen.getByText('Profit Master')).toBeInTheDocument()

    // Should not show learning or social achievements
    expect(screen.queryByText('Journal Keeper')).not.toBeInTheDocument()
    expect(screen.queryByText('Quiz Master')).not.toBeInTheDocument()
    expect(screen.queryByText('Social Butterfly')).not.toBeInTheDocument()
  })

  it('filters achievements by Learning category', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    fireEvent.click(screen.getByRole('button', { name: /Learning/i }))

    // Should show learning achievements
    expect(screen.getByText('Journal Keeper')).toBeInTheDocument()
    expect(screen.getByText('Quiz Master')).toBeInTheDocument()

    // Should not show trading or social achievements
    expect(screen.queryByText('First Trade')).not.toBeInTheDocument()
    expect(screen.queryByText('Social Butterfly')).not.toBeInTheDocument()
  })

  it('filters achievements by Social category', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    fireEvent.click(screen.getByRole('button', { name: /Social/i }))

    // Should show social achievements
    expect(screen.getByText('Social Butterfly')).toBeInTheDocument()
    expect(screen.getByText('Top 10')).toBeInTheDocument()

    // Should not show trading or learning achievements
    expect(screen.queryByText('First Trade')).not.toBeInTheDocument()
    expect(screen.queryByText('Journal Keeper')).not.toBeInTheDocument()
  })

  it('shows all achievements when All filter is selected', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    // First filter to a specific category
    fireEvent.click(screen.getByRole('button', { name: /Trading/i }))

    // Then select All
    fireEvent.click(screen.getByRole('button', { name: /All/i }))

    // Should show all achievements
    expect(screen.getByText('First Trade')).toBeInTheDocument()
    expect(screen.getByText('Journal Keeper')).toBeInTheDocument()
    expect(screen.getByText('Social Butterfly')).toBeInTheDocument()
  })

  it('shows empty state when no achievements match filter', () => {
    const emptyAchievements: Achievement[] = []

    render(<AchievementsList achievements={emptyAchievements} />)

    expect(screen.getByText('No achievements found')).toBeInTheDocument()
  })

  it('highlights active filter button', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    const allButton = screen.getByRole('button', { name: /All/i })

    // All should be active by default
    expect(allButton).toHaveClass('bg-primary')

    // Click Trading filter
    fireEvent.click(screen.getByRole('button', { name: /Trading/i }))
    const tradingButton = screen.getByRole('button', { name: /Trading/i })

    expect(tradingButton).toHaveClass('bg-primary')
  })

  it('renders achievement descriptions', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    expect(screen.getByText('Complete your first order')).toBeInTheDocument()
    expect(screen.getByText('Hold 5+ different stocks')).toBeInTheDocument()
    expect(screen.getByText('Achieve 10% portfolio gain')).toBeInTheDocument()
  })

  it('shows progress values for in-progress achievements', () => {
    render(<AchievementsList achievements={mockAchievements} />)

    // Progress for Profit Master (7/10)
    expect(screen.getByText('7/10')).toBeInTheDocument()

    // Progress for Journal Keeper (4/10)
    expect(screen.getByText('4/10')).toBeInTheDocument()
  })
})
