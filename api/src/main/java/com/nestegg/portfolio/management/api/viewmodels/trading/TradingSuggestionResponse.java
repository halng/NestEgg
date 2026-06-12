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

package com.nestegg.portfolio.management.api.viewmodels.trading;

import java.time.LocalDate;
import java.util.List;

public record TradingSuggestionResponse(
		String ticker,
		String name,
		LocalDate analysisDate,
		String action,
		Integer conviction,
		Double targetWeightPercent,
		String thesis,
		List<String> keyRisks,
		List<AgentReport> analystReports,
		ResearchDebate researchDebate,
		AgentReport traderReport,
		RiskAssessment riskAssessment,
		PortfolioDecision portfolioDecision,
		String disclaimer
) {
}
