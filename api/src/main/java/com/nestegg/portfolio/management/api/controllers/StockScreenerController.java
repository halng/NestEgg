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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "*")
public class StockScreenerController {

	private final StockScreenerService stockScreenerService;

	public StockScreenerController(StockScreenerService stockScreenerService) {
		this.stockScreenerService = stockScreenerService;
	}

	@GetMapping
	public ApiRes getStockList(
			@RequestParam(required = false, defaultValue = "symbol") String sortBy,
			@RequestParam(required = false, defaultValue = "asc") String sortOrder
	) {
		return stockScreenerService.getStockList(sortBy, sortOrder);
	}
}
