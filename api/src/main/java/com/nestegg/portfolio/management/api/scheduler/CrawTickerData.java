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
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

@Component
public class CrawTickerData {
	private static final Logger logger = LoggerFactory.getLogger(CrawTickerData.class);

	private final RestClient restClient;
	private final TickerConfiguration tickerConfiguration;
	private final List<String> tickers;
	private final StockRatioService stockRatioService;
	private final TickerService tickerService;
	private final ExecutorService executorService = Executors.newFixedThreadPool(10);

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

	@Scheduled(cron = "0 0 7 * * SAT", zone = "GMT+7")
	public void stockRatioCrawler() {
		String uri = tickerConfiguration.getStockRatio();
		List<List<String>> batches = splitList(tickers, 100); // 100 tickers per batch
		logger.info("Starting crawl stock ratio for {} tickers split into {} batches", tickers.size(), batches.size());
		for (List<String> batch : batches) {
			executorService.submit(() ->
								   {
									   for (String sticker : batch) {
										   try {
											   Thread.sleep(ThreadLocalRandom.current().nextInt(2000, 5001));
											   StockRatio response = get(uri.formatted(sticker), StockRatio.class);
											   logger.info("Fetched stock ratio for {}", sticker);
											   stockRatioService.updateOrCreateStockRatios(response);
										   } catch (InterruptedException ie) {
											   Thread.currentThread().interrupt();
											   logger.error("Thread was interrupted: {}", ie.getMessage());
										   } catch (Exception e) {
											   logger.error("Error fetching stock ratio for {}: {}", sticker, e.getMessage());
										   }
									   }
								   });
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

	@Scheduled(cron = "0 0 7 * * SAT", zone = "GMT+7")
	void overviewCrawler() {
		String uri = tickerConfiguration.getOverview();
		List<List<String>> batches = splitList(tickers, 100); // 100 tickers per batch

		logger.info("Starting crawl overview for {} tickers split into {} batches", tickers.size(), batches.size());
		for (List<String> batch : batches) {
			executorService.submit(() ->
								   {
									   for (String sticker : batch) {
										   try {
											   Thread.sleep(ThreadLocalRandom.current().nextInt(2000, 5001));
											   Object response = get(uri.formatted(sticker), Object.class);
											   Ticker ticker = new Ticker().fromObject(response);
											   logger.info("Fetched overview for {}.", sticker);
											   tickerService.saveOrUpdateTicker(ticker);

										   } catch (InterruptedException ie) {
											   Thread.currentThread().interrupt();
											   logger.error("Thread was interrupted: {}", ie.getMessage());
										   } catch (Exception e) {
											   logger.error("Error fetching overview for {}: {}", sticker, e.getMessage());
										   }
									   }
								   });
		}
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void ratingCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("rating crawler executed. {}", now);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void runOnStartup() {
		for (String sym: tickers){
			tickerService.saveIfNotExists(sym);
			stockRatioService.saveIfNotExists(sym);
		}

	}

	private List<List<String>> splitList(List<String> list, int chunkSize) {
		int totalSize = list.size();
		int numChunks = (int) Math.ceil((double) totalSize / chunkSize);
		return IntStream.range(0, numChunks)
				.mapToObj(i -> list.subList(i * chunkSize, Math.min(totalSize, (i + 1) * chunkSize)))
				.toList();
	}

	private <T> T get(String uri, Class<T> responseType) {
		return restClient.get()
				.uri(uri)
				.retrieve()
				.body(responseType);
	}

}
