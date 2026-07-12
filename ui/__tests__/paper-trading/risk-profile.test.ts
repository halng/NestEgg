import {
  RISK_QUIZ_QUESTIONS,
  RISK_PROFILES,
  calculateRiskProfile,
  getPositionSizeRecommendation,
} from '@/lib/paper-trading/risk-profile'
import type { RiskTolerance } from '@/lib/paper-trading/types'

describe('RISK_QUIZ_QUESTIONS', () => {
  describe('structure', () => {
    it('contains at least 5 questions', () => {
      expect(RISK_QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(5)
    })

    it('each question has required properties', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('question')
        expect(question).toHaveProperty('options')
        expect(typeof question.id).toBe('string')
        expect(typeof question.question).toBe('string')
        expect(Array.isArray(question.options)).toBe(true)
      })
    })

    it('questions have unique ids', () => {
      const ids = RISK_QUIZ_QUESTIONS.map(q => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('options', () => {
    it('each question has at least 4 options', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        expect(question.options.length).toBeGreaterThanOrEqual(4)
      })
    })

    it('each option has required properties', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        question.options.forEach(option => {
          expect(option).toHaveProperty('value')
          expect(option).toHaveProperty('label')
          expect(option).toHaveProperty('score')
          expect(typeof option.value).toBe('string')
          expect(typeof option.label).toBe('string')
          expect(typeof option.score).toBe('number')
        })
      })
    })

    it('option scores are within valid range (1-4)', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        question.options.forEach(option => {
          expect(option.score).toBeGreaterThanOrEqual(1)
          expect(option.score).toBeLessThanOrEqual(4)
        })
      })
    })

    it('options have unique values within each question', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        const values = question.options.map(o => o.value)
        const uniqueValues = new Set(values)
        expect(uniqueValues.size).toBe(values.length)
      })
    })
  })

  describe('question content', () => {
    it('questions are non-empty', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        expect(question.question.length).toBeGreaterThan(10)
      })
    })

    it('options labels are non-empty', () => {
      RISK_QUIZ_QUESTIONS.forEach(question => {
        question.options.forEach(option => {
          expect(option.label.length).toBeGreaterThan(5)
        })
      })
    })
  })
})

describe('RISK_PROFILES', () => {
  describe('structure', () => {
    it('has all risk tolerance levels', () => {
      expect(RISK_PROFILES).toHaveProperty('conservative')
      expect(RISK_PROFILES).toHaveProperty('moderate')
      expect(RISK_PROFILES).toHaveProperty('aggressive')
    })

    it('each profile has required properties', () => {
      const tolerances: RiskTolerance[] = ['conservative', 'moderate', 'aggressive']
      tolerances.forEach(tolerance => {
        const profile = RISK_PROFILES[tolerance]
        expect(profile).toHaveProperty('tolerance')
        expect(profile).toHaveProperty('maxPositionSizePercent')
        expect(profile).toHaveProperty('description')
        expect(profile).toHaveProperty('recommendation')
        expect(profile.tolerance).toBe(tolerance)
      })
    })
  })

  describe('position size recommendations', () => {
    it('conservative has lowest position size', () => {
      expect(RISK_PROFILES.conservative.maxPositionSizePercent)
        .toBeLessThan(RISK_PROFILES.moderate.maxPositionSizePercent)
    })

    it('moderate has middle position size', () => {
      expect(RISK_PROFILES.moderate.maxPositionSizePercent)
        .toBeLessThan(RISK_PROFILES.aggressive.maxPositionSizePercent)
    })

    it('all position sizes are positive', () => {
      const tolerances: RiskTolerance[] = ['conservative', 'moderate', 'aggressive']
      tolerances.forEach(tolerance => {
        expect(RISK_PROFILES[tolerance].maxPositionSizePercent).toBeGreaterThan(0)
      })
    })

    it('all position sizes are at most 100%', () => {
      const tolerances: RiskTolerance[] = ['conservative', 'moderate', 'aggressive']
      tolerances.forEach(tolerance => {
        expect(RISK_PROFILES[tolerance].maxPositionSizePercent).toBeLessThanOrEqual(100)
      })
    })

    it('conservative is 5%', () => {
      expect(RISK_PROFILES.conservative.maxPositionSizePercent).toBe(5)
    })

    it('moderate is 10%', () => {
      expect(RISK_PROFILES.moderate.maxPositionSizePercent).toBe(10)
    })

    it('aggressive is 20%', () => {
      expect(RISK_PROFILES.aggressive.maxPositionSizePercent).toBe(20)
    })
  })

  describe('content quality', () => {
    it('descriptions are meaningful', () => {
      const tolerances: RiskTolerance[] = ['conservative', 'moderate', 'aggressive']
      tolerances.forEach(tolerance => {
        expect(RISK_PROFILES[tolerance].description.length).toBeGreaterThan(50)
      })
    })

    it('recommendations are meaningful', () => {
      const tolerances: RiskTolerance[] = ['conservative', 'moderate', 'aggressive']
      tolerances.forEach(tolerance => {
        expect(RISK_PROFILES[tolerance].recommendation.length).toBeGreaterThan(50)
      })
    })
  })
})

describe('calculateRiskProfile', () => {
  describe('scoring', () => {
    it('returns conservative for all minimum scores', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 1
      })

      const result = calculateRiskProfile(answers)
      expect(result.tolerance).toBe('conservative')
    })

    it('returns aggressive for all maximum scores', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 4
      })

      const result = calculateRiskProfile(answers)
      expect(result.tolerance).toBe('aggressive')
    })

    it('returns moderate for middle scores', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 2.5
      })

      const result = calculateRiskProfile(answers)
      expect(result.tolerance).toBe('moderate')
    })
  })

  describe('score boundaries', () => {
    it('returns conservative for normalized score <= 0.4', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach((q, i) => {
        // Mix of 1s and 2s to stay under 0.4 normalized
        answers[q.id] = i % 3 === 0 ? 2 : 1
      })

      const result = calculateRiskProfile(answers)
      const maxScore = RISK_QUIZ_QUESTIONS.length * 4
      const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
      
      if (totalScore / maxScore <= 0.4) {
        expect(result.tolerance).toBe('conservative')
      }
    })

    it('returns moderate for normalized score between 0.4 and 0.7', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 2.5 // Should give normalized ~0.56
      })

      const result = calculateRiskProfile(answers)
      expect(result.tolerance).toBe('moderate')
    })

    it('returns aggressive for normalized score > 0.7', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 4
      })

      const result = calculateRiskProfile(answers)
      expect(result.tolerance).toBe('aggressive')
    })
  })

  describe('result structure', () => {
    it('returns complete profile result', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 2
      })

      const result = calculateRiskProfile(answers)

      expect(result).toHaveProperty('tolerance')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('maxPositionSizePercent')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('recommendation')
    })

    it('includes correct score', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 3
      })

      const result = calculateRiskProfile(answers)
      const expectedScore = RISK_QUIZ_QUESTIONS.length * 3

      expect(result.score).toBe(expectedScore)
    })

    it('includes profile-specific properties', () => {
      const answers: Record<string, number> = {}
      RISK_QUIZ_QUESTIONS.forEach(q => {
        answers[q.id] = 4
      })

      const result = calculateRiskProfile(answers)

      expect(result.maxPositionSizePercent).toBe(RISK_PROFILES.aggressive.maxPositionSizePercent)
      expect(result.description).toBe(RISK_PROFILES.aggressive.description)
      expect(result.recommendation).toBe(RISK_PROFILES.aggressive.recommendation)
    })
  })

  describe('edge cases', () => {
    it('handles empty answers', () => {
      const result = calculateRiskProfile({})
      expect(result.score).toBe(0)
      expect(result.tolerance).toBe('conservative')
    })

    it('handles partial answers', () => {
      const answers: Record<string, number> = {
        [RISK_QUIZ_QUESTIONS[0].id]: 4,
      }

      const result = calculateRiskProfile(answers)
      expect(result.score).toBe(4)
      expect(result).toHaveProperty('tolerance')
    })
  })
})

describe('getPositionSizeRecommendation', () => {
  it('returns correct size for conservative', () => {
    const result = getPositionSizeRecommendation('conservative')
    expect(result).toBe(5)
  })

  it('returns correct size for moderate', () => {
    const result = getPositionSizeRecommendation('moderate')
    expect(result).toBe(10)
  })

  it('returns correct size for aggressive', () => {
    const result = getPositionSizeRecommendation('aggressive')
    expect(result).toBe(20)
  })

  it('matches RISK_PROFILES values', () => {
    const tolerances: RiskTolerance[] = ['conservative', 'moderate', 'aggressive']
    tolerances.forEach(tolerance => {
      const result = getPositionSizeRecommendation(tolerance)
      expect(result).toBe(RISK_PROFILES[tolerance].maxPositionSizePercent)
    })
  })
})
