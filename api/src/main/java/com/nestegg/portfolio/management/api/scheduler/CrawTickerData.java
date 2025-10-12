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

package com.nestegg.portfolio.management.api.scheduler;

import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.entities.Ticker;
import com.nestegg.portfolio.management.api.services.StockRatioService;
import com.nestegg.portfolio.management.api.services.TickerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class CrawTickerData {
	private static final Logger logger = LoggerFactory.getLogger(CrawTickerData.class);

	private final RestClient restClient;
	private final TickerConfiguration tickerConfiguration;
	private final List<String> tickers;
	private final StockRatioService stockRatioService;
	private final TickerService tickerService;

	public CrawTickerData(TickerConfiguration configuration, StockRatioService stockRatioService, TickerService tickerService) {
		this.tickerConfiguration = configuration;
		this.stockRatioService = stockRatioService;
		this.tickerService = tickerService;

		String token = tickerConfiguration.getToken();
		this.restClient = RestClient.builder()
				.baseUrl(tickerConfiguration.getBaseUrl())
				.defaultHeader("Authorization", "Bearer " + token)
				.build();
		this.tickers = List.of(tickerConfiguration.getTickers().split(","));
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	public void stockRatioCrawler() {
		String uri = tickerConfiguration.getStockRatio();
		for (String sticker : tickers) {
			try {
				StockRatio response = restClient.get()
						.uri(uri.formatted(sticker))
						.retrieve()
						.body(StockRatio.class);
				logger.info("Fetched stock ratio for {}", sticker);
				stockRatioService.updateOrCreateStockRatios(response);
			} catch (Exception e) {
				logger.error("Error fetching stock ratio for {}: {}", sticker, e.getMessage());
			}
		}

	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	public void balanceSheetCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("Balance sheet crawler executed. {}", now);
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void incomeStatementCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("income statement crawler executed. {}", now);
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void indexCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("gaugechart crawler executed. {}", now);
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void overviewCrawler() {
		String uri = tickerConfiguration.getOverview();
		for (String sticker : tickers) {
			try {
				Object response = restClient.get()
						.uri(uri.formatted(sticker))
						.retrieve()
						.body(Object.class);

				Ticker ticker = new Ticker().fromObject(response);
				logger.info("Fetched overview for {}.", sticker);
				tickerService.saveOrUpdateTicker(ticker);
			} catch (Exception e) {
				logger.error("Error fetching overview for {}: {}", sticker, e.getMessage());
			}
		}
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void ratingCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("rating crawler executed. {}", now);
	}

}
