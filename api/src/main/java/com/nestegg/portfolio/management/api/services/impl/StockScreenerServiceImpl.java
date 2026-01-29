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

import com.nestegg.portfolio.management.api.dto.*;
import com.nestegg.portfolio.management.api.entities.*;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.*;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.ScreeningCriteria;
import com.nestegg.portfolio.management.api.dto.StockOverviewView;
import com.nestegg.portfolio.management.api.dto.StockScreeningResult;
import com.nestegg.portfolio.management.api.entities.StockFinancialRatio;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.repositories.StockFinancialRatioRepository;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class StockScreenerServiceImpl implements StockScreenerService {

	private final StockOverviewRepository stockOverviewRepository;
	private final StockRatioRepository stockRatioRepository;

	@Override
	public List<StockScreenResult> screenStocks(ScreenRequest request) {
		List<FilterCriteria> filters = request.getFilters();
		if (filters == null || filters.isEmpty()) {
			// Return all stocks with no filters
			return getAllStocksAsResults(Collections.emptyList());
		}

		// Get all stocks
		Iterable<StockOverview> allOverviews = stockOverviewRepository.findAll();
		Map<String, StockRatio> ratioMap = StreamSupport
				.stream(stockRatioRepository.findAll().spliterator(), false)
				.collect(Collectors.toMap(StockRatio::getTicker, r -> r));

		List<StockScreenResult> results = new ArrayList<>();

		for (StockOverview overview : allOverviews) {
			StockRatio ratio = ratioMap.get(overview.getSymbol());
			
			// Evaluate filters
			boolean passesAllFilters = true;
			Map<String, StockMetrics> visibleMetricsMap = new LinkedHashMap<>();
			Set<String> filterMetricNames = filters.stream()
					.map(FilterCriteria::getMetricName)
					.collect(Collectors.toSet());

			for (FilterCriteria filter : filters) {
				Double metricValue = getMetricValue(overview, ratio, filter.getMetricName());
				
				// AC-3: If metric value is missing, exclude the stock
				if (metricValue == null) {
					passesAllFilters = false;
					break;
				}

				// Evaluate filter
				if (!evaluateFilter(metricValue, filter)) {
					passesAllFilters = false;
					break;
				}

				// Add to visible metrics (AC-1: metrics used by active filters are visible)
				// Use map to avoid duplicates
				visibleMetricsMap.put(filter.getMetricName(), StockMetrics.builder()
						.metricName(filter.getMetricName())
						.value(metricValue)
						.usedInFilter(true)
						.build());
			}

			if (passesAllFilters) {
				results.add(StockScreenResult.builder()
						.ticker(overview.getSymbol())
						.name(overview.getName())
						.exchange(overview.getExchange())
						.industry(overview.getIndustry())
						.visibleMetrics(new ArrayList<>(visibleMetricsMap.values()))
						.build());
			}
		}

		return results;
	}

	@Override
	public StockMetricsDetail getStockMetrics(String ticker) {
		StockOverview overview = stockOverviewRepository.findById(ticker)
				.orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + ticker));
		
		Optional<StockRatio> ratioOpt = stockRatioRepository.findById(ticker);
		StockRatio ratio = ratioOpt.orElse(null);

		Map<String, Double> allMetrics = new HashMap<>();
		
		// Add all metrics from overview and ratio
		addMetricsFromObject(allMetrics, overview);
		if (ratio != null) {
			addMetricsFromObject(allMetrics, ratio);
		}

		return StockMetricsDetail.builder()
				.ticker(overview.getSymbol())
				.name(overview.getName())
				.exchange(overview.getExchange())
				.industry(overview.getIndustry())
				.allMetrics(allMetrics)
				.build();
	}

	private Double getMetricValue(StockOverview overview, StockRatio ratio, String metricName) {
		// Try to get from overview first
		Double value = getFieldValue(overview, metricName);
		if (value != null) {
			return value;
		}
		
		// Try to get from ratio
		if (ratio != null) {
			value = getFieldValue(ratio, metricName);
		}
		
		return value;
	}

	private Double getFieldValue(Object obj, String fieldName) {
		try {
			Field field = findField(obj.getClass(), fieldName);
			if (field != null) {
				field.setAccessible(true);
				Object value = field.get(obj);
				if (value instanceof Double) {
					return (Double) value;
				} else if (value instanceof Number) {
					return ((Number) value).doubleValue();
				}
			}
		} catch (Exception e) {
			// Field not found or not accessible
		}
		return null;
	}

	private Field findField(Class<?> clazz, String fieldName) {
		while (clazz != null && clazz != Object.class) {
			try {
				return clazz.getDeclaredField(fieldName);
			} catch (NoSuchFieldException e) {
				clazz = clazz.getSuperclass();
			}
		}
		return null;
	}

	private boolean evaluateFilter(Double value, FilterCriteria filter) {
		if (filter.getMinValue() == null && !filter.getOperator().equalsIgnoreCase("EQ")) {
			return false; // Invalid filter without minValue
		}
		
		switch (filter.getOperator().toUpperCase()) {
			case "GT":
				return value > filter.getMinValue();
			case "LT":
				return value < filter.getMinValue();
			case "GTE":
				return value >= filter.getMinValue();
			case "LTE":
				return value <= filter.getMinValue();
			case "EQ":
				return filter.getMinValue() != null && value.equals(filter.getMinValue());
			case "BETWEEN":
				return filter.getMaxValue() != null && 
					   value >= filter.getMinValue() && 
					   value <= filter.getMaxValue();
			default:
				return false;
		}
	}

	private void addMetricsFromObject(Map<String, Double> metrics, Object obj) {
		Class<?> clazz = obj.getClass();
		while (clazz != null && clazz != Object.class) {
			for (Field field : clazz.getDeclaredFields()) {
				field.setAccessible(true);
				try {
					Object value = field.get(obj);
					if (value instanceof Double) {
						metrics.put(field.getName(), (Double) value);
					} else if (value instanceof Number) {
						metrics.put(field.getName(), ((Number) value).doubleValue());
					}
				} catch (IllegalAccessException e) {
					// Skip this field
				}
			}
			clazz = clazz.getSuperclass();
		}
	}

	private List<StockScreenResult> getAllStocksAsResults(List<FilterCriteria> filters) {
		Iterable<StockOverview> allOverviews = stockOverviewRepository.findAll();
		return StreamSupport.stream(allOverviews.spliterator(), false)
				.map(overview -> StockScreenResult.builder()
						.ticker(overview.getSymbol())
						.name(overview.getName())
						.exchange(overview.getExchange())
						.industry(overview.getIndustry())
						.visibleMetrics(Collections.emptyList())
						.build())
				.collect(Collectors.toList());
@Slf4j
public class StockScreenerServiceImpl implements StockScreenerService {
	private final StockOverviewRepository stockOverviewRepository;
	private final StockRatioRepository stockRatioRepository;
	private final StockFinancialRatioRepository stockFinancialRatioRepository;

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

	@Override
	public List<StockScreeningResult> screenStocks(ScreeningCriteria criteria) {
		log.info("Starting stock screening with criteria: {}", criteria);
		
		try {
			List<StockOverview> allStocks = StreamSupport
					.stream(stockOverviewRepository.findAll().spliterator(), false)
					.filter(stock -> stock.getIsActivelyTraded() != null && stock.getIsActivelyTraded())
					.collect(Collectors.toList());
			
			log.info("Found {} actively traded stocks", allStocks.size());
			
			Map<String, StockFinancialRatio> latestRatios = getLatestFinancialRatios();
			log.info("Loaded {} latest financial ratios", latestRatios.size());
			
			List<StockScreeningResult> results = allStocks.stream()
					.filter(stock -> matchesCriteria(stock, latestRatios.get(stock.getSymbol()), criteria))
					.map(stock -> buildResult(stock, latestRatios.get(stock.getSymbol())))
					.collect(Collectors.toList());
			
			log.info("Screening completed, found {} matching stocks", results.size());
			return results;
		} catch (Exception e) {
			log.error("Error during stock screening", e);
			return Collections.emptyList();
		}
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

	private Map<String, StockFinancialRatio> getLatestFinancialRatios() {
		List<StockFinancialRatio> allRatios = stockFinancialRatioRepository.findAll(
				Sort.by(Sort.Direction.DESC, "year", "quarter")
		);
		
		Map<String, StockFinancialRatio> latestRatios = new HashMap<>();
		for (StockFinancialRatio ratio : allRatios) {
			latestRatios.putIfAbsent(ratio.getTicker(), ratio);
		}
		
		return latestRatios;
	}
	
	private boolean matchesCriteria(StockOverview stock, StockFinancialRatio ratio, ScreeningCriteria criteria) {
		try {
			if (criteria.getIndustry() != null && !criteria.getIndustry().isEmpty()) {
				if (stock.getIndustry() == null || !stock.getIndustry().equalsIgnoreCase(criteria.getIndustry())) {
					return false;
				}
			}
			
			if (criteria.getExchange() != null && !criteria.getExchange().isEmpty()) {
				if (stock.getExchange() == null || !stock.getExchange().equalsIgnoreCase(criteria.getExchange())) {
					return false;
				}
			}
			
			if (!isInRange(stock.getRating(), criteria.getMinRating(), criteria.getMaxRating())) {
				return false;
			}
			
			if (!isInRange(stock.getDeltaInYear(), criteria.getMinDeltaInYear(), criteria.getMaxDeltaInYear())) {
				return false;
			}
			
			if (ratio != null) {
				if (!isInRange(ratio.getPriceToEarning(), criteria.getMinPriceToEarning(), criteria.getMaxPriceToEarning())) {
					return false;
				}
				
				if (!isInRange(ratio.getPriceToBook(), criteria.getMinPriceToBook(), criteria.getMaxPriceToBook())) {
					return false;
				}
				
				if (!isInRange(ratio.getRoe(), criteria.getMinRoe(), criteria.getMaxRoe())) {
					return false;
				}
				
				if (!isInRange(ratio.getRoa(), criteria.getMinRoa(), criteria.getMaxRoa())) {
					return false;
				}
				
				if (!isInRange(ratio.getDividend(), criteria.getMinDividend(), criteria.getMaxDividend())) {
					return false;
				}
			} else {
				if (criteria.getMinPriceToEarning() != null || criteria.getMaxPriceToEarning() != null ||
					criteria.getMinPriceToBook() != null || criteria.getMaxPriceToBook() != null ||
					criteria.getMinRoe() != null || criteria.getMaxRoe() != null ||
					criteria.getMinRoa() != null || criteria.getMaxRoa() != null ||
					criteria.getMinDividend() != null || criteria.getMaxDividend() != null) {
					return false;
				}
			}
			
			return true;
		} catch (Exception e) {
			log.warn("Error matching criteria for stock {}: {}", stock.getSymbol(), e.getMessage());
			return false;
		}
	}
	
	private boolean isInRange(Double value, Double min, Double max) {
		if (min != null && (value == null || value < min)) {
			return false;
		}
		if (max != null && (value == null || value > max)) {
			return false;
		}
		return true;
	}
	
	private StockScreeningResult buildResult(StockOverview stock, StockFinancialRatio ratio) {
		return StockScreeningResult.builder()
				.symbol(stock.getSymbol())
				.name(stock.getName())
				.industry(stock.getIndustry())
				.exchange(stock.getExchange())
				.rating(stock.getRating())
				.deltaInYear(stock.getDeltaInYear())
				.priceToEarning(ratio != null ? ratio.getPriceToEarning() : null)
				.priceToBook(ratio != null ? ratio.getPriceToBook() : null)
				.roe(ratio != null ? ratio.getRoe() : null)
				.roa(ratio != null ? ratio.getRoa() : null)
				.dividend(ratio != null ? ratio.getDividend() : null)
				.build();
	}
}
