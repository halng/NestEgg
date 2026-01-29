/*
 *    Copyright 2025 Hao Nguyen Tan
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package com.nestegg.portfolio.management.api.services.impl;

import com.nestegg.portfolio.management.api.dto.AltmanZScoreResult;
import com.nestegg.portfolio.management.api.dto.PiotroskiFScoreResult;
import com.nestegg.portfolio.management.api.entities.StockBalanceSheet;
import com.nestegg.portfolio.management.api.entities.StockCashFlow;
import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.StockBalanceSheetRepository;
import com.nestegg.portfolio.management.api.repositories.StockCashFlowRepository;
import com.nestegg.portfolio.management.api.repositories.StockIncomeStatementRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.FinancialScoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class FinancialScoringServiceImpl implements FinancialScoringService {
	private static final Logger LOGGER = LoggerFactory.getLogger(FinancialScoringServiceImpl.class);
	
	private final StockBalanceSheetRepository balanceSheetRepository;
	private final StockIncomeStatementRepository incomeStatementRepository;
	private final StockCashFlowRepository cashFlowRepository;
	private final StockRatioRepository stockRatioRepository;

	public FinancialScoringServiceImpl(
			StockBalanceSheetRepository balanceSheetRepository,
			StockIncomeStatementRepository incomeStatementRepository,
			StockCashFlowRepository cashFlowRepository,
			StockRatioRepository stockRatioRepository) {
		this.balanceSheetRepository = balanceSheetRepository;
		this.incomeStatementRepository = incomeStatementRepository;
		this.cashFlowRepository = cashFlowRepository;
		this.stockRatioRepository = stockRatioRepository;
	}

	@Override
	public PiotroskiFScoreResult calculatePiotroskiFScore(String ticker, Integer year, Integer quarter) {
		LOGGER.info("Calculating Piotroski F-Score for ticker: {}, year: {}, quarter: {}", ticker, year, quarter);
		
		StockBalanceSheet currentBalance = getBalanceSheet(ticker, year, quarter);
		StockIncomeStatement currentIncome = getIncomeStatement(ticker, year, quarter);
		StockCashFlow currentCashFlow = getCashFlow(ticker, year, quarter);
		
		// Get previous period data for comparison
		StockBalanceSheet previousBalance = getPreviousBalanceSheet(ticker, year, quarter);
		StockIncomeStatement previousIncome = getPreviousIncomeStatement(ticker, year, quarter);
		
		Map<String, Integer> scoreBreakdown = new LinkedHashMap<>();
		
		// Profitability Indicators (4 points)
		scoreBreakdown.put("positiveNetIncome", calculatePositiveNetIncome(currentIncome));
		scoreBreakdown.put("positiveOperatingCashFlow", calculatePositiveOperatingCashFlow(currentCashFlow));
		scoreBreakdown.put("increasingROA", calculateIncreasingROA(currentIncome, previousIncome, currentBalance, previousBalance));
		scoreBreakdown.put("qualityOfEarnings", calculateQualityOfEarnings(currentCashFlow, currentIncome));
		
		// Leverage, Liquidity, and Source of Funds (3 points)
		scoreBreakdown.put("decreasingLeverage", calculateDecreasingLeverage(currentBalance, previousBalance));
		scoreBreakdown.put("increasingCurrentRatio", calculateIncreasingCurrentRatio(currentBalance, previousBalance));
		scoreBreakdown.put("noNewShares", calculateNoNewShares(currentBalance, previousBalance));
		
		// Operating Efficiency (2 points)
		scoreBreakdown.put("increasingGrossMargin", calculateIncreasingGrossMargin(currentIncome, previousIncome));
		scoreBreakdown.put("increasingAssetTurnover", calculateIncreasingAssetTurnover(currentIncome, previousIncome, currentBalance, previousBalance));
		
		int totalScore = scoreBreakdown.values().stream().mapToInt(Integer::intValue).sum();
		String healthAssessment = getHealthAssessment(totalScore);
		
		LOGGER.info("Piotroski F-Score calculated for {}: {} - {}", ticker, totalScore, healthAssessment);
		
		return PiotroskiFScoreResult.builder()
				.ticker(ticker)
				.year(year)
				.quarter(quarter)
				.totalScore(totalScore)
				.scoreBreakdown(scoreBreakdown)
				.healthAssessment(healthAssessment)
				.build();
	}

	@Override
	public AltmanZScoreResult calculateAltmanZScore(String ticker, Integer year, Integer quarter) {
		LOGGER.info("Calculating Altman Z-Score for ticker: {}, year: {}, quarter: {}", ticker, year, quarter);
		
		StockBalanceSheet balanceSheet = getBalanceSheet(ticker, year, quarter);
		StockIncomeStatement incomeStatement = getIncomeStatement(ticker, year, quarter);
		Optional<StockRatio> stockRatioOpt = stockRatioRepository.findByTicker(ticker);
		
		// Calculate components
		Double workingCapital = calculateWorkingCapital(balanceSheet);
		Double totalAssets = balanceSheet.getAsset() != null ? balanceSheet.getAsset() : 0.0;
		Double retainedEarnings = balanceSheet.getUnDistributedIncome() != null ? balanceSheet.getUnDistributedIncome() : 0.0;
		// Note: Using operationProfit as proxy for EBIT (Earnings Before Interest and Taxes)
		Double ebit = incomeStatement.getOperationProfit() != null ? incomeStatement.getOperationProfit() : 0.0;
		Double totalLiabilities = balanceSheet.getDebt() != null ? balanceSheet.getDebt() : 0.0;
		Double revenue = incomeStatement.getRevenue() != null ? incomeStatement.getRevenue() : 0.0;
		
		// Get market value from stock ratio (capitalize = market cap)
		Double marketValue = stockRatioOpt.map(StockRatio::getCapitalize).orElse(null);
		
		// Altman Z-Score formula components
		Double x1 = totalAssets > 0 ? workingCapital / totalAssets : 0.0;
		Double x2 = totalAssets > 0 ? retainedEarnings / totalAssets : 0.0;
		Double x3 = totalAssets > 0 ? ebit / totalAssets : 0.0;
		Double x4 = (marketValue != null && totalLiabilities > 0) ? marketValue / totalLiabilities : 0.0;
		Double x5 = totalAssets > 0 ? revenue / totalAssets : 0.0;
		
		// Altman Z-Score = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 1.0*X5
		Double zScore = (1.2 * x1) + (1.4 * x2) + (3.3 * x3) + (0.6 * x4) + (1.0 * x5);
		
		String riskAssessment = getZScoreRiskAssessment(zScore, marketValue != null);
		
		LOGGER.info("Altman Z-Score calculated for {}: {} - {}", ticker, zScore, riskAssessment);
		
		return AltmanZScoreResult.builder()
				.ticker(ticker)
				.year(year)
				.quarter(quarter)
				.zScore(zScore)
				.riskAssessment(riskAssessment)
				.workingCapitalToAssets(x1)
				.retainedEarningsToAssets(x2)
				.ebitToAssets(x3)
				.marketValueToLiabilities(x4)
				.salesToAssets(x5)
				.build();
	}

	// Helper methods for Piotroski F-Score

	private int calculatePositiveNetIncome(StockIncomeStatement income) {
		Double netIncome = income.getShareHolderIncome();
		return (netIncome != null && netIncome > 0) ? 1 : 0;
	}

	private int calculatePositiveOperatingCashFlow(StockCashFlow cashFlow) {
		Double operatingCashFlow = cashFlow.getFromSale();
		return (operatingCashFlow != null && operatingCashFlow > 0) ? 1 : 0;
	}

	private int calculateIncreasingROA(StockIncomeStatement currentIncome, StockIncomeStatement previousIncome,
									   StockBalanceSheet currentBalance, StockBalanceSheet previousBalance) {
		if (currentIncome == null || previousIncome == null || 
			currentBalance == null || previousBalance == null) {
			return 0;
		}
		
		Double currentROA = calculateROA(currentIncome, currentBalance);
		Double previousROA = calculateROA(previousIncome, previousBalance);
		
		return (currentROA != null && previousROA != null && currentROA > previousROA) ? 1 : 0;
	}

	private Double calculateROA(StockIncomeStatement income, StockBalanceSheet balance) {
		Double netIncome = income.getShareHolderIncome();
		Double totalAssets = balance.getAsset();
		if (netIncome != null && totalAssets != null && totalAssets > 0) {
			return netIncome / totalAssets;
		}
		return null;
	}

	private int calculateQualityOfEarnings(StockCashFlow cashFlow, StockIncomeStatement income) {
		// Operating cash flow from operations (fromSale represents cash flow from sales/operations)
		Double operatingCashFlow = cashFlow.getFromSale();
		Double netIncome = income.getShareHolderIncome();
		
		// Quality of earnings: operating cash flow should exceed net income
		if (operatingCashFlow != null && netIncome != null) {
			return operatingCashFlow > netIncome ? 1 : 0;
		}
		return 0;
	}

	private int calculateDecreasingLeverage(StockBalanceSheet currentBalance, StockBalanceSheet previousBalance) {
		if (currentBalance == null || previousBalance == null) {
			return 0;
		}
		
		Double currentDebtRatio = calculateDebtRatio(currentBalance);
		Double previousDebtRatio = calculateDebtRatio(previousBalance);
		
		return (currentDebtRatio != null && previousDebtRatio != null && currentDebtRatio < previousDebtRatio) ? 1 : 0;
	}

	private Double calculateDebtRatio(StockBalanceSheet balance) {
		Double debt = balance.getDebt();
		Double assets = balance.getAsset();
		if (debt != null && assets != null && assets > 0) {
			return debt / assets;
		}
		return null;
	}

	private int calculateIncreasingCurrentRatio(StockBalanceSheet currentBalance, StockBalanceSheet previousBalance) {
		if (currentBalance == null || previousBalance == null) {
			return 0;
		}
		
		Double currentRatio = calculateCurrentRatio(currentBalance);
		Double previousRatio = calculateCurrentRatio(previousBalance);
		
		return (currentRatio != null && previousRatio != null && currentRatio > previousRatio) ? 1 : 0;
	}

	private Double calculateCurrentRatio(StockBalanceSheet balance) {
		Double currentAssets = balance.getShortAsset();
		Double currentLiabilities = balance.getShortDebt();
		if (currentAssets != null && currentLiabilities != null && currentLiabilities > 0) {
			return currentAssets / currentLiabilities;
		}
		return null;
	}

	private int calculateNoNewShares(StockBalanceSheet currentBalance, StockBalanceSheet previousBalance) {
		if (currentBalance == null || previousBalance == null) {
			return 0;
		}
		
		Double currentCapital = currentBalance.getCapital();
		Double previousCapital = previousBalance.getCapital();
		
		// If capital didn't increase or decreased (no new shares issued), score 1
		if (currentCapital != null && previousCapital != null) {
			return currentCapital <= previousCapital ? 1 : 0;
		}
		return 0;
	}

	private int calculateIncreasingGrossMargin(StockIncomeStatement currentIncome, StockIncomeStatement previousIncome) {
		if (currentIncome == null || previousIncome == null) {
			return 0;
		}
		
		Double currentMargin = calculateGrossMargin(currentIncome);
		Double previousMargin = calculateGrossMargin(previousIncome);
		
		return (currentMargin != null && previousMargin != null && currentMargin > previousMargin) ? 1 : 0;
	}

	private Double calculateGrossMargin(StockIncomeStatement income) {
		Double grossProfit = income.getGrossProfit();
		Double revenue = income.getRevenue();
		if (grossProfit != null && revenue != null && revenue > 0) {
			return grossProfit / revenue;
		}
		return null;
	}

	private int calculateIncreasingAssetTurnover(StockIncomeStatement currentIncome, StockIncomeStatement previousIncome,
												 StockBalanceSheet currentBalance, StockBalanceSheet previousBalance) {
		if (currentIncome == null || previousIncome == null || 
			currentBalance == null || previousBalance == null) {
			return 0;
		}
		
		Double currentTurnover = calculateAssetTurnover(currentIncome, currentBalance);
		Double previousTurnover = calculateAssetTurnover(previousIncome, previousBalance);
		
		return (currentTurnover != null && previousTurnover != null && currentTurnover > previousTurnover) ? 1 : 0;
	}

	private Double calculateAssetTurnover(StockIncomeStatement income, StockBalanceSheet balance) {
		Double revenue = income.getRevenue();
		Double assets = balance.getAsset();
		if (revenue != null && assets != null && assets > 0) {
			return revenue / assets;
		}
		return null;
	}

	// Helper methods for Altman Z-Score

	private Double calculateWorkingCapital(StockBalanceSheet balance) {
		Double currentAssets = balance.getShortAsset() != null ? balance.getShortAsset() : 0.0;
		Double currentLiabilities = balance.getShortDebt() != null ? balance.getShortDebt() : 0.0;
		return currentAssets - currentLiabilities;
	}

	private String getHealthAssessment(int score) {
		if (score >= 8) {
			return "Strong - High financial health";
		} else if (score >= 5) {
			return "Moderate - Average financial health";
		} else if (score >= 3) {
			return "Weak - Below average financial health";
		} else {
			return "Poor - Low financial health";
		}
	}

	private String getZScoreRiskAssessment(Double zScore, boolean hasMarketValue) {
		if (!hasMarketValue) {
			return "Z-Score calculated without market value component - interpretation may be limited";
		}
		
		if (zScore > 2.99) {
			return "Safe Zone - Low bankruptcy risk";
		} else if (zScore >= 1.81) {
			return "Grey Zone - Moderate bankruptcy risk";
		} else {
			return "Distress Zone - High bankruptcy risk";
		}
	}

	// Data retrieval methods

	private StockBalanceSheet getBalanceSheet(String ticker, Integer year, Integer quarter) {
		return balanceSheetRepository.findByTickerAndYearAndQuarter(ticker, year, quarter)
				.orElseThrow(() -> new ResourceNotFoundException(
						String.format("Balance sheet not found for ticker: %s, year: %d, quarter: %d", 
						ticker, year, quarter)));
	}

	private StockIncomeStatement getIncomeStatement(String ticker, Integer year, Integer quarter) {
		return incomeStatementRepository.findByTickerAndYearAndQuarter(ticker, year, quarter)
				.orElseThrow(() -> new ResourceNotFoundException(
						String.format("Income statement not found for ticker: %s, year: %d, quarter: %d", 
						ticker, year, quarter)));
	}

	private StockCashFlow getCashFlow(String ticker, Integer year, Integer quarter) {
		return cashFlowRepository.findByTickerAndYearAndQuarter(ticker, year, quarter)
				.orElseThrow(() -> new ResourceNotFoundException(
						String.format("Cash flow not found for ticker: %s, year: %d, quarter: %d", 
						ticker, year, quarter)));
	}

	private StockBalanceSheet getPreviousBalanceSheet(String ticker, Integer year, Integer quarter) {
		Integer prevYear = quarter == 1 ? year - 1 : year;
		Integer prevQuarter = quarter == 1 ? 4 : quarter - 1;
		return balanceSheetRepository.findByTickerAndYearAndQuarter(ticker, prevYear, prevQuarter)
				.orElse(null);
	}

	private StockIncomeStatement getPreviousIncomeStatement(String ticker, Integer year, Integer quarter) {
		Integer prevYear = quarter == 1 ? year - 1 : year;
		Integer prevQuarter = quarter == 1 ? 4 : quarter - 1;
		return incomeStatementRepository.findByTickerAndYearAndQuarter(ticker, prevYear, prevQuarter)
				.orElse(null);
	}
}
