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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class CrawTickerData {
	private static final Logger logger = LoggerFactory.getLogger(CrawTickerData.class);
	private static final String API_URL = "https://apiextaws.tcbs.com.vn/tcanalysis/v1/ticker/%s/stockratio";

	private final RestClient restClient;

	public CrawTickerData() {
		this.restClient = RestClient.builder().defaultHeader("Authorization", getAuth()).build();
	}

	@Scheduled(cron = "0 0 */12 * * *", zone = "GMT+7")
	public void authentication() {
		String token = "Bearer <token>";
		UserDetailsCustom user = new UserDetailsCustom("user", "password", null, token);
		InMemoryUserDetailsManager man = new InMemoryUserDetailsManager(user);
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	public void stockRatioCrawler() {
		List<String> stickers = getAllStickers();
		for (String sticker : stickers) {
			try {
				String response = restClient.get()
						.uri(API_URL.formatted(sticker))
						.retrieve()
						.body(String.class);
				logger.info("Fetched stock ratio for {}: {}", sticker, response);
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
		long now = System.currentTimeMillis() / 1000;
		logger.info("overview crawler executed. {}", now);
	}

	@Scheduled(cron = "0 */2 * * * *", zone = "GMT+7")
	void ratingCrawler() {
		long now = System.currentTimeMillis() / 1000;
		logger.info("rating crawler executed. {}", now);
	}

	private String getAuth() {
		UserDetailsCustom user = (UserDetailsCustom) new InMemoryUserDetailsManager().loadUserByUsername("user");
		return "Bearer " + user.getToken();
	}

	//	TODO: Replace with DB call
	private List<String> getAllStickers() {
		return List.of("VRE", "VIC", "VIB");
	}
}
