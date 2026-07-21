package com.nestegg.portfolio.management.api.viewmodels.papertrading;

import java.math.BigDecimal;

public record PaperTradingMarketTicker(String ticker, String name, String exchange, String sector, BigDecimal price, BigDecimal changePercent) {}
