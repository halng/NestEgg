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

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.StockOverviewView;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class StockScreenerServiceImpl implements StockScreenerService {

	private final StockOverviewRepository stockOverviewRepository;
	private final StockRatioRepository stockRatioRepository;

	public StockScreenerServiceImpl(StockOverviewRepository stockOverviewRepository,
									StockRatioRepository stockRatioRepository) {
		this.stockOverviewRepository = stockOverviewRepository;
		this.stockRatioRepository = stockRatioRepository;
	}

	@Override
	public ApiRes getStockList(String sortBy, String sortOrder) {
		// Validate parameters
		if (!isValidSortBy(sortBy)) {
			return ApiRes.badRequest("Invalid sortBy parameter. Allowed values: symbol, marketCap");
		}
		if (!isValidSortOrder(sortOrder)) {
			return ApiRes.badRequest("Invalid sortOrder parameter. Allowed values: asc, desc");
		}

		// Get all stock overviews
		Iterable<StockOverview> stockOverviews = stockOverviewRepository.findAll();
		
		// Get all stock ratios at once to avoid N+1 query problem
		Iterable<StockRatio> stockRatios = stockRatioRepository.findAll();
		Map<String, Double> marketCapMap = StreamSupport.stream(stockRatios.spliterator(), false)
				.collect(Collectors.toMap(
						StockRatio::getTicker,
						ratio -> ratio.getCapitalize(),
						(existing, replacement) -> existing
				));
		
		List<StockOverviewView> stockList = StreamSupport.stream(stockOverviews.spliterator(), false)
				.filter(stock -> stock.getIsActive() && !stock.getIsDeleted())
				.map(stock -> {
					Double marketCap = marketCapMap.get(stock.getSymbol());
					
					return StockOverviewView.builder()
							.symbol(stock.getSymbol())
							.name(stock.getName())
							.exchange(stock.getExchange())
							.marketCap(marketCap)
							.build();
				})
				.sorted(getComparator(sortBy, sortOrder))
				.toList();

		if (stockList.isEmpty()) {
			return ApiRes.ok("No market data available. Please synchronize data first.", stockList);
		}

		return ApiRes.ok("Stock list retrieved successfully", stockList);
	}

	private boolean isValidSortBy(String sortBy) {
		return "symbol".equalsIgnoreCase(sortBy) || "marketCap".equalsIgnoreCase(sortBy);
	}

	private boolean isValidSortOrder(String sortOrder) {
		return "asc".equalsIgnoreCase(sortOrder) || "desc".equalsIgnoreCase(sortOrder);
	}

	private Comparator<StockOverviewView> getComparator(String sortBy, String sortOrder) {
		boolean ascending = "asc".equalsIgnoreCase(sortOrder);
		
		Comparator<StockOverviewView> comparator;
		
		if ("marketCap".equalsIgnoreCase(sortBy)) {
			comparator = Comparator.comparing(
					StockOverviewView::getMarketCap,
					Comparator.nullsLast(Comparator.naturalOrder())
			);
		} else {
			// Default to alphabetical by symbol
			comparator = Comparator.comparing(
					StockOverviewView::getSymbol,
					Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
			);
		}
		
		return ascending ? comparator : comparator.reversed();
	}
}
