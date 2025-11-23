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

import com.nestegg.portfolio.management.api.entities.StockBalanceSheet;
import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.services.StockBalanceSheetService;
import com.nestegg.portfolio.management.api.services.StockIncomeStatementService;
import com.nestegg.portfolio.management.api.services.StockRatioService;
import com.nestegg.portfolio.management.api.services.TickerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.IntStream;

@Component
public class CrawTickerData {
	private static final Logger logger = LoggerFactory.getLogger(CrawTickerData.class);

	private final RestClient restClient;
	private final TickerConfiguration tickerConfiguration;
	private final List<String> tickers;
	private final StockRatioService stockRatioService;
	private final StockBalanceSheetService stockBalanceSheetService;
	private final StockIncomeStatementService stockIncomeStatementService;
	private final TickerService tickerService;
	private final ExecutorService executorService = Executors.newFixedThreadPool(10);

	public CrawTickerData(TickerConfiguration configuration, StockRatioService stockRatioService, StockBalanceSheetService stockBalanceSheetService, StockIncomeStatementService stockIncomeStatementService, TickerService tickerService) {
		this.tickerConfiguration = configuration;
		this.stockRatioService = stockRatioService;
		this.stockBalanceSheetService = stockBalanceSheetService;
		this.stockIncomeStatementService = stockIncomeStatementService;
		this.tickerService = tickerService;

		String token = tickerConfiguration.getToken();
		this.restClient = RestClient.builder()
				.baseUrl(tickerConfiguration.getBaseUrl())
				.defaultHeader("Authorization", "Bearer " + token)
				.build();
		this.tickers = List.of(tickerConfiguration.getBcfTickers().split(","));
	}

	@Scheduled(cron = "0 0 7 * * SAT", zone = "GMT+7")
	public void stockRatioCrawler() {
		String uri = tickerConfiguration.getStockRatio();
		crawl(
				tickers, uri, "stock ratio",
				(url) -> get(url, StockRatio.class),
				stockRatioService::updateOrCreateStockRatios
		);
	}

	@Scheduled(cron = "0 0 8 * * SAT", zone = "GMT+7")
	public void balanceSheetCrawler() {
		String uri = tickerConfiguration.getBalanceSheet();
		crawl(
				tickers, uri, "balance sheet",
				(url) -> get(url, StockBalanceSheet[].class),
				(response) -> {
					Arrays.asList(response).forEach(stockBalanceSheetService::updateOrCreate);
				}
		);
	}

	@Scheduled(cron = "0 0 9 * * SAT", zone = "GMT+7")
	void incomeStatementCrawler() {
		String uri = tickerConfiguration.getIncomeStatement();
		crawl(
				tickers, uri, "income statement",
				(url) -> get(url, StockIncomeStatement[].class),
				(response) -> {
					Arrays.asList(response).forEach(stockIncomeStatementService::updateOrCreate);
				}
		);

	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void indexCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("gaugechart crawler executed. {}", now);
	}

	@Scheduled(cron = "0 0 7 * * SAT", zone = "GMT+7")
	void overviewCrawler() {
		String uri = tickerConfiguration.getOverview();
		crawl(
				tickers, uri, "overview",
				(url) -> get(url, Object.class),
				(response) -> {
					StockOverview ticker = new StockOverview().fromObject(response);
					tickerService.saveOrUpdateTicker(ticker);
				}
		);
	}


	@EventListener(ApplicationReadyEvent.class)
	public void runOnStartup() {
		if (this.tickerConfiguration.isCrawlOnStartup()) {
			executorService.submit(this::balanceSheetCrawler);
			executorService.submit(this::incomeStatementCrawler);
//			executorService.submit(this::indexCrawler);
			executorService.submit(this::overviewCrawler);
			executorService.submit(this::stockRatioCrawler);
		}
//		for (String sym : tickers) {
//			tickerService.saveIfNotExists(sym);
//			stockRatioService.saveIfNotExists(sym);
//			stockBalanceSheetService.saveIfNotExists(sym);
//			stockIncomeStatementService.saveIfNotExists(sym);
//		}

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

	private <T> void crawl(List<String> tickers, String urlPattern, String dataTypeName, Function<String, T> fetcher, Consumer<T> saver) {
		List<List<String>> batches = splitList(tickers, 100);
		logger.info("Starting crawl {} for {} tickers split into {} batches", dataTypeName, tickers.size(), batches.size());

		for (List<String> batch : batches) {
			executorService.submit(() ->
								   {
									   for (String sticker : batch) {
										   try {
											   Thread.sleep(ThreadLocalRandom.current().nextInt(2000, 5001));
											   String formattedUrl = urlPattern.formatted(sticker);
											   T response = fetcher.apply(formattedUrl);
											   logger.info("Fetched {} for {}", dataTypeName, sticker);
											   if (response != null) {
												   saver.accept(response);
											   }

										   } catch (InterruptedException ie) {
											   Thread.currentThread().interrupt();
											   logger.error("Thread was interrupted: {}", ie.getMessage());
										   } catch (Exception e) {
											   logger.error("Error fetching {} for {}: {}", dataTypeName, sticker, e.getMessage());
										   }
									   }
								   });
		}
	}

}
