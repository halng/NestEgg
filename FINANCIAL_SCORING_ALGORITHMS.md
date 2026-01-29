# Financial Scoring Algorithms

This document describes the implementation of two financial health scoring algorithms for the NestEgg portfolio management system.

## Overview

Two important financial health scoring algorithms have been implemented:
1. **Piotroski F-Score** - A 0-9 scale assessing financial health
2. **Altman Z-Score** - A bankruptcy risk assessment metric

## Piotroski F-Score

The Piotroski F-Score is a number between 0 and 9 that reflects nine criteria used to determine the strength of a firm's financial position. It is used by financial investors to find the best value stocks.

### Score Components (9 total points)

#### Profitability (4 points)
1. **Positive Net Income** (1 point): Company has positive net income in the current period
2. **Positive Operating Cash Flow** (1 point): Operating cash flow is positive
3. **Increasing ROA** (1 point): Return on Assets increased compared to previous period
4. **Quality of Earnings** (1 point): Operating cash flow exceeds net income

#### Leverage, Liquidity & Source of Funds (3 points)
5. **Decreasing Leverage** (1 point): Debt ratio decreased compared to previous period
6. **Increasing Current Ratio** (1 point): Liquidity improved compared to previous period
7. **No New Shares** (1 point): Company did not issue new shares (capital didn't increase)

#### Operating Efficiency (2 points)
8. **Increasing Gross Margin** (1 point): Gross profit margin improved compared to previous period
9. **Increasing Asset Turnover** (1 point): Asset turnover ratio improved compared to previous period

### Score Interpretation

- **8-9 points**: Strong - High financial health
- **5-7 points**: Moderate - Average financial health
- **3-4 points**: Weak - Below average financial health
- **0-2 points**: Poor - Low financial health

## Altman Z-Score

The Altman Z-Score is a formula for predicting bankruptcy that was published in 1968 by Edward Altman. It combines five financial ratios weighted to estimate the probability of financial distress.

### Formula

Z-Score = 1.2×X₁ + 1.4×X₂ + 3.3×X₃ + 0.6×X₄ + 1.0×X₅

Where:
- **X₁**: Working Capital / Total Assets (liquidity)
- **X₂**: Retained Earnings / Total Assets (profitability over time)
- **X₃**: EBIT / Total Assets (profitability)
- **X₄**: Market Value of Equity / Total Liabilities (leverage)
- **X₅**: Sales / Total Assets (asset efficiency)

### Score Interpretation

- **Z > 2.99**: Safe Zone - Low bankruptcy risk
- **1.81 ≤ Z ≤ 2.99**: Grey Zone - Moderate bankruptcy risk
- **Z < 1.81**: Distress Zone - High bankruptcy risk

## API Endpoints

### Calculate Piotroski F-Score

```
GET /api/financial-scoring/piotroski-fscore/{ticker}?year={year}&quarter={quarter}
```

**Example Response:**
```json
{
  "data": {
    "ticker": "VNM",
    "year": 2024,
    "quarter": 4,
    "totalScore": 7,
    "scoreBreakdown": {
      "positiveNetIncome": 1,
      "positiveOperatingCashFlow": 1,
      "increasingROA": 1,
      "qualityOfEarnings": 1,
      "decreasingLeverage": 1,
      "increasingCurrentRatio": 1,
      "noNewShares": 1,
      "increasingGrossMargin": 0,
      "increasingAssetTurnover": 0
    },
    "healthAssessment": "Moderate - Average financial health"
  }
}
```

### Calculate Altman Z-Score

```
GET /api/financial-scoring/altman-zscore/{ticker}?year={year}&quarter={quarter}
```

**Example Response:**
```json
{
  "data": {
    "ticker": "VNM",
    "year": 2024,
    "quarter": 4,
    "zScore": 3.45,
    "riskAssessment": "Safe Zone - Low bankruptcy risk",
    "workingCapitalToAssets": 0.20,
    "retainedEarningsToAssets": 0.10,
    "ebitToAssets": 0.10,
    "marketValueToLiabilities": 12.5,
    "salesToAssets": 0.50
  }
}
```

## Implementation Details

### Service Layer

- **Interface**: `FinancialScoringService`
- **Implementation**: `FinancialScoringServiceImpl`

### Data Requirements

Both algorithms require:
- **Balance Sheet** data (current and previous period for F-Score)
- **Income Statement** data (current and previous period for F-Score)
- **Cash Flow** data (current period for F-Score)
- **Stock Ratio** data (optional for Z-Score, but recommended for accurate market value)

### Repository Extensions

The following repository methods were added:
- `StockBalanceSheetRepository.findByTickerAndYearAndQuarter()`
- `StockIncomeStatementRepository.findByTickerAndYearAndQuarter()`
- `StockCashFlowRepository.findByTickerAndYearAndQuarter()`

## Testing

Comprehensive unit tests have been implemented in `FinancialScoringServiceImplTest` covering:
- Calculation with complete data
- Calculation with missing previous period data
- Different score ranges (high, moderate, low)
- Missing data scenarios
- Edge cases

## Usage Example

```java
@Autowired
private FinancialScoringService financialScoringService;

// Calculate Piotroski F-Score
PiotroskiFScoreResult fScore = financialScoringService
    .calculatePiotroskiFScore("VNM", 2024, 4);
System.out.println("F-Score: " + fScore.getTotalScore());
System.out.println("Assessment: " + fScore.getHealthAssessment());

// Calculate Altman Z-Score
AltmanZScoreResult zScore = financialScoringService
    .calculateAltmanZScore("VNM", 2024, 4);
System.out.println("Z-Score: " + zScore.getZScore());
System.out.println("Risk: " + zScore.getRiskAssessment());
```

## References

- Piotroski, J. D. (2000). "Value Investing: The Use of Historical Financial Statement Information to Separate Winners from Losers"
- Altman, E. I. (1968). "Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy"
