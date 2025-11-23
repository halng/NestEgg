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

import com.nestegg.portfolio.management.api.entities.StockCashFlowAnalyse;
import com.nestegg.portfolio.management.api.exceptions.NotImplementedException;
import com.nestegg.portfolio.management.api.repositories.StockCashFlowAnalyseRepository;
import com.nestegg.portfolio.management.api.services.StockCashFlowAnalyseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class StockCashFlowAnalyseServiceImpl implements StockCashFlowAnalyseService {
	private final StockCashFlowAnalyseRepository stockCashFlowAnalyseRepository;

	public StockCashFlowAnalyseServiceImpl(StockCashFlowAnalyseRepository stockCashFlowAnalyseRepository) {
		this.stockCashFlowAnalyseRepository = stockCashFlowAnalyseRepository;
	}

	@Override
	public void updateOrCreate(StockCashFlowAnalyse stockCashFlowAnalyse) {
		log.info("Updating or creating Stock Cash Flow for ticker: {}", stockCashFlowAnalyse.getTicker());
		if (stockCashFlowAnalyseRepository.existsByTicker(stockCashFlowAnalyse.getTicker())) {
			log.info("Stock Cash Flow exists for ticker: {}. Updating record.", stockCashFlowAnalyse.getTicker());
			throw new NotImplementedException();
		} else {
			this.stockCashFlowAnalyseRepository.save(stockCashFlowAnalyse);
			log.info("Stock Cash Flow created for ticker: {}", stockCashFlowAnalyse.getTicker());
		}

	}

	@Override
	public void saveIfNotExists(String symbol) {
		log.info("Checking existence of Stock Cash Flow for ticker: {}", symbol);
		if (!stockCashFlowAnalyseRepository.existsByTicker(symbol)) {
			StockCashFlowAnalyse stockCashFlowAnalyse = new StockCashFlowAnalyse();
			stockCashFlowAnalyse.setTicker(symbol);
			this.stockCashFlowAnalyseRepository.save(stockCashFlowAnalyse);
			log.info("Stock Cash Flow created for ticker without data: {}", symbol);
		} else {
			log.info("Stock Cash Flow already exists for ticker: {}. No action taken.", symbol);
		}

	}
}
