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

import com.nestegg.portfolio.management.api.dto.AltmanZScoreRes;
import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.PiotroskiFScoreRes;
import com.nestegg.portfolio.management.api.services.FinancialScoringService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("financial-scoring")
@Validated
public class FinancialScoringController {

	private final FinancialScoringService financialScoringService;

	public FinancialScoringController(FinancialScoringService financialScoringService) {
		this.financialScoringService = financialScoringService;
	}

	@GetMapping("/piotroski-fscore/{ticker}")
	public ApiRes<PiotroskiFScoreRes> getPiotroskiFScore(
			@PathVariable String ticker,
			@RequestParam(required = false) @Min(1900) @Max(2100) Integer year,
			@RequestParam @Min(1) @Max(4) Integer quarter) {
		PiotroskiFScoreRes result = financialScoringService.calculatePiotroskiFScore(ticker, year, quarter);
		return ApiRes.success(result);
	}

	@GetMapping("/altman-zscore/{ticker}")
	public ApiRes<AltmanZScoreRes> getAltmanZScore(
			@PathVariable String ticker,
			@RequestParam(required = false) @Min(1900) @Max(2100) Integer year,
			@RequestParam @Min(1) @Max(4) Integer quarter) {
		AltmanZScoreRes result = financialScoringService.calculateAltmanZScore(ticker, year, quarter);
		return ApiRes.success(result);
	}
}
