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

import com.nestegg.portfolio.management.api.dto.*;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.impl.StockScreenerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockScreenerServiceTest {

@Mock
private StockOverviewRepository stockOverviewRepository;

@Mock
private StockRatioRepository stockRatioRepository;

@InjectMocks
private StockScreenerServiceImpl stockScreenerService;

private StockOverview stockOverview1;
private StockOverview stockOverview2;
private StockRatio stockRatio1;
private StockRatio stockRatio2;

@BeforeEach
void setUp() {
stockOverview1 = StockOverview.builder()
.symbol("AAPL")
.name("Apple Inc.")
.exchange("NASDAQ")
.industry("Technology")
.build();

stockOverview2 = StockOverview.builder()
.symbol("GOOGL")
.name("Alphabet Inc.")
.exchange("NASDAQ")
.industry("Technology")
.build();

stockRatio1 = StockRatio.builder()
.ticker("AAPL")
.priceToEarning(15.0)
.priceToBook(5.0)
.roe(20.0)
.dividend(2.5)
.build();

stockRatio2 = StockRatio.builder()
.ticker("GOOGL")
.priceToEarning(25.0)
.priceToBook(6.0)
.roe(18.0)
.dividend(1.5)
.build();
}

@Test
void testScreenStocks_WithNoFilters_ReturnsAllStocks() {
when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stockOverview1, stockOverview2));
when(stockRatioRepository.findAll()).thenReturn(Collections.emptyList());

ScreenRequest request = ScreenRequest.builder()
.filters(Collections.emptyList())
.build();

List<StockScreenResult> results = stockScreenerService.screenStocks(request);

assertEquals(2, results.size());
verify(stockOverviewRepository, times(1)).findAll();
}

@Test
void testScreenStocks_WithPEFilter_ReturnsMatchingStocks() {
when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stockOverview1, stockOverview2));
when(stockRatioRepository.findAll()).thenReturn(Arrays.asList(stockRatio1, stockRatio2));

FilterCriteriaReq filter = FilterCriteriaReq.builder()
.metricName("priceToEarning")
.operator("LT")
.minValue(20.0)
.build();

ScreenRequest request = ScreenRequest.builder()
.filters(Collections.singletonList(filter))
.build();

List<StockScreenResult> results = stockScreenerService.screenStocks(request);

assertEquals(1, results.size());
assertEquals("AAPL", results.get(0).getTicker());
assertEquals(1, results.get(0).getVisibleMetrics().size());
assertEquals("priceToEarning", results.get(0).getVisibleMetrics().get(0).getMetricName());
assertEquals(15.0, results.get(0).getVisibleMetrics().get(0).getValue());
assertTrue(results.get(0).getVisibleMetrics().get(0).isUsedInFilter());
}

@Test
void testScreenStocks_WithMultipleFilters_ReturnsMatchingStocks() {
when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stockOverview1, stockOverview2));
when(stockRatioRepository.findAll()).thenReturn(Arrays.asList(stockRatio1, stockRatio2));

FilterCriteriaReq filter1 = FilterCriteriaReq.builder()
.metricName("priceToEarning")
.operator("LT")
.minValue(20.0)
.build();

FilterCriteriaReq filter2 = FilterCriteriaReq.builder()
.metricName("roe")
.operator("GTE")
.minValue(19.0)
.build();

ScreenRequest request = ScreenRequest.builder()
.filters(Arrays.asList(filter1, filter2))
.build();

List<StockScreenResult> results = stockScreenerService.screenStocks(request);

assertEquals(1, results.size());
assertEquals("AAPL", results.get(0).getTicker());
assertEquals(2, results.get(0).getVisibleMetrics().size());
}

@Test
void testScreenStocks_WithMissingMetric_ExcludesStock() {
stockRatio1.setPriceToEarning(null);

when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stockOverview1, stockOverview2));
when(stockRatioRepository.findAll()).thenReturn(Arrays.asList(stockRatio1, stockRatio2));

FilterCriteriaReq filter = FilterCriteriaReq.builder()
.metricName("priceToEarning")
.operator("LT")
.minValue(20.0)
.build();

ScreenRequest request = ScreenRequest.builder()
.filters(Collections.singletonList(filter))
.build();

List<StockScreenResult> results = stockScreenerService.screenStocks(request);

assertEquals(0, results.size());
}

@Test
void testGetStockMetrics_WithValidTicker_ReturnsMetrics() {
when(stockOverviewRepository.findById("AAPL")).thenReturn(Optional.of(stockOverview1));
when(stockRatioRepository.findById("AAPL")).thenReturn(Optional.of(stockRatio1));

StockMetricsDetail result = stockScreenerService.getStockMetrics("AAPL");

assertNotNull(result);
assertEquals("AAPL", result.getTicker());
assertEquals("Apple Inc.", result.getName());
assertFalse(result.getAllMetrics().isEmpty());
}

@Test
void testGetStockMetrics_WithInvalidTicker_ThrowsException() {
when(stockOverviewRepository.findById("INVALID")).thenReturn(Optional.empty());

assertThrows(ResourceNotFoundException.class, () -> {
stockScreenerService.getStockMetrics("INVALID");
});
}
}

@Test
void testScreenStocks_WithBetweenOperator_ReturnsMatchingStocks() {
when(stockOverviewRepository.findAll()).thenReturn(Arrays.asList(stockOverview1, stockOverview2));
when(stockRatioRepository.findAll()).thenReturn(Arrays.asList(stockRatio1, stockRatio2));

FilterCriteriaReq filter = FilterCriteriaReq.builder()
.metricName("priceToEarning")
.operator("BETWEEN")
.minValue(10.0)
.maxValue(20.0)
.build();

ScreenRequest request = ScreenRequest.builder()
.filters(Collections.singletonList(filter))
.build();

List<StockScreenResult> results = stockScreenerService.screenStocks(request);

assertEquals(1, results.size());
assertEquals("AAPL", results.get(0).getTicker());
}
}
