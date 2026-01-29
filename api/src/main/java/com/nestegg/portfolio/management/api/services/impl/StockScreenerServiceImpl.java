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
			List<StockMetrics> visibleMetrics = new ArrayList<>();
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
				visibleMetrics.add(StockMetrics.builder()
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
						.visibleMetrics(visibleMetrics)
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
		addMetricsFromObject(allMetrics, overview, "overview");
		if (ratio != null) {
			addMetricsFromObject(allMetrics, ratio, "ratio");
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
				return value.equals(filter.getMinValue());
			case "BETWEEN":
				return value >= filter.getMinValue() && value <= filter.getMaxValue();
			default:
				return false;
		}
	}

	private void addMetricsFromObject(Map<String, Double> metrics, Object obj, String prefix) {
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
	}
}
