/*
 *    Copyright 2026 Hao Nguyen Tan
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

import com.nestegg.portfolio.management.api.dto.trading.TradingSuggestionResponse;
import com.nestegg.portfolio.management.api.entities.StockFinancialRatio;
import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.StockFinancialRatioRepository;
import com.nestegg.portfolio.management.api.repositories.StockIncomeStatementRepository;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.TradingAgentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TradingAgentServiceImplTests {
	@Mock
	private StockOverviewRepository stockOverviewRepository;

	@Mock
	private StockRatioRepository stockRatioRepository;

	@Mock
	private StockFinancialRatioRepository stockFinancialRatioRepository;

	@Mock
	private StockIncomeStatementRepository stockIncomeStatementRepository;

	private TradingAgentService tradingAgentService;

	@BeforeEach
	void setUp() {
		tradingAgentService = new TradingAgentServiceImpl(
				stockOverviewRepository,
				stockRatioRepository,
				stockFinancialRatioRepository,
				stockIncomeStatementRepository
		);
	}

	@Test
	void suggestGeneratesStructuredTradingSuggestion() {
		String ticker = "FPT";
		when(stockOverviewRepository.findBySymbol(ticker)).thenReturn(Optional.of(StockOverview.builder()
				.symbol(ticker)
				.name("FPT Corporation")
				.rating(8.8D)
				.exchange("HOSE")
				.deltaInWeek(3.2D)
				.deltaInMonth(9.1D)
				.deltaInYear(24.5D)
				.isActivelyTraded(true)
				.industry("Technology")
				.build()));
		when(stockRatioRepository.findByTicker(ticker)).thenReturn(Optional.of(StockRatio.builder()
				.ticker(ticker)
				.tradeVolume(5_400_200L)
				.priceToEarning(11.8D)
				.priceToBook(1.6D)
				.roe(26.4D)
				.profitMargin(18.2D)
				.betaIndex(0.92D)
				.build()));
		when(stockFinancialRatioRepository.findTopByTickerOrderByYearDescQuarterDesc(ticker)).thenReturn(Optional.of(StockFinancialRatio.builder()
				.ticker(ticker)
				.year(2026)
				.quarter(1)
				.priceToEarning(11.8D)
				.priceToBook(1.6D)
				.roe(26.4D)
				.postTaxMargin(18.2D)
				.debtOnEquity(28D)
				.build()));
		StockIncomeStatement latestIncome = StockIncomeStatement.builder()
				.ticker(ticker)
				.year(2026)
				.quarter(1)
				.yearRevenueGrowth(22.4D)
				.build();
		when(stockIncomeStatementRepository.findTopByTickerOrderByYearDescQuarterDesc(ticker)).thenReturn(Optional.of(latestIncome));
		when(stockIncomeStatementRepository.findTop8ByTickerOrderByYearDescQuarterDesc(ticker)).thenReturn(List.of(
				latestIncome,
				StockIncomeStatement.builder().ticker(ticker).year(2025).quarter(4).yearRevenueGrowth(18.1D).build()
		));

		TradingSuggestionResponse suggestion = tradingAgentService.suggest(" fpt ");

		assertThat(suggestion.ticker()).isEqualTo(ticker);
		assertThat(suggestion.name()).isEqualTo("FPT Corporation");
		assertThat(suggestion.action()).isIn("BUY", "ACCUMULATE");
		assertThat(suggestion.conviction()).isBetween(0, 100);
		assertThat(suggestion.analystReports()).hasSize(4)
				.extracting("role")
				.containsExactly("Fundamentals Analyst", "Sentiment Analyst", "News and Macro Analyst", "Technical Analyst");
		assertThat(suggestion.researchDebate().bullishCase()).startsWith("Bull case:");
		assertThat(suggestion.traderReport().role()).isEqualTo("Trader Agent");
		assertThat(suggestion.riskAssessment().constraints()).isNotEmpty();
		assertThat(suggestion.portfolioDecision().rationale()).contains("Portfolio manager");
		assertThat(suggestion.disclaimer()).contains("not financial, investment, or trading advice");
	}

	@Test
	void suggestThrowsWhenTickerIsUnknown() {
		when(stockOverviewRepository.findBySymbol("ZZZ")).thenReturn(Optional.empty());

		assertThatExceptionOfType(ResourceNotFoundException.class)
				.isThrownBy(() -> tradingAgentService.suggest("ZZZ"))
				.withMessage("Stock overview not found for ticker: ZZZ");
	}
}
