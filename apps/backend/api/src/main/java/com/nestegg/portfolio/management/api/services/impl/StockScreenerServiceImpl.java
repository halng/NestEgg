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

package com.nestegg.portfolio.management.api.services.impl;

import com.nestegg.portfolio.management.api.dto.screener.ChartDataPoint;
import com.nestegg.portfolio.management.api.dto.screener.MarketBreadth;
import com.nestegg.portfolio.management.api.dto.screener.StockScreenerItem;
import com.nestegg.portfolio.management.api.dto.screener.StockScreenerResponse;
import com.nestegg.portfolio.management.api.entities.StockFinancialRatio;
import com.nestegg.portfolio.management.api.entities.StockIncomeStatement;
import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.StockRatio;
import com.nestegg.portfolio.management.api.repositories.StockFinancialRatioRepository;
import com.nestegg.portfolio.management.api.repositories.StockIncomeStatementRepository;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.StockRatioRepository;
import com.nestegg.portfolio.management.api.services.StockScreenerService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StockScreenerServiceImpl implements StockScreenerService {
	private static final Map<String, String> SECTOR_FALLBACKS = Map.ofEntries(
			Map.entry("FPT", "Technology"),
			Map.entry("VCB", "Banking"),
			Map.entry("BID", "Banking"),
			Map.entry("TCB", "Banking"),
			Map.entry("HPG", "Basic Materials"),
			Map.entry("DGC", "Basic Materials"),
			Map.entry("SSI", "Financial Services"),
			Map.entry("VND", "Financial Services"),
			Map.entry("MWG", "Retail"),
			Map.entry("PVS", "Energy"),
			Map.entry("BSR", "Energy"),
			Map.entry("VHM", "Real Estate"),
			Map.entry("VIC", "Real Estate"),
			Map.entry("IDC", "Real Estate"),
			Map.entry("GEX", "Industrials")
	);

	private final StockOverviewRepository stockOverviewRepository;
	private final StockRatioRepository stockRatioRepository;
	private final StockFinancialRatioRepository stockFinancialRatioRepository;
	private final StockIncomeStatementRepository stockIncomeStatementRepository;

	public StockScreenerServiceImpl(
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
	public StockScreenerResponse getScreener(String query, String exchange, String sector, String signal) {
		List<StockScreenerItem> stocks = stockOverviewRepository.findAllByOrderBySymbolAsc().stream()
				.map(this::toScreenerItem)
				.filter(stock -> matches(query, stock.ticker(), stock.name(), stock.sector(), stock.signal()))
				.filter(stock -> matchesExact(exchange, stock.exchange()))
				.filter(stock -> matchesExact(sector, stock.sector()))
				.filter(stock -> matchesExact(signal, stock.signal()))
				.sorted(Comparator.comparing(StockScreenerItem::score, Comparator.nullsLast(Comparator.reverseOrder())))
				.toList();

		return new StockScreenerResponse(stocks, calculateMarketBreadth(stocks));
	}

	private StockScreenerItem toScreenerItem(StockOverview overview) {
		String ticker = normalizeTicker(overview.getSymbol());
		StockRatio ratio = stockRatioRepository.findByTicker(ticker).orElse(null);
		StockFinancialRatio financialRatio = stockFinancialRatioRepository.findTopByTickerOrderByYearDescQuarterDesc(ticker).orElse(null);
		StockIncomeStatement latestIncome = stockIncomeStatementRepository.findTopByTickerOrderByYearDescQuarterDesc(ticker).orElse(null);
		List<StockIncomeStatement> incomeHistory = stockIncomeStatementRepository.findTop8ByTickerOrderByYearDescQuarterDesc(ticker);

		Double price = estimatePrice(ratio);
		Double changePercent = firstNonNull(overview.getDeltaInWeek(), overview.getDeltaInMonth(), 0D);
		Double marketCap = firstNonNull(valueOf(ratio, StockRatio::getCapitalize), 0D);
		Long volume = firstNonNull(valueOf(ratio, StockRatio::getTradeVolume), 0L);
		Double pe = firstNonNull(valueOf(ratio, StockRatio::getPriceToEarning), valueOf(financialRatio, StockFinancialRatio::getPriceToEarning), 0D);
		Double pb = firstNonNull(valueOf(ratio, StockRatio::getPriceToBook), valueOf(financialRatio, StockFinancialRatio::getPriceToBook), 0D);
		Double roe = firstNonNull(valueOf(ratio, StockRatio::getRoe), valueOf(financialRatio, StockFinancialRatio::getRoe), 0D);
		Double dividendYield = firstNonNull(valueOf(ratio, StockRatio::getDividend), valueOf(financialRatio, StockFinancialRatio::getDividend), 0D);
		Double revenueGrowth = firstNonNull(valueOf(latestIncome, StockIncomeStatement::getYearRevenueGrowth), valueOf(ratio, StockRatio::getProfitGrowthAvarage), 0D);
		Double netMargin = firstNonNull(valueOf(ratio, StockRatio::getProfitMargin), valueOf(financialRatio, StockFinancialRatio::getPostTaxMargin), 0D);
		Double beta = firstNonNull(valueOf(ratio, StockRatio::getBetaIndex), 1D);
		String computedSignal = signalFor(changePercent, pe, pb, roe, dividendYield);
		Integer score = scoreFor(overview.getRating(), pe, pb, roe, dividendYield, revenueGrowth, changePercent, volume);

		return new StockScreenerItem(
				ticker,
				firstNonBlank(overview.getName(), ticker),
				round(price),
				round(changePercent),
				volume,
				round(marketCap),
				round(pe),
				round(pb),
				round(roe),
				round(dividendYield),
				round(revenueGrowth),
				round(netMargin),
				round(beta),
				analystRatingFor(score),
				computedSignal,
				sectorFor(overview, ticker),
				firstNonBlank(overview.getExchange(), "HOSE"),
				statusFor(changePercent),
				score,
				historicalDataFor(ticker, price, volume, incomeHistory)
		);
	}

	private MarketBreadth calculateMarketBreadth(List<StockScreenerItem> stocks) {
		long advancing = stocks.stream().filter(stock -> stock.changePercent() > 0D).count();
		long declining = stocks.stream().filter(stock -> stock.changePercent() < 0D).count();
		long unchanged = Math.max(0, stocks.size() - advancing - declining);
		long ceiling = stocks.stream().filter(stock -> "ceiling".equals(stock.status())).count();
		long floor = stocks.stream().filter(stock -> "floor".equals(stock.status())).count();
		double totalLiquidity = stocks.stream().mapToDouble(stock -> stock.price() * stock.volume() / 1_000_000_000D).sum();
		double vnIndexChange = stocks.stream().mapToDouble(StockScreenerItem::changePercent).average().orElse(0D);
		return new MarketBreadth(advancing, declining, unchanged, ceiling, floor, round(totalLiquidity), round(totalLiquidity * 0.04D), 0D, round(vnIndexChange));
	}

	private List<ChartDataPoint> historicalDataFor(String ticker, Double price, Long volume, List<StockIncomeStatement> incomeHistory) {
		Map<String, StockIncomeStatement> byDate = incomeHistory.stream()
				.collect(Collectors.toMap(
						statement -> String.format(Locale.US, "%d-Q%d", statement.getYear(), statement.getQuarter()),
						Function.identity(),
						(existing, replacement) -> existing
				));

		int seed = Math.abs(ticker.hashCode() % 17) + 1;
		return java.util.stream.IntStream.range(0, 30)
				.mapToObj(index -> {
					LocalDate date = LocalDate.now().minusDays(29L - index);
					double movement = Math.sin((index + seed) / 3D) * 0.035D + (index - 14) * 0.0025D;
					StockIncomeStatement statement = byDate.get(String.format(Locale.US, "%d-Q%d", date.getYear(), ((date.getMonthValue() - 1) / 3) + 1));
					double revenuePulse = statement == null || statement.getYearRevenueGrowth() == null ? 0D : statement.getYearRevenueGrowth() / 1000D;
					return new ChartDataPoint(date.toString(), round(price * (1D + movement + revenuePulse)), Math.max(0L, Math.round(volume * (0.45D + Math.abs(Math.cos(index + seed))))));
				})
				.toList();
	}

	private boolean matches(String query, String... values) {
		if (!StringUtils.hasText(query)) {
			return true;
		}
		String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);
		return java.util.Arrays.stream(values)
				.filter(StringUtils::hasText)
				.map(value -> value.toLowerCase(Locale.ROOT))
				.anyMatch(value -> value.contains(normalizedQuery));
	}

	private boolean matchesExact(String expected, String actual) {
		return !StringUtils.hasText(expected) || expected.equalsIgnoreCase(actual);
	}

	private String signalFor(Double changePercent, Double pe, Double pb, Double roe, Double dividendYield) {
		if (changePercent >= 6.5D) return "Breakout";
		if (pe > 0D && pe <= 10D && pb > 0D && pb <= 1.5D) return "Value";
		if (dividendYield >= 3D) return "Income";
		if (roe >= 18D) return "Quality";
		return "Watch";
	}

	private String statusFor(Double changePercent) {
		if (changePercent >= 6.5D) return "ceiling";
		if (changePercent <= -6.5D) return "floor";
		if (changePercent > 0D) return "up";
		if (changePercent < 0D) return "down";
		return "unchanged";
	}

	private String analystRatingFor(Integer score) {
		if (score >= 88) return "Strong Buy";
		if (score >= 72) return "Buy";
		if (score >= 50) return "Hold";
		return "Reduce";
	}

	private Integer scoreFor(Double rating, Double pe, Double pb, Double roe, Double dividendYield, Double revenueGrowth, Double changePercent, Long volume) {
		double base = rating != null && rating > 0D ? rating * 10D : 50D;
		double valueScore = pe > 0D ? Math.max(0D, 20D - pe) : 0D;
		double pbScore = pb > 0D ? Math.max(0D, 8D - (pb * 2D)) : 0D;
		double qualityScore = Math.min(25D, Math.max(0D, roe));
		double incomeScore = Math.min(10D, Math.max(0D, dividendYield * 2D));
		double growthScore = Math.min(15D, Math.max(-10D, revenueGrowth / 2D));
		double momentumScore = Math.min(10D, Math.max(-10D, changePercent));
		double liquidityScore = volume > 1_000_000L ? 5D : 0D;
		return (int) Math.round(Math.max(0D, Math.min(100D, base * 0.35D + valueScore + pbScore + qualityScore + incomeScore + growthScore + momentumScore + liquidityScore)));
	}

	private String sectorFor(StockOverview overview, String ticker) {
		return firstNonBlank(overview.getIndustry(), SECTOR_FALLBACKS.get(ticker), "Unclassified");
	}

	private Double estimatePrice(StockRatio ratio) {
		if (ratio == null) return 0D;
		if (ratio.getEarningPerShare() != null && ratio.getPriceToEarning() != null) {
			return ratio.getEarningPerShare() * ratio.getPriceToEarning();
		}
		if (ratio.getBookValuePerShare() != null && ratio.getPriceToBook() != null) {
			return ratio.getBookValuePerShare() * ratio.getPriceToBook();
		}
		return ratio.getCapitalize() == null || ratio.getTradeVolume() == null || ratio.getTradeVolume() == 0 ? 0D : ratio.getCapitalize() * 1_000_000_000D / ratio.getTradeVolume();
	}

	private String normalizeTicker(String ticker) {
		return ticker == null ? "" : ticker.trim().toUpperCase(Locale.ROOT);
	}

	private Double round(Double value) {
		return value == null ? 0D : Math.round(value * 100D) / 100D;
	}

	@SafeVarargs
	private <T> T firstNonNull(T... values) {
		for (T value : values) {
			if (value != null) return value;
		}
		return null;
	}

	private String firstNonBlank(String... values) {
		return java.util.Arrays.stream(values).filter(StringUtils::hasText).findFirst().orElse("");
	}

	private <T, R> R valueOf(T source, Function<T, R> mapper) {
		return Optional.ofNullable(source).map(mapper).orElse(null);
	}
}
