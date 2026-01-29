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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockScreenerServiceImpl implements StockScreenerService {
	private final StockOverviewRepository stockOverviewRepository;
	private final StockFinancialRatioRepository stockFinancialRatioRepository;

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
