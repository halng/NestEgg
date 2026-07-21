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

import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.StockRatioService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StockRatioServiceImpl implements StockRatioService {
	private final Logger LOGGER = LoggerFactory.getLogger(StockRatioServiceImpl.class);
	private final StockRatioRepository stockRatioRepository;

	public StockRatioServiceImpl(StockRatioRepository stockRatioRepository) {
		this.stockRatioRepository = stockRatioRepository;
	}

	@Override
	@Transactional
	public void updateOrCreateStockRatios(StockRatio stockRatio) {

		if (this.stockRatioRepository.existsByTicker(stockRatio.getTicker())) {
			LOGGER.info("Stock ratio for ticker {} exists. Updating existing record with data {}.", stockRatio.getTicker(), stockRatio.toString(true));
			StockRatio existingStockRatio = this.stockRatioRepository.findByTicker(stockRatio.getTicker()).orElseThrow();
			existingStockRatio.setAsset(stockRatio.getAsset());
			existingStockRatio.setCapitalize(stockRatio.getCapitalize());
			existingStockRatio.setTradeVolume(stockRatio.getTradeVolume());
			existingStockRatio.setPriceToEarning(stockRatio.getPriceToEarning());
			existingStockRatio.setPriceToBook(stockRatio.getPriceToBook());
			existingStockRatio.setValueBeforeEbitda(stockRatio.getValueBeforeEbitda());
			existingStockRatio.setDividend(stockRatio.getDividend());
			existingStockRatio.setRoe(stockRatio.getRoe());
			existingStockRatio.setProfitGrowthAvarage(stockRatio.getProfitGrowthAvarage());
			existingStockRatio.setAgeOfReceivable(stockRatio.getAgeOfReceivable());
			existingStockRatio.setAgeOfInventory(stockRatio.getAgeOfInventory());
			existingStockRatio.setPayableOnEquity(stockRatio.getPayableOnEquity());
			existingStockRatio.setPayableOnEbitda(stockRatio.getPayableOnEbitda());
			existingStockRatio.setEbitOnInterest(stockRatio.getEbitOnInterest());
			existingStockRatio.setShortOnLongTermPayable(stockRatio.getShortOnLongTermPayable());
			existingStockRatio.setRevenue(stockRatio.getRevenue());
			existingStockRatio.setOperationProfit(stockRatio.getOperationProfit());
			existingStockRatio.setNetProfit(stockRatio.getNetProfit());
			existingStockRatio.setEarningPerShare(stockRatio.getEarningPerShare());
			existingStockRatio.setAsset(stockRatio.getAsset());
			existingStockRatio.setLiability(stockRatio.getLiability());
			existingStockRatio.setEquity(stockRatio.getEquity());
			existingStockRatio.setBookValuePerShare(stockRatio.getBookValuePerShare());
			existingStockRatio.setProfitMargin(stockRatio.getProfitMargin());
			existingStockRatio.setNonInterestOnToi(stockRatio.getNonInterestOnToi());
			existingStockRatio.setLoanOnDeposit(stockRatio.getLoanOnDeposit());
			existingStockRatio.setCreditGrowth(stockRatio.getCreditGrowth());
			existingStockRatio.setBadDebtPercentage(stockRatio.getBadDebtPercentage());
			existingStockRatio.setProvisionOnBadDebt(stockRatio.getProvisionOnBadDebt());
			existingStockRatio.setCustomerCredit(stockRatio.getCustomerCredit());
			existingStockRatio.setBetaIndex(stockRatio.getBetaIndex());
			this.stockRatioRepository.save(existingStockRatio);
			LOGGER.info("Stock ratio for ticker {} has been updated.", stockRatio.getTicker());
		} else {
			LOGGER.info("Stock ratio for ticker {} does not exist. Creating a new record with data {}.", stockRatio.getTicker(), stockRatio.toString(true));
			this.stockRatioRepository.save(stockRatio);
			LOGGER.info("Stock ratio for ticker {} has been created.", stockRatio.getTicker());
		}
	}

	@Override
	@Transactional
	public void saveIfNotExists(String symbol) {
		if (!this.stockRatioRepository.existsByTicker(symbol)) {
			LOGGER.info("Stock ratio for ticker {} does not exist. Creating a new record.", symbol);
			StockRatio newStockRatio = new StockRatio();
			newStockRatio.setTicker(symbol);
			this.stockRatioRepository.save(newStockRatio);
			LOGGER.info("Stock ratio for ticker {} has been created without data.", symbol);
		} else {
			LOGGER.info("Stock ratio for ticker {} already exists. No action taken.", symbol);
		}
	}
}
