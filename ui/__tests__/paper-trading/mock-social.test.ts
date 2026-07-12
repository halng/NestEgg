import {
  mockLeaderboardData,
  mockCompetitions,
  getLeaderboardByPeriod,
  getCompetitionById,
  getActiveCompetitions,
  getUpcomingCompetitions,
  getEndedCompetitions,
} from '@/lib/paper-trading/mock-social'
import type { LeaderboardPeriod } from '@/lib/paper-trading/types'

describe('mockLeaderboardData', () => {
  describe('data structure', () => {
    it('has entries for all period types', () => {
      expect(mockLeaderboardData).toHaveProperty('week')
      expect(mockLeaderboardData).toHaveProperty('month')
      expect(mockLeaderboardData).toHaveProperty('all-time')
    })

    it('each period has at least 10 entries', () => {
      expect(mockLeaderboardData.week.length).toBeGreaterThanOrEqual(10)
      expect(mockLeaderboardData.month.length).toBeGreaterThanOrEqual(10)
      expect(mockLeaderboardData['all-time'].length).toBeGreaterThanOrEqual(10)
    })

    it('each entry has required properties', () => {
      const allEntries = [
        ...mockLeaderboardData.week,
        ...mockLeaderboardData.month,
        ...mockLeaderboardData['all-time'],
      ]

      allEntries.forEach(entry => {
        expect(entry).toHaveProperty('rank')
        expect(entry).toHaveProperty('username')
        expect(entry).toHaveProperty('roi')
        expect(entry).toHaveProperty('portfolioValue')
        expect(entry).toHaveProperty('trades')
        expect(typeof entry.rank).toBe('number')
        expect(typeof entry.username).toBe('string')
        expect(typeof entry.roi).toBe('number')
        expect(typeof entry.portfolioValue).toBe('number')
        expect(typeof entry.trades).toBe('number')
      })
    })
  })

  describe('sorting', () => {
    it('entries are sorted by rank ascending', () => {
      const periods: LeaderboardPeriod[] = ['week', 'month', 'all-time']

      periods.forEach(period => {
        const entries = mockLeaderboardData[period]
        for (let i = 0; i < entries.length - 1; i++) {
          expect(entries[i].rank).toBeLessThan(entries[i + 1].rank)
        }
      })
    })

    it('higher ROI corresponds to better rank', () => {
      const periods: LeaderboardPeriod[] = ['week', 'month', 'all-time']

      periods.forEach(period => {
        const entries = mockLeaderboardData[period]
        for (let i = 0; i < entries.length - 1; i++) {
          expect(entries[i].roi).toBeGreaterThanOrEqual(entries[i + 1].roi)
        }
      })
    })
  })

  describe('current user', () => {
    it('includes current user entry in each period', () => {
      const periods: LeaderboardPeriod[] = ['week', 'month', 'all-time']

      periods.forEach(period => {
        const currentUser = mockLeaderboardData[period].find(e => e.isCurrentUser)
        expect(currentUser).toBeDefined()
        expect(currentUser!.username).toBe('You')
      })
    })
  })

  describe('data validity', () => {
    it('ranks are sequential', () => {
      const periods: LeaderboardPeriod[] = ['week', 'month', 'all-time']

      periods.forEach(period => {
        const entries = mockLeaderboardData[period]
        entries.forEach((entry, index) => {
          expect(entry.rank).toBe(index + 1)
        })
      })
    })

    it('portfolio values are positive', () => {
      const allEntries = [
        ...mockLeaderboardData.week,
        ...mockLeaderboardData.month,
        ...mockLeaderboardData['all-time'],
      ]

      allEntries.forEach(entry => {
        expect(entry.portfolioValue).toBeGreaterThan(0)
      })
    })

    it('trades count is non-negative', () => {
      const allEntries = [
        ...mockLeaderboardData.week,
        ...mockLeaderboardData.month,
        ...mockLeaderboardData['all-time'],
      ]

      allEntries.forEach(entry => {
        expect(entry.trades).toBeGreaterThanOrEqual(0)
      })
    })
  })
})

describe('mockCompetitions', () => {
  describe('data structure', () => {
    it('contains at least 3 competitions', () => {
      expect(mockCompetitions.length).toBeGreaterThanOrEqual(3)
    })

    it('each competition has required properties', () => {
      mockCompetitions.forEach(competition => {
        expect(competition).toHaveProperty('id')
        expect(competition).toHaveProperty('name')
        expect(competition).toHaveProperty('description')
        expect(competition).toHaveProperty('status')
        expect(competition).toHaveProperty('startDate')
        expect(competition).toHaveProperty('endDate')
        expect(competition).toHaveProperty('participants')
        expect(competition).toHaveProperty('prizePool')
        expect(competition).toHaveProperty('prizes')
      })
    })

    it('prizes array has position and prize info', () => {
      mockCompetitions.forEach(competition => {
        expect(Array.isArray(competition.prizes)).toBe(true)
        expect(competition.prizes.length).toBeGreaterThan(0)

        competition.prizes.forEach(prize => {
          expect(prize).toHaveProperty('position')
          expect(prize).toHaveProperty('prize')
          expect(typeof prize.position).toBe('number')
          expect(typeof prize.prize).toBe('string')
        })
      })
    })
  })

  describe('competition statuses', () => {
    it('has competitions with all status types', () => {
      const statuses = mockCompetitions.map(c => c.status)
      expect(statuses).toContain('active')
      expect(statuses).toContain('upcoming')
      expect(statuses).toContain('ended')
    })

    it('status is one of valid values', () => {
      const validStatuses = ['active', 'upcoming', 'ended']
      mockCompetitions.forEach(competition => {
        expect(validStatuses).toContain(competition.status)
      })
    })
  })

  describe('leaderboard for joined competitions', () => {
    it('active joined competitions have leaderboard', () => {
      const joinedActive = mockCompetitions.filter(
        c => c.isJoined && c.status === 'active'
      )

      joinedActive.forEach(competition => {
        expect(competition.leaderboard).toBeDefined()
        expect(Array.isArray(competition.leaderboard)).toBe(true)
        expect(competition.leaderboard!.length).toBeGreaterThan(0)
      })
    })
  })

  describe('date validity', () => {
    it('end date is after start date', () => {
      mockCompetitions.forEach(competition => {
        const start = new Date(competition.startDate)
        const end = new Date(competition.endDate)
        expect(end.getTime()).toBeGreaterThan(start.getTime())
      })
    })
  })
})

describe('getLeaderboardByPeriod', () => {
  it('returns correct entries for week period', () => {
    const result = getLeaderboardByPeriod('week')
    expect(result).toEqual(mockLeaderboardData.week)
  })

  it('returns correct entries for month period', () => {
    const result = getLeaderboardByPeriod('month')
    expect(result).toEqual(mockLeaderboardData.month)
  })

  it('returns correct entries for all-time period', () => {
    const result = getLeaderboardByPeriod('all-time')
    expect(result).toEqual(mockLeaderboardData['all-time'])
  })

  it('returns empty array for invalid period', () => {
    const result = getLeaderboardByPeriod('invalid' as LeaderboardPeriod)
    expect(result).toEqual([])
  })
})

describe('getCompetitionById', () => {
  it('returns competition when found', () => {
    const competition = mockCompetitions[0]
    const result = getCompetitionById(competition.id)
    expect(result).toEqual(competition)
  })

  it('returns undefined for non-existent id', () => {
    const result = getCompetitionById('non-existent-id')
    expect(result).toBeUndefined()
  })
})

describe('getActiveCompetitions', () => {
  it('returns only active competitions', () => {
    const result = getActiveCompetitions()
    result.forEach(competition => {
      expect(competition.status).toBe('active')
    })
  })

  it('returns at least one active competition', () => {
    const result = getActiveCompetitions()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('getUpcomingCompetitions', () => {
  it('returns only upcoming competitions', () => {
    const result = getUpcomingCompetitions()
    result.forEach(competition => {
      expect(competition.status).toBe('upcoming')
    })
  })

  it('returns at least one upcoming competition', () => {
    const result = getUpcomingCompetitions()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('getEndedCompetitions', () => {
  it('returns only ended competitions', () => {
    const result = getEndedCompetitions()
    result.forEach(competition => {
      expect(competition.status).toBe('ended')
    })
  })

  it('returns at least one ended competition', () => {
    const result = getEndedCompetitions()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('competition filtering completeness', () => {
  it('all competitions are in exactly one category', () => {
    const active = getActiveCompetitions()
    const upcoming = getUpcomingCompetitions()
    const ended = getEndedCompetitions()

    const totalFiltered = active.length + upcoming.length + ended.length
    expect(totalFiltered).toBe(mockCompetitions.length)
  })
})
