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

package com.nestegg.portfolio.management.api.services;

import com.nestegg.portfolio.management.api.dto.ScreeningCriteria;
import com.nestegg.portfolio.management.api.dto.StockScreeningResult;
import com.nestegg.portfolio.management.api.entities.StockFinancialRatio;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.repositories.StockFinancialRatioRepository;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StockScreenerServiceImplTest {

	@Mock
	private StockOverviewRepository stockOverviewRepository;

	@Mock
	private StockRatioRepository stockRatioRepository;

	@Mock
	private StockFinancialRatioRepository stockFinancialRatioRepository;

	private StockScreenerServiceImpl stockScreenerService;

	@BeforeEach
	void setUp() {
		stockScreenerService = new StockScreenerServiceImpl(
				stockOverviewRepository, 
				stockRatioRepository, 
				stockFinancialRatioRepository
		);
	}

	@Test
	void testScreenStocks_WithEmptyCriteria_ReturnsAllActiveStocks() {
		StockOverview stock1 = createStockOverview("AAPL", "Apple Inc.", "Technology", "NASDAQ", true);
		StockOverview stock2 = createStockOverview("GOOGL", "Alphabet Inc.", "Technology", "NASDAQ", true);
		
		when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stock1, stock2));
		when(stockFinancialRatioRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

		ScreeningCriteria criteria = new ScreeningCriteria();
		List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);

		assertEquals(2, results.size());
	}

	@Test
	void testScreenStocks_WithIndustryFilter_ReturnsMatchingStocks() {
		StockOverview stock1 = createStockOverview("AAPL", "Apple Inc.", "Technology", "NASDAQ", true);
		StockOverview stock2 = createStockOverview("JPM", "JPMorgan Chase", "Finance", "NYSE", true);
		
		when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stock1, stock2));
		when(stockFinancialRatioRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

		ScreeningCriteria criteria = ScreeningCriteria.builder()
				.industry("Technology")
				.build();
		List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);

		assertEquals(1, results.size());
		assertEquals("AAPL", results.get(0).getSymbol());
	}

	@Test
	void testScreenStocks_WithRatingRange_ReturnsMatchingStocks() {
		StockOverview stock1 = createStockOverview("AAPL", "Apple Inc.", "Technology", "NASDAQ", true);
		stock1.setRating(4.5);
		StockOverview stock2 = createStockOverview("GOOGL", "Alphabet Inc.", "Technology", "NASDAQ", true);
		stock2.setRating(3.0);
		
		when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stock1, stock2));
		when(stockFinancialRatioRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

		ScreeningCriteria criteria = ScreeningCriteria.builder()
				.minRating(4.0)
				.build();
		List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);

		assertEquals(1, results.size());
		assertEquals("AAPL", results.get(0).getSymbol());
	}

	@Test
	void testScreenStocks_WithFinancialRatios_ReturnsMatchingStocks() {
		StockOverview stock1 = createStockOverview("AAPL", "Apple Inc.", "Technology", "NASDAQ", true);
		StockFinancialRatio ratio1 = createFinancialRatio("AAPL", 15.0, 3.0, 25.0, 18.0, 2.0);
		
		when(stockOverviewRepository.findAll()).thenReturn(Collections.singletonList(stock1));
		when(stockFinancialRatioRepository.findAll(any(Sort.class))).thenReturn(Collections.singletonList(ratio1));

		ScreeningCriteria criteria = ScreeningCriteria.builder()
				.minRoe(20.0)
				.build();
		List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);

		assertEquals(1, results.size());
		assertEquals("AAPL", results.get(0).getSymbol());
		assertEquals(25.0, results.get(0).getRoe());
	}

	@Test
	void testScreenStocks_ExcludesInactiveStocks() {
		StockOverview stock1 = createStockOverview("AAPL", "Apple Inc.", "Technology", "NASDAQ", true);
		StockOverview stock2 = createStockOverview("INACTIVE", "Inactive Corp", "Technology", "NASDAQ", false);
		
		when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stock1, stock2));
		when(stockFinancialRatioRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

		ScreeningCriteria criteria = new ScreeningCriteria();
		List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);

		assertEquals(1, results.size());
		assertEquals("AAPL", results.get(0).getSymbol());
	}

	@Test
	void testScreenStocks_HandlesNullValues_GracefullyDegrades() {
		StockOverview stock1 = createStockOverview("AAPL", "Apple Inc.", null, null, true);
		
		when(stockOverviewRepository.findAll()).thenReturn(Collections.singletonList(stock1));
		when(stockFinancialRatioRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

		ScreeningCriteria criteria = new ScreeningCriteria();
		List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);

		assertEquals(1, results.size());
		assertNull(results.get(0).getIndustry());
		assertNull(results.get(0).getExchange());
	}

	private StockOverview createStockOverview(String symbol, String name, String industry, String exchange, boolean isActive) {
		return StockOverview.builder()
				.symbol(symbol)
				.name(name)
				.industry(industry)
				.exchange(exchange)
				.isActivelyTraded(isActive)
				.build();
	}

	private StockFinancialRatio createFinancialRatio(String ticker, Double pe, Double pb, Double roe, Double roa, Double dividend) {
		return StockFinancialRatio.builder()
				.ticker(ticker)
				.year(2024)
				.quarter(4)
				.priceToEarning(pe)
				.priceToBook(pb)
				.roe(roe)
				.roa(roa)
				.dividend(dividend)
				.build();
	}
}
