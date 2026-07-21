package com.nestegg.portfolio.management.api.viewmodels.papertrading;

import java.math.BigDecimal;

public record PaperTradingHoldingView(String ticker, long shares, BigDecimal averageCost, BigDecimal currentPrice, BigDecimal marketValue, BigDecimal unrealizedPnl, String sector) {}
