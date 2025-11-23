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

import com.nestegg.portfolio.management.api.entities.StockBalanceSheet;
import com.nestegg.portfolio.management.api.exceptions.NotImplementedException;
import com.nestegg.portfolio.management.api.repositories.StockBalanceSheetRepository;
import com.nestegg.portfolio.management.api.services.StockBalanceSheetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class StockBalanceSheetServiceImpl implements StockBalanceSheetService {
	private static final Logger LOGGER = LoggerFactory.getLogger(StockBalanceSheetServiceImpl.class);
	private final StockBalanceSheetRepository stockBalanceSheetRepository;

	public StockBalanceSheetServiceImpl(StockBalanceSheetRepository stockBalanceSheetRepository) {
		this.stockBalanceSheetRepository = stockBalanceSheetRepository;
	}


	@Override
	public void updateOrCreate(StockBalanceSheet stockBalanceSheet) {
		LOGGER.info("Updating/Creating new balance sheet for ticker: {} year {} quarter {}", stockBalanceSheet.getTicker(), stockBalanceSheet.getYear(), stockBalanceSheet.getQuarter());
		String uniqueHash = Base64.getEncoder().encodeToString(String.format(StockBalanceSheet.getHashPattern(), stockBalanceSheet.getTicker(), stockBalanceSheet.getYear(), stockBalanceSheet.getQuarter()).getBytes());
		if (stockBalanceSheetRepository.existsByUniqueHash(uniqueHash)) {
			LOGGER.info("Updating existing balance sheet for ticker: {}", stockBalanceSheet.getTicker());
			throw new NotImplementedException();
		} else {
			stockBalanceSheetRepository.save(stockBalanceSheet);
			LOGGER.info("Created new balance sheet for ticker: {}", stockBalanceSheet.getTicker());
		}

	}

	@Override
	public void saveIfNotExists(String symbol) {
		LOGGER.info("Checking if balance sheet exists for ticker: {}", symbol);
		if (!stockBalanceSheetRepository.existsByTicker(symbol)) {
			StockBalanceSheet newBalanceSheet = new StockBalanceSheet();
			newBalanceSheet.setTicker(symbol);
			stockBalanceSheetRepository.save(newBalanceSheet);
			LOGGER.info("Created new balance sheet without data for ticker: {}", symbol);
		}
	}
}
