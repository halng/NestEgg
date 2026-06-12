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

package com.nestegg.portfolio.management.api.calculations.stock;

import java.util.List;

public final class TradingAgentScoringCalculator {
	private TradingAgentScoringCalculator() {
	}

	/**
	 * Scores business quality from a neutral base of 45. The formula rewards cheaper valuation
	 * (P/E and P/B below preferred thresholds), stronger profitability (ROE and margin), and
	 * revenue growth. Each metric is capped so a single noisy field cannot dominate the result.
	 */
	public static int fundamentalsScore(double pe, double pb, double roe, double revenueGrowth, double margin) {
		return clamp(45
				+ scoreIf(pe > 0D && pe <= 12D, 14, pe > 25D, -12)
				+ scoreIf(pb > 0D && pb <= 1.8D, 10, pb > 4D, -8)
				+ boundedContribution(roe, 0.5D, -10, 18)
				+ boundedContribution(revenueGrowth, 0.35D, -12, 14)
				+ boundedContribution(margin, 0.25D, -8, 10));
	}

	/**
	 * Scores price action from a neutral base of 50. Weekly, monthly, and yearly moves are blended
	 * with diminishing multipliers because shorter-term moves are more actionable but noisier;
	 * liquidity adds a small bonus, while high beta penalizes unstable moves.
	 */
	public static int technicalScore(double week, double month, double year, double beta, long volume) {
		return clamp(50
				+ boundedContribution(week, 1D, -15, 15)
				+ boundedContribution(month, 0.55D, -12, 12)
				+ boundedContribution(year, 0.15D, -10, 10)
				+ (volume >= 1_000_000L ? 5 : 0)
				+ (beta > 1.5D ? -6 : beta < 0.7D ? 3 : 0));
	}

	/**
	 * Scores sentiment from rating and active-trading status. Rating is centered around 5, then
	 * multiplied to translate each point into eight score points; active listings receive a small
	 * confidence bonus and inactive names receive a penalty.
	 */
	public static int sentimentScore(double rating, boolean activelyTraded) {
		return clamp(45 + boundedContribution(rating - 5D, 8D, -20, 25) + (activelyTraded ? 6 : -8));
	}

	/**
	 * Scores macro and catalyst context from reported growth and a sector overlay. Average revenue
	 * growth is capped to avoid overstating one reporting cycle, while the sector adjustment captures
	 * deterministic business-cycle assumptions used by the agent.
	 */
	public static int newsScore(double averageGrowth, int sectorAdjustment) {
		return clamp(50 + boundedContribution(averageGrowth, 0.3D, -12, 12) + sectorAdjustment);
	}

	/**
	 * Converts analyst scores into one consensus by multiplying each score by its weight, summing the
	 * weighted scores, and dividing by the total weight. This gives fundamentals and technicals more
	 * influence than sentiment/news without discarding the smaller signals.
	 */
	public static int weightedAverage(List<Integer> scores, List<Integer> weights) {
		int weightedScore = 0;
		int totalWeight = 0;
		for (int i = 0; i < scores.size(); i++) {
			weightedScore += scores.get(i) * weights.get(i);
			totalWeight += weights.get(i);
		}
		return Math.round((float) weightedScore / totalWeight);
	}

	/**
	 * Converts consensus into trader intent. Strong monthly momentum adds four points, weak monthly
	 * momentum removes four points, and low P/E adds three points as a valuation confirmation.
	 */
	public static int traderScore(int consensus, double monthlyMomentum, double pe) {
		return clamp(consensus + (monthlyMomentum > 8D ? 4 : monthlyMomentum < -8D ? -4 : 0) + (pe > 0D && pe < 10D ? 3 : 0));
	}

	/**
	 * Builds risk from a baseline of 35. Beta, leverage, weekly volatility, low liquidity, and weak
	 * trader conviction each add capped penalties; beta below one can reduce risk by up to eight
	 * points, reflecting lower systematic volatility.
	 */
	public static int riskScore(double beta, double debtOnEquity, double weeklyMove, long volume, int traderScore) {
		return clamp(35
				+ boundedContribution(beta - 1D, 18D, -8, 22)
				+ boundedContribution(debtOnEquity, 0.12D, 0, 18)
				+ boundedContribution(weeklyMove, 1.1D, 0, 18)
				+ (volume > 0L && volume < 300_000L ? 12 : 0)
				+ (traderScore < 40 ? 6 : 0));
	}

	/**
	 * Reduces conviction when risk is above 55. The subtraction is intentionally gradual: every three
	 * risk points above 55 removes one conviction point, preserving good ideas while reflecting sizing
	 * caution.
	 */
	public static int conviction(int traderScore, int riskScore) {
		return clamp(traderScore - Math.max(0, riskScore - 55) / 3);
	}

	/**
	 * Adjusts the portfolio score more conservatively than conviction because sizing decisions should
	 * respond directly to elevated risk. Every two risk points above 55 removes one score point.
	 */
	public static int adjustedPortfolioScore(int traderScore, int riskScore) {
		return clamp(traderScore - Math.max(0, riskScore - 55) / 2);
	}

	public static double stopLossPercent(int riskScore) {
		return Math.max(5D, Math.min(18D, 8D + riskScore / 10D));
	}

	public static int boundedContribution(double value, double multiplier, int floor, int ceiling) {
		return (int) Math.round(Math.max(floor, Math.min(ceiling, value * multiplier)));
	}

	public static int clamp(int score) {
		return Math.max(0, Math.min(100, score));
	}

	private static int scoreIf(boolean positiveCondition, int positive, boolean negativeCondition, int negative) {
		if (positiveCondition) return positive;
		return negativeCondition ? negative : 0;
	}
}
