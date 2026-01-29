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

import com.nestegg.portfolio.management.api.dto.AltmanZScoreResult;
import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.PiotroskiFScoreResult;
import com.nestegg.portfolio.management.api.services.FinancialScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/financial-scoring")
public class FinancialScoringController {

	private final FinancialScoringService financialScoringService;

	public FinancialScoringController(FinancialScoringService financialScoringService) {
		this.financialScoringService = financialScoringService;
	}

	@GetMapping("/piotroski-fscore/{ticker}")
	public ResponseEntity<ApiRes<PiotroskiFScoreResult>> getPiotroskiFScore(
			@PathVariable String ticker,
			@RequestParam Integer year,
			@RequestParam Integer quarter) {
		PiotroskiFScoreResult result = financialScoringService.calculatePiotroskiFScore(ticker, year, quarter);
		return ResponseEntity.ok(ApiRes.success(result));
	}

	@GetMapping("/altman-zscore/{ticker}")
	public ResponseEntity<ApiRes<AltmanZScoreResult>> getAltmanZScore(
			@PathVariable String ticker,
			@RequestParam Integer year,
			@RequestParam Integer quarter) {
		AltmanZScoreResult result = financialScoringService.calculateAltmanZScore(ticker, year, quarter);
		return ResponseEntity.ok(ApiRes.success(result));
	}
}
