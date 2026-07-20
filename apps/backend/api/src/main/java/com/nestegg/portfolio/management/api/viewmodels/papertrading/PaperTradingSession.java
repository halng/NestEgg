package com.nestegg.portfolio.management.api.viewmodels.papertrading;

import java.math.BigDecimal;
import java.util.List;

public record PaperTradingSession(String accountId, BigDecimal startingCapital, BigDecimal cashBalance, BigDecimal totalPortfolioValue, BigDecimal roiPercent, List<PaperTradingMarketTicker> marketWatch, List<PaperTradingHoldingView> holdings, List<PaperTradingLedgerEntryView> ledger, String mentorMessage) {}
