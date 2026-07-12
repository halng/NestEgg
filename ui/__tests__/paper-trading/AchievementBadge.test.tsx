import { render, screen } from '@testing-library/react'
import { AchievementBadge } from '@/components/paper-trading/AchievementBadge'
import type { Achievement } from '@/lib/paper-trading/types'

describe('AchievementBadge', () => {
  const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
    id: 'first-trade',
    name: 'First Trade',
    description: 'Complete your first order',
    icon: 'Rocket',
    category: 'trading',
    status: 'locked',
    ...overrides,
  })

  it('renders achievement name and description', () => {
    const achievement = createMockAchievement({ status: 'unlocked', unlockedAt: '2026-07-10T10:30:00Z' })

    render(<AchievementBadge achievement={achievement} />)

    expect(screen.getByText('First Trade')).toBeInTheDocument()
    expect(screen.getByText('Complete your first order')).toBeInTheDocument()
  })

  it('shows lock styling for locked achievements', () => {
    const achievement = createMockAchievement({ status: 'locked' })

    const { container } = render(<AchievementBadge achievement={achievement} />)

    // Locked achievements should have opacity-60 class
    const badge = container.firstChild
    expect(badge).toHaveClass('opacity-60')
  })

  it('shows unlocked styling without opacity', () => {
    const achievement = createMockAchievement({
      status: 'unlocked',
      unlockedAt: '2026-07-10T10:30:00Z',
    })

    const { container } = render(<AchievementBadge achievement={achievement} />)

    const badge = container.firstChild
    expect(badge).not.toHaveClass('opacity-60')
  })

  it('shows category label for unlocked achievements', () => {
    const achievement = createMockAchievement({
      status: 'unlocked',
      category: 'trading',
      unlockedAt: '2026-07-10T10:30:00Z',
    })

    render(<AchievementBadge achievement={achievement} />)

    expect(screen.getByText('Trading')).toBeInTheDocument()
  })

  it('shows progress bar for in-progress achievements', () => {
    const achievement = createMockAchievement({
      status: 'in-progress',
      progress: 7,
      maxProgress: 10,
    })

    render(<AchievementBadge achievement={achievement} />)

    expect(screen.getByText('7/10')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('calculates correct progress display', () => {
    const achievement = createMockAchievement({
      status: 'in-progress',
      progress: 5,
      maxProgress: 20,
    })

    render(<AchievementBadge achievement={achievement} />)

    expect(screen.getByText('5/20')).toBeInTheDocument()
  })

  it('displays unlocked date for unlocked achievements', () => {
    const achievement = createMockAchievement({
      status: 'unlocked',
      unlockedAt: '2026-07-10T10:30:00Z',
    })

    render(<AchievementBadge achievement={achievement} />)

    // Should display "Unlocked" text with relative time
    expect(screen.getByText(/Unlocked/)).toBeInTheDocument()
  })

  it('hides details when showDetails is false', () => {
    const achievement = createMockAchievement({ status: 'unlocked', unlockedAt: '2026-07-10T00:00:00Z' })

    render(<AchievementBadge achievement={achievement} showDetails={false} />)

    expect(screen.queryByText('First Trade')).not.toBeInTheDocument()
    expect(screen.queryByText('Complete your first order')).not.toBeInTheDocument()
  })

  it('applies correct size classes for sm size', () => {
    const achievement = createMockAchievement({ status: 'unlocked', unlockedAt: '2026-07-10T00:00:00Z' })

    const { container } = render(<AchievementBadge achievement={achievement} size="sm" />)

    const badge = container.firstChild
    expect(badge).toHaveClass('p-2')
  })

  it('applies correct size classes for md size', () => {
    const achievement = createMockAchievement({ status: 'unlocked', unlockedAt: '2026-07-10T00:00:00Z' })

    const { container } = render(<AchievementBadge achievement={achievement} size="md" />)

    const badge = container.firstChild
    expect(badge).toHaveClass('p-3')
  })

  it('applies correct size classes for lg size', () => {
    const achievement = createMockAchievement({ status: 'unlocked', unlockedAt: '2026-07-10T00:00:00Z' })

    const { container } = render(<AchievementBadge achievement={achievement} size="lg" />)

    const badge = container.firstChild
    expect(badge).toHaveClass('p-4')
  })

  it('renders learning category label', () => {
    const learningAchievement = createMockAchievement({
      id: 'quiz-master',
      name: 'Quiz Master',
      status: 'unlocked',
      category: 'learning',
      unlockedAt: '2026-07-10T00:00:00Z',
    })

    render(<AchievementBadge achievement={learningAchievement} />)

    expect(screen.getByText('Learning')).toBeInTheDocument()
  })

  it('renders social category label', () => {
    const socialAchievement = createMockAchievement({
      id: 'social-star',
      name: 'Social Star',
      status: 'unlocked',
      category: 'social',
      unlockedAt: '2026-07-10T00:00:00Z',
    })

    render(<AchievementBadge achievement={socialAchievement} />)

    expect(screen.getByText('Social')).toBeInTheDocument()
  })

  it('does not show progress bar for locked achievements', () => {
    const achievement = createMockAchievement({
      status: 'locked',
      progress: 0,
      maxProgress: 10,
    })

    render(<AchievementBadge achievement={achievement} />)

    expect(screen.queryByText('Progress')).not.toBeInTheDocument()
  })

  it('applies border styling for in-progress achievements', () => {
    const achievement = createMockAchievement({
      status: 'in-progress',
      progress: 5,
      maxProgress: 10,
    })

    const { container } = render(<AchievementBadge achievement={achievement} />)

    const badge = container.firstChild
    expect(badge).toHaveClass('border-border')
  })
})
