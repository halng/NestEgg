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

package com.nestegg.portfolio.management.api.services.impl;

import com.nestegg.portfolio.management.api.constants.TradingAgentConstants;
import com.nestegg.portfolio.management.api.viewmodels.trading.AgentReport;
import com.nestegg.portfolio.management.api.viewmodels.trading.PortfolioDecision;
import com.nestegg.portfolio.management.api.viewmodels.trading.ResearchDebate;
import com.nestegg.portfolio.management.api.viewmodels.trading.RiskAssessment;
import com.nestegg.portfolio.management.api.viewmodels.trading.TradingSuggestionResponse;
import com.nestegg.portfolio.management.api.entities.StockFinancialRatio;
import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.StockFinancialRatioRepository;
import com.nestegg.portfolio.management.api.repositories.StockIncomeStatementRepository;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.TradingAgentService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Function;

import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.adjustedPortfolioScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.conviction;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.fundamentalsScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.newsScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.riskScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.sentimentScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.stopLossPercent;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.technicalScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.traderScore;
import static com.nestegg.portfolio.management.api.calculations.stock.TradingAgentScoringCalculator.weightedAverage;

@Service
public class TradingAgentServiceImpl implements TradingAgentService {

	private final StockOverviewRepository stockOverviewRepository;
	private final StockRatioRepository stockRatioRepository;
	private final StockFinancialRatioRepository stockFinancialRatioRepository;
	private final StockIncomeStatementRepository stockIncomeStatementRepository;

	public TradingAgentServiceImpl(
			StockOverviewRepository stockOverviewRepository,
			StockRatioRepository stockRatioRepository,
			StockFinancialRatioRepository stockFinancialRatioRepository,
			StockIncomeStatementRepository stockIncomeStatementRepository
	) {
		this.stockOverviewRepository = stockOverviewRepository;
		this.stockRatioRepository = stockRatioRepository;
		this.stockFinancialRatioRepository = stockFinancialRatioRepository;
		this.stockIncomeStatementRepository = stockIncomeStatementRepository;
	}

	@Override
	public TradingSuggestionResponse suggest(String ticker) {
		String normalizedTicker = normalizeTicker(ticker);

		StockOverview overview = stockOverviewRepository.findBySymbol(normalizedTicker)
				.orElseThrow(() -> new ResourceNotFoundException("Stock overview not found for ticker: " + normalizedTicker));
		StockRatio ratio = stockRatioRepository.findByTicker(normalizedTicker).orElse(null);
		StockFinancialRatio financialRatio = stockFinancialRatioRepository.findTopByTickerOrderByYearDescQuarterDesc(normalizedTicker).orElse(null);
		StockIncomeStatement incomeStatement = stockIncomeStatementRepository.findTopByTickerOrderByYearDescQuarterDesc(normalizedTicker).orElse(null);
		List<StockIncomeStatement> incomeHistory = stockIncomeStatementRepository.findTop8ByTickerOrderByYearDescQuarterDesc(normalizedTicker);

		AgentReport fundamentals = fundamentalsAnalyst(overview, ratio, financialRatio, incomeStatement);
		AgentReport technicals = technicalAnalyst(overview, ratio);
		AgentReport sentiment = sentimentAnalyst(overview);
		AgentReport news = newsAnalyst(overview, incomeHistory);
		List<AgentReport> analystReports = List.of(fundamentals, sentiment, news, technicals);

		ResearchDebate debate = researchDebate(analystReports, overview, ratio);
		int analystConsensus = weightedAverage(List.of(fundamentals.score(), sentiment.score(), news.score(), technicals.score()), List.of(40, 15, 15, 30));
		AgentReport trader = traderAgent(analystConsensus, overview, ratio, debate);
		RiskAssessment riskAssessment = riskManagers(overview, ratio, financialRatio, trader.score());
		PortfolioDecision decision = portfolioManager(trader.score(), riskAssessment, overview);

		return new TradingSuggestionResponse(
				normalizedTicker,
				firstNonBlank(overview.getName(), normalizedTicker),
				LocalDate.now(),
				decision.action(),
				conviction(trader.score(), riskAssessment.riskScore()),
				decision.targetWeightPercent(),
				debate.synthesis(),
				riskAssessment.constraints(),
				analystReports,
				debate,
				trader,
				riskAssessment,
				decision,
				TradingAgentConstants.DISCLAIMER
		);
	}

	private AgentReport fundamentalsAnalyst(StockOverview overview, StockRatio ratio, StockFinancialRatio financialRatio, StockIncomeStatement incomeStatement) {
		double pe = firstNonNull(valueOf(financialRatio, StockFinancialRatio::getPriceToEarning), valueOf(ratio, StockRatio::getPriceToEarning), 0D);
		double pb = firstNonNull(valueOf(financialRatio, StockFinancialRatio::getPriceToBook), valueOf(ratio, StockRatio::getPriceToBook), 0D);
		double roe = firstNonNull(valueOf(financialRatio, StockFinancialRatio::getRoe), valueOf(ratio, StockRatio::getRoe), 0D);
		double revenueGrowth = firstNonNull(valueOf(incomeStatement, StockIncomeStatement::getYearRevenueGrowth), 0D);
		double margin = firstNonNull(valueOf(financialRatio, StockFinancialRatio::getPostTaxMargin), valueOf(ratio, StockRatio::getProfitMargin), 0D);

		int score = fundamentalsScore(pe, pb, roe, revenueGrowth, margin);

		return new AgentReport(
				TradingAgentConstants.ROLE_FUNDAMENTALS_ANALYST,
				stanceFor(score),
				score,
				TradingAgentConstants.SUMMARY_FUNDAMENTALS,
				List.of(
						metric("P/E", pe),
						metric("P/B", pb),
						metric("ROE", roe),
						metric("Revenue growth", revenueGrowth),
						metric("Post-tax margin", margin)
				)
		);
	}

	private AgentReport technicalAnalyst(StockOverview overview, StockRatio ratio) {
		double week = firstNonNull(overview.getDeltaInWeek(), 0D);
		double month = firstNonNull(overview.getDeltaInMonth(), 0D);
		double year = firstNonNull(overview.getDeltaInYear(), 0D);
		double beta = firstNonNull(valueOf(ratio, StockRatio::getBetaIndex), 1D);
		long volume = firstNonNull(valueOf(ratio, StockRatio::getTradeVolume), 0L);

		int score = technicalScore(week, month, year, beta, volume);

		return new AgentReport(
				TradingAgentConstants.ROLE_TECHNICAL_ANALYST,
				stanceFor(score),
				score,
				TradingAgentConstants.SUMMARY_TECHNICALS,
				List.of(
						metric("Weekly change %", week),
						metric("Monthly change %", month),
						metric("Yearly change %", year),
						"Trade volume: " + volume,
						metric("Beta", beta)
				)
		);
	}

	private AgentReport sentimentAnalyst(StockOverview overview) {
		double rating = firstNonNull(overview.getRating(), 0D);
		boolean activelyTraded = Boolean.TRUE.equals(overview.getIsActivelyTraded());
		int score = sentimentScore(rating, activelyTraded);

		return new AgentReport(
				TradingAgentConstants.ROLE_SENTIMENT_ANALYST,
				stanceFor(score),
				score,
				TradingAgentConstants.SUMMARY_SENTIMENT,
				List.of(
						metric("Stock rating", rating),
						"Actively traded: " + activelyTraded,
						"Exchange: " + firstNonBlank(overview.getExchange(), "unknown")
				)
		);
	}

	private AgentReport newsAnalyst(StockOverview overview, List<StockIncomeStatement> incomeHistory) {
		double averageGrowth = incomeHistory.stream()
				.map(StockIncomeStatement::getYearRevenueGrowth)
				.filter(value -> value != null)
				.mapToDouble(Double::doubleValue)
				.average()
				.orElse(0D);
		String industry = firstNonBlank(overview.getIndustry(), "Unclassified");
		int sectorAdjustment = sectorAdjustment(industry);
		int score = newsScore(averageGrowth, sectorAdjustment);

		return new AgentReport(
				TradingAgentConstants.ROLE_NEWS_MACRO_ANALYST,
				stanceFor(score),
				score,
				TradingAgentConstants.SUMMARY_NEWS,
				List.of(
						"Industry: " + industry,
						metric("Average reported revenue growth", averageGrowth),
						"Sector macro adjustment: " + sectorAdjustment
				)
		);
	}

	private ResearchDebate researchDebate(List<AgentReport> reports, StockOverview overview, StockRatio ratio) {
		AgentReport best = reports.stream().max(java.util.Comparator.comparing(AgentReport::score)).orElse(reports.getFirst());
		AgentReport worst = reports.stream().min(java.util.Comparator.comparing(AgentReport::score)).orElse(reports.getFirst());
		double liquidity = firstNonNull(valueOf(ratio, StockRatio::getTradeVolume), 0L) / 1_000_000D;
		String bullish = "Bull case: " + best.role() + " is " + best.stance().toLowerCase(Locale.ROOT) + " because " + best.evidence().getFirst() + ".";
		String bearish = "Bear case: " + worst.role() + " flags " + worst.stance().toLowerCase(Locale.ROOT) + " conditions; liquidity is " + round(liquidity) + " million shares and adverse revisions can amplify drawdowns.";
		String synthesis = String.format(Locale.US,
				"%s shows a blended opportunity where analyst support must be balanced against valuation, momentum, liquidity, and sector risk before sizing the trade.",
				firstNonBlank(overview.getName(), overview.getSymbol()));
		return new ResearchDebate(bullish, bearish, synthesis);
	}

	private AgentReport traderAgent(int consensus, StockOverview overview, StockRatio ratio, ResearchDebate debate) {
		double monthlyMomentum = firstNonNull(overview.getDeltaInMonth(), 0D);
		double pe = firstNonNull(valueOf(ratio, StockRatio::getPriceToEarning), 0D);
		int score = traderScore(consensus, monthlyMomentum, pe);
		return new AgentReport(
				TradingAgentConstants.ROLE_TRADER_AGENT,
				stanceFor(score),
				score,
				TradingAgentConstants.SUMMARY_TRADER,
				List.of(
						"Weighted analyst consensus: " + consensus,
						metric("Monthly momentum adjustment", monthlyMomentum),
						debate.synthesis()
				)
		);
	}

	private RiskAssessment riskManagers(StockOverview overview, StockRatio ratio, StockFinancialRatio financialRatio, int traderScore) {
		double beta = firstNonNull(valueOf(ratio, StockRatio::getBetaIndex), 1D);
		double debtOnEquity = firstNonNull(valueOf(financialRatio, StockFinancialRatio::getDebtOnEquity), valueOf(ratio, StockRatio::getPayableOnEquity), 0D);
		double weeklyMove = Math.abs(firstNonNull(overview.getDeltaInWeek(), 0D));
		long volume = firstNonNull(valueOf(ratio, StockRatio::getTradeVolume), 0L);

		int riskScore = riskScore(beta, debtOnEquity, weeklyMove, volume, traderScore);

		List<String> constraints = new ArrayList<>();
		constraints.add(metric("Beta", beta));
		constraints.add(metric("Debt on equity", debtOnEquity));
		constraints.add(metric("Absolute weekly move %", weeklyMove));
		if (volume > 0L && volume < 300_000L) {
			constraints.add("Liquidity below preferred threshold: " + volume + " shares");
		}
		if (traderScore < 45) {
			constraints.add("Trader score is below accumulation threshold");
		}

		return new RiskAssessment(riskLevel(riskScore), riskScore, round(stopLossPercent(riskScore)), constraints);
	}

	private PortfolioDecision portfolioManager(int traderScore, RiskAssessment riskAssessment, StockOverview overview) {
		int adjustedScore = adjustedPortfolioScore(traderScore, riskAssessment.riskScore());
		String action = actionFor(adjustedScore);
		boolean approved = !TradingAgentConstants.ACTION_SELL.equals(action)
				&& !(TradingAgentConstants.ACTION_REDUCE.equals(action) && riskAssessment.riskScore() >= 70);
		double targetWeight = switch (action) {
			case TradingAgentConstants.ACTION_BUY -> 8D;
			case TradingAgentConstants.ACTION_ACCUMULATE -> 5D;
			case TradingAgentConstants.ACTION_HOLD -> 0D;
			case TradingAgentConstants.ACTION_REDUCE -> -4D;
			default -> -8D;
		};
		if (TradingAgentConstants.RISK_HIGH.equals(riskAssessment.riskLevel()) || TradingAgentConstants.RISK_VERY_HIGH.equals(riskAssessment.riskLevel())) {
			targetWeight = targetWeight > 0D ? targetWeight / 2D : targetWeight;
		}
		String rationale = String.format(Locale.US,
				"Portfolio manager %s the %s action after adjusting score to %d for %s risk.",
				approved ? "approves" : "does not approve",
				action.toLowerCase(Locale.ROOT),
				adjustedScore,
				riskAssessment.riskLevel().toLowerCase(Locale.ROOT));
		return new PortfolioDecision(action, approved, round(targetWeight), rationale + " Ticker: " + firstNonBlank(overview.getSymbol(), "unknown") + ".");
	}

	private String actionFor(int score) {
		if (score >= 75) return TradingAgentConstants.ACTION_BUY;
		if (score >= 60) return TradingAgentConstants.ACTION_ACCUMULATE;
		if (score >= 45) return TradingAgentConstants.ACTION_HOLD;
		if (score >= 30) return TradingAgentConstants.ACTION_REDUCE;
		return TradingAgentConstants.ACTION_SELL;
	}

	private String riskLevel(int riskScore) {
		if (riskScore >= 80) return TradingAgentConstants.RISK_VERY_HIGH;
		if (riskScore >= 65) return TradingAgentConstants.RISK_HIGH;
		if (riskScore >= 45) return TradingAgentConstants.RISK_MODERATE;
		return TradingAgentConstants.RISK_LOW;
	}

	private String stanceFor(int score) {
		if (score >= 75) return TradingAgentConstants.STANCE_STRONG_BULLISH;
		if (score >= 60) return TradingAgentConstants.STANCE_BULLISH;
		if (score >= 45) return TradingAgentConstants.STANCE_NEUTRAL;
		if (score >= 30) return TradingAgentConstants.STANCE_BEARISH;
		return TradingAgentConstants.STANCE_STRONG_BEARISH;
	}

	private int sectorAdjustment(String industry) {
		String normalized = industry.toLowerCase(Locale.ROOT);
		if (normalized.contains("technology") || normalized.contains("software")) return 5;
		if (normalized.contains("bank") || normalized.contains("financial")) return 2;
		if (normalized.contains("utility") || normalized.contains("consumer")) return 1;
		if (normalized.contains("real estate") || normalized.contains("material")) return -2;
		if (normalized.contains("energy") || normalized.contains("oil")) return -3;
		return 0;
	}

	private String metric(String label, Double value) {
		return label + ": " + round(value);
	}

	private Double round(Double value) {
		return value == null ? 0D : Math.round(value * 100D) / 100D;
	}

	@SafeVarargs
	private final <T> T firstNonNull(T... values) {
		for (T value : values) {
			if (value != null) return value;
		}
		return null;
	}

	private String firstNonBlank(String... values) {
		for (String value : values) {
			if (StringUtils.hasText(value)) return value;
		}
		return "";
	}

	private String normalizeTicker(String ticker) {
		if (!StringUtils.hasText(ticker)) {
			throw new IllegalArgumentException("Ticker is required");
		}
		return ticker.trim().toUpperCase(Locale.ROOT);
	}

	private <T, R> R valueOf(T source, Function<T, R> mapper) {
		return Optional.ofNullable(source).map(mapper).orElse(null);
	}
}
