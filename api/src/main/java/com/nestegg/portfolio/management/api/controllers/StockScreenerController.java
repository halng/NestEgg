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
import com.nestegg.portfolio.management.api.dto.ScreeningCriteria;
import com.nestegg.portfolio.management.api.dto.StockScreeningResult;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class StockScreenerController {
	private final StockScreenerService stockScreenerService;

	@GetMapping
	public ApiRes getStockList(
			@RequestParam(required = false, defaultValue = "symbol") String sortBy,
			@RequestParam(required = false, defaultValue = "asc") String sortOrder
	) {
		return stockScreenerService.getStockList(sortBy, sortOrder);
	}

	@PostMapping("/screen")
	public ApiRes screenStocks(@RequestBody ScreeningCriteria criteria) {
		log.info("Received stock screening request");
		try {
			List<StockScreeningResult> results = stockScreenerService.screenStocks(criteria);
			return ApiRes.ok("Stock screening completed successfully", results);
		} catch (Exception e) {
			log.error("Error during stock screening", e);
			return ApiRes.internalError("Failed to screen stocks: " + e.getMessage());
		}
	}
}
