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

package com.nestegg.portfolio.management.api.controllers;

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stocks")
public class StockScreenerController {
	private final StockScreenerService stockScreenerService;

	public StockScreenerController(StockScreenerService stockScreenerService) {
		this.stockScreenerService = stockScreenerService;
	}

	@GetMapping("/screener")
	public ApiRes getScreener(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String exchange,
			@RequestParam(required = false) String sector,
			@RequestParam(required = false) String signal
	) {
		return ApiRes.ok("Stock screener data retrieved successfully", stockScreenerService.getScreener(q, exchange, sector, signal));
	}
}
