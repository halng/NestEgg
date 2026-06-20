package com.nestegg.portfolio.management.api.services.impl.papertrading;

import com.nestegg.portfolio.management.api.entities.StockOverview;
import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingAccount;
import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingHolding;
import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingLedgerEntry;
import com.nestegg.portfolio.management.api.repositories.StockOverviewRepository;
import com.nestegg.portfolio.management.api.repositories.papertrading.PaperTradingAccountRepository;
import com.nestegg.portfolio.management.api.repositories.papertrading.PaperTradingHoldingRepository;
import com.nestegg.portfolio.management.api.repositories.papertrading.PaperTradingLedgerEntryRepository;
import com.nestegg.portfolio.management.api.services.papertrading.PaperTradingService;
import com.nestegg.portfolio.management.api.viewmodels.papertrading.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class PaperTradingServiceImpl implements PaperTradingService {
	private static final BigDecimal STARTING_CAPITAL = new BigDecimal("100000000");
	private final PaperTradingAccountRepository accountRepository;
	private final PaperTradingHoldingRepository holdingRepository;
	private final PaperTradingLedgerEntryRepository ledgerRepository;
	private final StockOverviewRepository stockOverviewRepository;

	public PaperTradingServiceImpl(PaperTradingAccountRepository accountRepository, PaperTradingHoldingRepository holdingRepository, PaperTradingLedgerEntryRepository ledgerRepository, StockOverviewRepository stockOverviewRepository) {
		this.accountRepository = accountRepository;
		this.holdingRepository = holdingRepository;
		this.ledgerRepository = ledgerRepository;
		this.stockOverviewRepository = stockOverviewRepository;
	}

	@Override
	@Transactional
	public PaperTradingSession getSession(String userId) {
		return toSession(getOrCreateAccount(userId), "Loaded paper trading account from the database.");
	}

	@Override
	@Transactional
	public PaperTradingSession placeOrder(String userId, PaperTradingOrderRequest request) {
		PaperTradingAccount account = getOrCreateAccount(userId);
		String ticker = request.ticker().trim().toUpperCase(Locale.ROOT);
		BigDecimal price = priceFor(ticker);
		BigDecimal total = price.multiply(BigDecimal.valueOf(request.shares()));

		if ("BUY".equals(request.side()) && account.getCashBalance().compareTo(total) < 0) {
			throw new IllegalArgumentException("Insufficient Virtual Funds");
		}

		PaperTradingHolding holding = holdingRepository.findByAccountAndTicker(account, ticker).orElse(null);
		if ("SELL".equals(request.side()) && (holding == null || holding.getShares() < request.shares())) {
			throw new IllegalArgumentException("Insufficient Shares");
		}

		if ("BUY".equals(request.side())) {
			if (holding == null) {
				holding = PaperTradingHolding.builder().account(account).ticker(ticker).shares(request.shares()).averageCost(price).build();
			} else {
				BigDecimal currentCost = holding.getAverageCost().multiply(BigDecimal.valueOf(holding.getShares()));
				holding.setAverageCost(currentCost.add(total).divide(BigDecimal.valueOf(holding.getShares() + request.shares()), 2, RoundingMode.HALF_UP));
				holding.setShares(holding.getShares() + request.shares());
			}
			account.setCashBalance(account.getCashBalance().subtract(total));
			holdingRepository.save(holding);
		} else {
			holding.setShares(holding.getShares() - request.shares());
			account.setCashBalance(account.getCashBalance().add(total));
			if (holding.getShares() == 0) holdingRepository.delete(holding); else holdingRepository.save(holding);
		}

		ledgerRepository.save(PaperTradingLedgerEntry.builder().account(account).side(request.side()).ticker(ticker).shares(request.shares()).price(price).total(total).executedAt(Instant.now()).build());
		accountRepository.save(account);
		return toSession(account, mentorMessage(account));
	}

	@Override
	@Transactional
	public PaperTradingSession reset(String userId) {
		PaperTradingAccount account = getOrCreateAccount(userId);
		holdingRepository.deleteByAccount(account);
		ledgerRepository.deleteByAccount(account);
		account.setCashBalance(account.getStartingCapital());
		accountRepository.save(account);
		return toSession(account, "Account reset complete. Holdings and ledger were cleared in the database.");
	}

	private PaperTradingAccount getOrCreateAccount(String userId) {
		return accountRepository.findByUserId(userId).orElseGet(() -> accountRepository.save(PaperTradingAccount.builder().userId(userId).startingCapital(STARTING_CAPITAL).cashBalance(STARTING_CAPITAL).build()));
	}

	private PaperTradingSession toSession(PaperTradingAccount account, String mentorMessage) {
		List<PaperTradingHoldingView> holdings = holdingRepository.findByAccountOrderByTickerAsc(account).stream().map(this::toHoldingView).toList();
		BigDecimal invested = holdings.stream().map(PaperTradingHoldingView::marketValue).reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal totalValue = account.getCashBalance().add(invested);
		BigDecimal roi = totalValue.subtract(account.getStartingCapital()).multiply(BigDecimal.valueOf(100)).divide(account.getStartingCapital(), 2, RoundingMode.HALF_UP);
		return new PaperTradingSession(account.getId(), account.getStartingCapital(), account.getCashBalance(), totalValue, roi, marketWatch(), holdings, ledgerRepository.findTop25ByAccountOrderByExecutedAtDesc(account).stream().map(this::toLedgerView).toList(), mentorMessage);
	}

	private PaperTradingHoldingView toHoldingView(PaperTradingHolding holding) {
		BigDecimal currentPrice = priceFor(holding.getTicker());
		BigDecimal marketValue = currentPrice.multiply(BigDecimal.valueOf(holding.getShares()));
		BigDecimal cost = holding.getAverageCost().multiply(BigDecimal.valueOf(holding.getShares()));
		StockOverview stock = stockOverviewRepository.findBySymbol(holding.getTicker()).orElse(null);
		return new PaperTradingHoldingView(holding.getTicker(), holding.getShares(), holding.getAverageCost(), currentPrice, marketValue, marketValue.subtract(cost), stock != null ? stock.getIndustry() : "Unknown");
	}

	private PaperTradingLedgerEntryView toLedgerView(PaperTradingLedgerEntry entry) {
		return new PaperTradingLedgerEntryView(entry.getId(), entry.getSide(), entry.getTicker(), entry.getShares(), entry.getPrice(), entry.getTotal(), entry.getExecutedAt());
	}

	private List<PaperTradingMarketTicker> marketWatch() {
		List<StockOverview> stocks = stockOverviewRepository.findAllByOrderBySymbolAsc().stream().limit(30).toList();
		if (stocks.isEmpty()) stocks = List.of(StockOverview.builder().symbol("FPT").name("FPT Corporation").exchange("HOSE").industry("Technology").build(), StockOverview.builder().symbol("HPG").name("Hoa Phat Group").exchange("HOSE").industry("Basic Materials").build(), StockOverview.builder().symbol("VNM").name("Vinamilk").exchange("HOSE").industry("Consumer Staples").build());
		return stocks.stream().map(stock -> new PaperTradingMarketTicker(stock.getSymbol(), stock.getName(), stock.getExchange(), stock.getIndustry(), priceFor(stock.getSymbol()), BigDecimal.valueOf((stock.getSymbol().hashCode() % 90) / 10.0))).toList();
	}

	private BigDecimal priceFor(String ticker) {
		return BigDecimal.valueOf(10_000 + Math.abs(ticker.hashCode() % 140_000)).setScale(2, RoundingMode.HALF_UP);
	}

	private String mentorMessage(PaperTradingAccount account) {
		BigDecimal total = account.getCashBalance().add(holdingRepository.findByAccountOrderByTickerAsc(account).stream().map(h -> priceFor(h.getTicker()).multiply(BigDecimal.valueOf(h.getShares()))).reduce(BigDecimal.ZERO, BigDecimal::add));
		return holdingRepository.findByAccountOrderByTickerAsc(account).stream().collect(java.util.stream.Collectors.groupingBy(h -> stockOverviewRepository.findBySymbol(h.getTicker()).map(StockOverview::getIndustry).orElse("Unknown"), java.util.stream.Collectors.reducing(BigDecimal.ZERO, h -> priceFor(h.getTicker()).multiply(BigDecimal.valueOf(h.getShares())), BigDecimal::add))).entrySet().stream().max(Comparator.comparing(java.util.Map.Entry::getValue)).filter(e -> total.compareTo(BigDecimal.ZERO) > 0 && e.getValue().multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP).compareTo(BigDecimal.valueOf(40)) > 0).map(e -> "Structural risk warning: " + e.getKey() + " exposure is above the 40% guardrail.").orElse("Trade complete. Portfolio state and ledger were persisted successfully.");
	}
}
