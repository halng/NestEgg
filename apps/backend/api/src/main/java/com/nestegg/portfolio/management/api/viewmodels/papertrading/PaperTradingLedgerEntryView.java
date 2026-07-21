package com.nestegg.portfolio.management.api.viewmodels.papertrading;

import java.math.BigDecimal;
import java.time.Instant;

public record PaperTradingLedgerEntryView(Long id, String side, String ticker, long shares, BigDecimal price, BigDecimal total, Instant executedAt) {}
