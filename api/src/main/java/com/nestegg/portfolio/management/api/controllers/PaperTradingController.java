package com.nestegg.portfolio.management.api.controllers;

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.services.papertrading.PaperTradingService;
import com.nestegg.portfolio.management.api.viewmodels.papertrading.PaperTradingOrderRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/paper-trading")
public class PaperTradingController {
	private final PaperTradingService paperTradingService;

	public PaperTradingController(PaperTradingService paperTradingService) {
		this.paperTradingService = paperTradingService;
	}

	@GetMapping("/session")
	public ApiRes getSession(@RequestHeader("X-NestEgg-User-Id") String userId) {
		return ApiRes.ok("Paper trading session retrieved successfully", paperTradingService.getSession(userId));
	}

	@PostMapping("/orders")
	public ApiRes placeOrder(@RequestHeader("X-NestEgg-User-Id") String userId, @Valid @RequestBody PaperTradingOrderRequest request) {
		return ApiRes.ok("Paper trading order executed successfully", paperTradingService.placeOrder(userId, request));
	}

	@PostMapping("/reset")
	public ApiRes reset(@RequestHeader("X-NestEgg-User-Id") String userId) {
		return ApiRes.ok("Paper trading account reset successfully", paperTradingService.reset(userId));
	}
}
