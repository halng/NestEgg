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

import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.services.TickerService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TickerServiceImpl implements TickerService {
	private static final Logger LOGGER = LoggerFactory.getLogger(TickerServiceImpl.class);
	private final StockOverviewRepository stockOverviewRepository;

	public TickerServiceImpl(StockOverviewRepository tickerRepository) {
		this.stockOverviewRepository = tickerRepository;
	}

	@Override
	@Transactional
	public void saveOrUpdateTicker(StockOverview ticker) {
		if (this.stockOverviewRepository.existsBySymbol(ticker.getSymbol())) {
			LOGGER.info("Ticker with symbol {} exists. Updating with data {}", ticker.getSymbol(), ticker.toString(true));
			StockOverview existingTicker = this.stockOverviewRepository.findBySymbol(ticker.getSymbol()).orElseThrow();
			existingTicker.setName(ticker.getName());
			existingTicker.setExchange(ticker.getExchange());
			existingTicker.setRating(ticker.getRating());
			existingTicker.setDeltaInWeek(ticker.getDeltaInWeek());
			existingTicker.setDeltaInMonth(ticker.getDeltaInMonth());
			existingTicker.setDeltaInYear(ticker.getDeltaInYear());
			this.stockOverviewRepository.save(existingTicker);
			LOGGER.info("Ticker with symbol {} updated.", ticker.getSymbol());
		} else {
			LOGGER.info("Ticker with symbol {} does not exist. Creating a new record with data {}", ticker.getSymbol(), ticker.toString(true));
			this.stockOverviewRepository.save(ticker);
			LOGGER.info("Ticker with symbol {} created.", ticker.getSymbol());
		}

	}

	@Override
	@Transactional
	public void saveIfNotExists(String symbol) {
		if (!this.stockOverviewRepository.existsBySymbol(symbol)) {
			LOGGER.info("Ticker with symbol {} does not exist. Creating a new record.", symbol);
			StockOverview newTicker = new StockOverview();
			newTicker.setSymbol(symbol);
			this.stockOverviewRepository.save(newTicker);
			LOGGER.info("Ticker with symbol {} created without data.", symbol);
		} else {
			LOGGER.info("Ticker with symbol {} already exists. No action taken.", symbol);
		}
	}
}