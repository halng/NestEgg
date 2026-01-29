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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockScreenerServiceImpl implements StockScreenerService {

private final StockOverviewRepository stockOverviewRepository;
private final StockRatioRepository stockRatioRepository;
private final StockFinancialRatioRepository stockFinancialRatioRepository;

// Basic stock list with sorting (from milestone-01)
@Override
public ApiRes getStockList(String sortBy, String sortOrder) {
log.info("Fetching stock list with sortBy: {} and sortOrder: {}", sortBy, sortOrder);
try {
Sort.Direction direction = sortOrder.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
Sort sort = Sort.by(direction, sortBy);

List<StockOverview> stocks = stockOverviewRepository.findAll(sort);
List<StockOverviewView> stockViews = stocks.stream()
.map(this::convertToStockOverviewView)
.collect(Collectors.toList());

return ApiRes.ok("Stock list retrieved successfully", stockViews);
} catch (Exception e) {
log.error("Error retrieving stock list", e);
return ApiRes.internalError("Failed to retrieve stock list: " + e.getMessage());
}
}

// Basic screening with ScreeningCriteria (from milestone-01)
@Override
public List<StockScreeningResult> screenStocks(ScreeningCriteria criteria) {
log.info("Screening stocks with criteria");
List<StockOverview> allStocks = stockOverviewRepository.findAll();
Map<String, StockRatio> ratioMap = StreamSupport
.stream(stockRatioRepository.findAll().spliterator(), false)
.collect(Collectors.toMap(StockRatio::getTicker, r -> r));

return allStocks.stream()
.filter(stock -> matchesCriteria(stock, ratioMap.get(stock.getSymbol()), criteria))
.map(stock -> convertToStockScreeningResult(stock, ratioMap.get(stock.getSymbol())))
.collect(Collectors.toList());
}

// Explainability screening with FilterCriteria (from User Story 3)
@Override
public List<StockScreenResult> screenStocksWithExplainability(ScreenRequest request) {
List<FilterCriteria> filters = request.getFilters();
if (filters == null || filters.isEmpty()) {
return getAllStocksAsResults(Collections.emptyList());
}

Iterable<StockOverview> allOverviews = stockOverviewRepository.findAll();
Map<String, StockRatio> ratioMap = StreamSupport
.stream(stockRatioRepository.findAll().spliterator(), false)
.collect(Collectors.toMap(StockRatio::getTicker, r -> r));

List<StockScreenResult> results = new ArrayList<>();

for (StockOverview overview : allOverviews) {
StockRatio ratio = ratioMap.get(overview.getSymbol());

boolean passesAllFilters = true;
Map<String, StockMetrics> visibleMetricsMap = new LinkedHashMap<>();

for (FilterCriteria filter : filters) {
Double metricValue = getMetricValue(overview, ratio, filter.getMetricName());

if (metricValue == null) {
passesAllFilters = false;
break;
}

if (!evaluateFilter(metricValue, filter)) {
passesAllFilters = false;
break;
}

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

// Helper methods

private StockOverviewView convertToStockOverviewView(StockOverview stock) {
return StockOverviewView.builder()
.symbol(stock.getSymbol())
.name(stock.getName())
.exchange(stock.getExchange())
.industry(stock.getIndustry())
.rating(stock.getRating())
.isActivelyTraded(stock.getIsActivelyTraded())
.build();
}

private boolean matchesCriteria(StockOverview stock, StockRatio ratio, ScreeningCriteria criteria) {
if (criteria.getIndustry() != null && !criteria.getIndustry().equals(stock.getIndustry())) {
return false;
}
if (criteria.getExchange() != null && !criteria.getExchange().equals(stock.getExchange())) {
return false;
}
if (ratio == null) {
return false;
}

return matchesDoubleRange(stock.getRating(), criteria.getMinRating(), criteria.getMaxRating())
&& matchesDoubleRange(stock.getDeltaInYear(), criteria.getMinDeltaInYear(), criteria.getMaxDeltaInYear())
&& matchesDoubleRange(ratio.getPriceToEarning(), criteria.getMinPriceToEarning(), criteria.getMaxPriceToEarning())
&& matchesDoubleRange(ratio.getPriceToBook(), criteria.getMinPriceToBook(), criteria.getMaxPriceToBook())
&& matchesDoubleRange(ratio.getRoe(), criteria.getMinRoe(), criteria.getMaxRoe())
&& matchesDoubleRange(ratio.getRoa(), criteria.getMinRoa(), criteria.getMaxRoa())
&& matchesDoubleRange(ratio.getDividend(), criteria.getMinDividend(), criteria.getMaxDividend());
}

private boolean matchesDoubleRange(Double value, Double min, Double max) {
if (value == null) return false;
if (min != null && value < min) return false;
if (max != null && value > max) return false;
return true;
}

private StockScreeningResult convertToStockScreeningResult(StockOverview stock, StockRatio ratio) {
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

private Double getMetricValue(StockOverview overview, StockRatio ratio, String metricName) {
Double value = getFieldValue(overview, metricName);
if (value != null) {
return value;
}

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
return false;
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
}
}
