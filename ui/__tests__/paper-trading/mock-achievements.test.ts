import {
  mockAchievements,
  ACHIEVEMENT_ICONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_BG_COLORS,
  getAchievementsByCategory,
  getUnlockedAchievements,
  getLockedAchievements,
  getInProgressAchievements,
  getAchievementProgress,
} from '@/lib/paper-trading/mock-achievements'
import type { AchievementCategory, AchievementStatus } from '@/lib/paper-trading/types'

describe('mockAchievements', () => {
  describe('data structure', () => {
    it('contains at least 5 achievements', () => {
      expect(mockAchievements.length).toBeGreaterThanOrEqual(5)
    })

    it('each achievement has required properties', () => {
      mockAchievements.forEach(achievement => {
        expect(achievement).toHaveProperty('id')
        expect(achievement).toHaveProperty('name')
        expect(achievement).toHaveProperty('description')
        expect(achievement).toHaveProperty('icon')
        expect(achievement).toHaveProperty('category')
        expect(achievement).toHaveProperty('status')
        expect(typeof achievement.id).toBe('string')
        expect(typeof achievement.name).toBe('string')
        expect(typeof achievement.description).toBe('string')
        expect(typeof achievement.icon).toBe('string')
      })
    })

    it('achievements have unique ids', () => {
      const ids = mockAchievements.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('categories', () => {
    it('has achievements in all categories', () => {
      const categories = new Set(mockAchievements.map(a => a.category))
      expect(categories.has('trading')).toBe(true)
      expect(categories.has('learning')).toBe(true)
      expect(categories.has('social')).toBe(true)
    })

    it('all categories are valid', () => {
      const validCategories: AchievementCategory[] = ['trading', 'learning', 'social']
      mockAchievements.forEach(achievement => {
        expect(validCategories).toContain(achievement.category)
      })
    })
  })

  describe('statuses', () => {
    it('has achievements in all status states', () => {
      const statuses = new Set(mockAchievements.map(a => a.status))
      expect(statuses.has('unlocked')).toBe(true)
      expect(statuses.has('locked')).toBe(true)
      expect(statuses.has('in-progress')).toBe(true)
    })

    it('all statuses are valid', () => {
      const validStatuses: AchievementStatus[] = ['unlocked', 'locked', 'in-progress']
      mockAchievements.forEach(achievement => {
        expect(validStatuses).toContain(achievement.status)
      })
    })
  })

  describe('unlocked achievements', () => {
    it('unlocked achievements have unlockedAt timestamp', () => {
      const unlocked = mockAchievements.filter(a => a.status === 'unlocked')
      unlocked.forEach(achievement => {
        expect(achievement.unlockedAt).toBeDefined()
        expect(typeof achievement.unlockedAt).toBe('string')
      })
    })

    it('unlockedAt timestamps are valid ISO dates', () => {
      const unlocked = mockAchievements.filter(a => a.status === 'unlocked')
      unlocked.forEach(achievement => {
        const date = new Date(achievement.unlockedAt!)
        expect(date.toString()).not.toBe('Invalid Date')
      })
    })
  })

  describe('in-progress achievements', () => {
    it('in-progress achievements have progress and maxProgress', () => {
      const inProgress = mockAchievements.filter(a => a.status === 'in-progress')
      inProgress.forEach(achievement => {
        expect(achievement.progress).toBeDefined()
        expect(achievement.maxProgress).toBeDefined()
        expect(typeof achievement.progress).toBe('number')
        expect(typeof achievement.maxProgress).toBe('number')
      })
    })

    it('progress is less than or equal to maxProgress', () => {
      const inProgress = mockAchievements.filter(a => a.status === 'in-progress')
      inProgress.forEach(achievement => {
        expect(achievement.progress!).toBeLessThanOrEqual(achievement.maxProgress!)
      })
    })

    it('progress is non-negative', () => {
      const inProgress = mockAchievements.filter(a => a.status === 'in-progress')
      inProgress.forEach(achievement => {
        expect(achievement.progress!).toBeGreaterThanOrEqual(0)
      })
    })

    it('maxProgress is positive', () => {
      const inProgress = mockAchievements.filter(a => a.status === 'in-progress')
      inProgress.forEach(achievement => {
        expect(achievement.maxProgress!).toBeGreaterThan(0)
      })
    })
  })
})

describe('ACHIEVEMENT_ICONS', () => {
  it('maps achievement types to icon names', () => {
    expect(typeof ACHIEVEMENT_ICONS).toBe('object')
    expect(Object.keys(ACHIEVEMENT_ICONS).length).toBeGreaterThan(0)
  })

  it('icon values are strings', () => {
    Object.values(ACHIEVEMENT_ICONS).forEach(icon => {
      expect(typeof icon).toBe('string')
    })
  })
})

describe('CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    expect(CATEGORY_LABELS).toHaveProperty('trading')
    expect(CATEGORY_LABELS).toHaveProperty('learning')
    expect(CATEGORY_LABELS).toHaveProperty('social')
  })

  it('labels are non-empty strings', () => {
    Object.values(CATEGORY_LABELS).forEach(label => {
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })
  })
})

describe('CATEGORY_COLORS', () => {
  it('has colors for all categories', () => {
    expect(CATEGORY_COLORS).toHaveProperty('trading')
    expect(CATEGORY_COLORS).toHaveProperty('learning')
    expect(CATEGORY_COLORS).toHaveProperty('social')
  })

  it('colors are CSS class strings', () => {
    Object.values(CATEGORY_COLORS).forEach(color => {
      expect(typeof color).toBe('string')
      expect(color).toMatch(/^text-/)
    })
  })
})

describe('CATEGORY_BG_COLORS', () => {
  it('has background colors for all categories', () => {
    expect(CATEGORY_BG_COLORS).toHaveProperty('trading')
    expect(CATEGORY_BG_COLORS).toHaveProperty('learning')
    expect(CATEGORY_BG_COLORS).toHaveProperty('social')
  })

  it('background colors are CSS class strings', () => {
    Object.values(CATEGORY_BG_COLORS).forEach(color => {
      expect(typeof color).toBe('string')
      expect(color).toMatch(/^bg-/)
    })
  })
})

describe('getAchievementsByCategory', () => {
  it('returns only trading achievements', () => {
    const result = getAchievementsByCategory('trading')
    result.forEach(achievement => {
      expect(achievement.category).toBe('trading')
    })
  })

  it('returns only learning achievements', () => {
    const result = getAchievementsByCategory('learning')
    result.forEach(achievement => {
      expect(achievement.category).toBe('learning')
    })
  })

  it('returns only social achievements', () => {
    const result = getAchievementsByCategory('social')
    result.forEach(achievement => {
      expect(achievement.category).toBe('social')
    })
  })

  it('returns at least one achievement per category', () => {
    const categories: AchievementCategory[] = ['trading', 'learning', 'social']
    categories.forEach(category => {
      const result = getAchievementsByCategory(category)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  it('all achievements are accounted for by categories', () => {
    const trading = getAchievementsByCategory('trading')
    const learning = getAchievementsByCategory('learning')
    const social = getAchievementsByCategory('social')

    const totalByCategory = trading.length + learning.length + social.length
    expect(totalByCategory).toBe(mockAchievements.length)
  })
})

describe('getUnlockedAchievements', () => {
  it('returns only unlocked achievements', () => {
    const result = getUnlockedAchievements()
    result.forEach(achievement => {
      expect(achievement.status).toBe('unlocked')
    })
  })

  it('returns at least one unlocked achievement', () => {
    const result = getUnlockedAchievements()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('getLockedAchievements', () => {
  it('returns only locked achievements', () => {
    const result = getLockedAchievements()
    result.forEach(achievement => {
      expect(achievement.status).toBe('locked')
    })
  })

  it('returns at least one locked achievement', () => {
    const result = getLockedAchievements()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('getInProgressAchievements', () => {
  it('returns only in-progress achievements', () => {
    const result = getInProgressAchievements()
    result.forEach(achievement => {
      expect(achievement.status).toBe('in-progress')
    })
  })

  it('returns at least one in-progress achievement', () => {
    const result = getInProgressAchievements()
    expect(result.length).toBeGreaterThan(0)
  })

  it('all returned achievements have progress tracking', () => {
    const result = getInProgressAchievements()
    result.forEach(achievement => {
      expect(achievement.progress).toBeDefined()
      expect(achievement.maxProgress).toBeDefined()
    })
  })
})

describe('getAchievementProgress', () => {
  it('returns unlocked, total, and percentage', () => {
    const result = getAchievementProgress()
    expect(result).toHaveProperty('unlocked')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('percentage')
  })

  it('total matches mockAchievements length', () => {
    const result = getAchievementProgress()
    expect(result.total).toBe(mockAchievements.length)
  })

  it('unlocked count is correct', () => {
    const result = getAchievementProgress()
    const unlockedCount = mockAchievements.filter(a => a.status === 'unlocked').length
    expect(result.unlocked).toBe(unlockedCount)
  })

  it('percentage is correctly calculated', () => {
    const result = getAchievementProgress()
    const expectedPercentage = Math.round((result.unlocked / result.total) * 100)
    expect(result.percentage).toBe(expectedPercentage)
  })

  it('percentage is between 0 and 100', () => {
    const result = getAchievementProgress()
    expect(result.percentage).toBeGreaterThanOrEqual(0)
    expect(result.percentage).toBeLessThanOrEqual(100)
  })

  it('unlocked is less than or equal to total', () => {
    const result = getAchievementProgress()
    expect(result.unlocked).toBeLessThanOrEqual(result.total)
  })
})

describe('achievement filtering completeness', () => {
  it('all achievements are in exactly one status category', () => {
    const unlocked = getUnlockedAchievements()
    const locked = getLockedAchievements()
    const inProgress = getInProgressAchievements()

    const totalFiltered = unlocked.length + locked.length + inProgress.length
    expect(totalFiltered).toBe(mockAchievements.length)
  })
})
