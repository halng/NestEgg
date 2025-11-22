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

import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.exceptions.NotImplementedException;
import com.nestegg.portfolio.management.api.repositories.StockIncomeStatementRepository;
import com.nestegg.portfolio.management.api.services.StockIncomeStatementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class StockIncomeStatementServiceImpl implements StockIncomeStatementService {
	private final StockIncomeStatementRepository stockIncomeStatementRepository;

	public StockIncomeStatementServiceImpl(StockIncomeStatementRepository stockIncomeStatementRepository) {
		this.stockIncomeStatementRepository = stockIncomeStatementRepository;
	}

	@Override
	public void updateOrCreate(StockIncomeStatement stockRatio) {
		log.info("Updating or creating income statement for stock: {}", stockRatio.getTicker());
		if (stockIncomeStatementRepository.existsByTicker(stockRatio.getTicker())) {
			throw new NotImplementedException();
		} else {
			stockIncomeStatementRepository.save(stockRatio);
			log.info("Created new income statement for stock: {}", stockRatio.getTicker());
		}

	}

	@Override
	public void saveIfNotExists(String symbol) {
		log.info("Checking if income statement exists for ticker: {}", symbol);
		if(!stockIncomeStatementRepository.existsByTicker(symbol)) {
			StockIncomeStatement newIncomeStatement = new StockIncomeStatement();
			newIncomeStatement.setTicker(symbol);
			stockIncomeStatementRepository.save(newIncomeStatement);
			log.info("Created new income statement without data for ticker: {}", symbol);
		}

	}
}
