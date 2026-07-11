/*
 *    Copyright 2026 Hao Nguyen Tan
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
import com.nestegg.portfolio.management.api.services.papertrading.PaperTradingService;
import com.nestegg.portfolio.management.api.viewmodels.papertrading.PaperTradingOrderRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/paper-trading")
public class PaperTradingController {
	private static final String USER_ID_HEADER = "X-NestEgg-User-Id";

	private final PaperTradingService paperTradingService;

	public PaperTradingController(PaperTradingService paperTradingService) {
		this.paperTradingService = paperTradingService;
	}

	@GetMapping("/session")
	public ApiRes getSession(@RequestHeader(USER_ID_HEADER) String userId) {
		return ApiRes.ok("Paper trading session retrieved successfully", paperTradingService.getSession(userId));
	}

	@PostMapping("/orders")
	public ApiRes placeOrder(@RequestHeader(USER_ID_HEADER) String userId, @Valid @RequestBody PaperTradingOrderRequest request) {
		return ApiRes.ok("Paper trading order executed successfully", paperTradingService.placeOrder(userId, request));
	}

	@PostMapping("/reset")
	public ApiRes reset(@RequestHeader(USER_ID_HEADER) String userId) {
		return ApiRes.ok("Paper trading account reset successfully", paperTradingService.reset(userId));
	}
}
