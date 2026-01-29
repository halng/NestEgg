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

import com.nestegg.portfolio.management.api.dto.AltmanZScoreRes;
import com.nestegg.portfolio.management.api.dto.PiotroskiFScoreRes;
import com.nestegg.portfolio.management.api.entities.StockBalanceSheet;
import com.nestegg.portfolio.management.api.entities.StockCashFlow;
import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.StockBalanceSheetRepository;
import com.nestegg.portfolio.management.api.repositories.StockCashFlowRepository;
import com.nestegg.portfolio.management.api.repositories.StockIncomeStatementRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialScoringServiceImplTest {

	@Mock
	private StockBalanceSheetRepository balanceSheetRepository;

	@Mock
	private StockIncomeStatementRepository incomeStatementRepository;

	@Mock
	private StockCashFlowRepository cashFlowRepository;

	@Mock
	private StockRatioRepository stockRatioRepository;

	@InjectMocks
	private FinancialScoringServiceImpl financialScoringService;

	private StockBalanceSheet currentBalanceSheet;
	private StockBalanceSheet previousBalanceSheet;
	private StockIncomeStatement currentIncomeStatement;
	private StockIncomeStatement previousIncomeStatement;
	private StockCashFlow currentCashFlow;
	private StockRatio stockRatio;

	@BeforeEach
	void setUp() {
		// Set up current period data
		currentBalanceSheet = StockBalanceSheet.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(4)
				.asset(1000000.0)
				.debt(400000.0)
				.equity(600000.0)
				.shortAsset(300000.0)
				.shortDebt(100000.0)
				.longDebt(300000.0)
				.capital(500000.0)
				.unDistributedIncome(100000.0)
				.build();

		previousBalanceSheet = StockBalanceSheet.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(3)
				.asset(900000.0)
				.debt(450000.0)
				.equity(450000.0)
				.shortAsset(250000.0)
				.shortDebt(120000.0)
				.longDebt(330000.0)
				.capital(500000.0)
				.unDistributedIncome(80000.0)
				.build();

		currentIncomeStatement = StockIncomeStatement.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(4)
				.revenue(500000.0)
				.grossProfit(200000.0)
				.operationProfit(100000.0)
				.shareHolderIncome(80000.0)
				.build();

		previousIncomeStatement = StockIncomeStatement.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(3)
				.revenue(450000.0)
				.grossProfit(170000.0)
				.operationProfit(90000.0)
				.shareHolderIncome(70000.0)
				.build();

		currentCashFlow = StockCashFlow.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(4)
				.fromSale(90000.0)
				.freeCashFlow(50000.0)
				.build();

		stockRatio = StockRatio.builder()
				.ticker("VNM")
				.capitalize(5000000.0)
				.build();
	}

	@Test
	void testCalculatePiotroskiFScore_HighScore() {
		// Arrange
		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentBalanceSheet));
		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2024, 3))
				.thenReturn(Optional.of(previousBalanceSheet));
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentIncomeStatement));
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2024, 3))
				.thenReturn(Optional.of(previousIncomeStatement));
		when(cashFlowRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentCashFlow));

		// Act
		PiotroskiFScoreRes result = financialScoringService.calculatePiotroskiFScore("VNM", 2024, 4);

		// Assert
		assertNotNull(result);
		assertEquals("VNM", result.getTicker());
		assertEquals(2024, result.getYear());
		assertEquals(4, result.getQuarter());
		assertTrue(result.getTotalScore() >= 0 && result.getTotalScore() <= 9);
		assertNotNull(result.getScoreBreakdown());
		assertEquals(9, result.getScoreBreakdown().size());
		assertNotNull(result.getHealthAssessment());
	}

	@Test
	void testCalculatePiotroskiFScore_WithoutPreviousData() {
		// Arrange
		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2024, 1))
				.thenReturn(Optional.of(currentBalanceSheet));
		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2023, 4))
				.thenReturn(Optional.empty());
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2024, 1))
				.thenReturn(Optional.of(currentIncomeStatement));
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2023, 4))
				.thenReturn(Optional.empty());
		when(cashFlowRepository.findByTickerAndYearAndQuarter("VNM", 2024, 1))
				.thenReturn(Optional.of(currentCashFlow));

		// Act
		PiotroskiFScoreRes result = financialScoringService.calculatePiotroskiFScore("VNM", 2024, 1);

		// Assert
		assertNotNull(result);
		// Without previous period data, only 4 profitability indicators can be calculated
		// (positive net income, positive operating cash flow, quality of earnings, and ROA change would be 0)
		// The comparison-based criteria (5 out of 9) will score 0
		assertTrue(result.getTotalScore() <= 4);
	}

	@Test
	void testCalculatePiotroskiFScore_NotFound() {
		// Arrange
		when(balanceSheetRepository.findByTickerAndYearAndQuarter(anyString(), anyInt(), anyInt()))
				.thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () ->
				financialScoringService.calculatePiotroskiFScore("INVALID", 2024, 4)
		);
	}

	@Test
	void testCalculateAltmanZScore_SafeZone() {
		// Arrange
		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentBalanceSheet));
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentIncomeStatement));
		when(stockRatioRepository.findByTicker("VNM"))
				.thenReturn(Optional.of(stockRatio));

		// Act
		AltmanZScoreResult result = financialScoringService.calculateAltmanZScore("VNM", 2024, 4);

		// Assert
		assertNotNull(result);
		assertEquals("VNM", result.getTicker());
		assertEquals(2024, result.getYear());
		assertEquals(4, result.getQuarter());
		assertNotNull(result.getZScore());
		assertTrue(result.getZScore() > 2.99); // Should be in safe zone
		assertTrue(result.getRiskAssessment().contains("Safe Zone"));
		assertNotNull(result.getWorkingCapitalToAssets());
		assertNotNull(result.getRetainedEarningsToAssets());
		assertNotNull(result.getEbitToAssets());
		assertNotNull(result.getMarketValueToLiabilities());
		assertNotNull(result.getSalesToAssets());
	}

	@Test
	void testCalculateAltmanZScore_WithoutMarketValue() {
		// Arrange
		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentBalanceSheet));
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(currentIncomeStatement));
		when(stockRatioRepository.findByTicker("VNM"))
				.thenReturn(Optional.empty());

		// Act
		AltmanZScoreResult result = financialScoringService.calculateAltmanZScore("VNM", 2024, 4);

		// Assert
		assertNotNull(result);
		assertNotNull(result.getZScore());
		assertEquals(0.0, result.getMarketValueToLiabilities());
		assertTrue(result.getRiskAssessment().contains("calculated without market value component"));
	}

	@Test
	void testCalculateAltmanZScore_DistressZone() {
		// Arrange - Set up data for distress zone
		StockBalanceSheet distressBalanceSheet = StockBalanceSheet.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(4)
				.asset(1000000.0)
				.debt(900000.0)
				.shortAsset(100000.0)
				.shortDebt(200000.0)
				.unDistributedIncome(-50000.0)
				.build();

		StockIncomeStatement distressIncomeStatement = StockIncomeStatement.builder()
				.ticker("VNM")
				.year(2024)
				.quarter(4)
				.revenue(100000.0)
				.operationProfit(-20000.0)
				.build();

		StockRatio lowMarketValueRatio = StockRatio.builder()
				.ticker("VNM")
				.capitalize(50000.0)
				.build();

		when(balanceSheetRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(distressBalanceSheet));
		when(incomeStatementRepository.findByTickerAndYearAndQuarter("VNM", 2024, 4))
				.thenReturn(Optional.of(distressIncomeStatement));
		when(stockRatioRepository.findByTicker("VNM"))
				.thenReturn(Optional.of(lowMarketValueRatio));

		// Act
		AltmanZScoreResult result = financialScoringService.calculateAltmanZScore("VNM", 2024, 4);

		// Assert
		assertNotNull(result);
		assertTrue(result.getZScore() < 1.81); // Should be in distress zone
		assertTrue(result.getRiskAssessment().contains("Distress Zone"));
	}

	@Test
	void testCalculateAltmanZScore_NotFound() {
		// Arrange
		when(balanceSheetRepository.findByTickerAndYearAndQuarter(anyString(), anyInt(), anyInt()))
				.thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () ->
				financialScoringService.calculateAltmanZScore("INVALID", 2024, 4)
		);
	}
}
