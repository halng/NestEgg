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

import com.nestegg.portfolio.management.api.dto.*;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockScreenerController {

	private final StockScreenerService stockScreenerService;

	@PostMapping("/screen")
	public ResponseEntity<ApiRes<List<StockScreenResult>>> screenStocks(@Valid @RequestBody ScreenRequest request) {
		List<StockScreenResult> results = stockScreenerService.screenStocks(request);
		return ResponseEntity.ok(ApiRes.<List<StockScreenResult>>builder()
				.code(200)
				.message("Screening completed successfully")
				.data(results)
				.build());
	}

	@GetMapping("/{ticker}/metrics")
	public ResponseEntity<ApiRes<StockMetricsDetail>> getStockMetrics(@PathVariable String ticker) {
		StockMetricsDetail metrics = stockScreenerService.getStockMetrics(ticker);
		return ResponseEntity.ok(ApiRes.<StockMetricsDetail>builder()
				.code(200)
				.message("Metrics retrieved successfully")
				.data(metrics)
				.build());
	}
}
