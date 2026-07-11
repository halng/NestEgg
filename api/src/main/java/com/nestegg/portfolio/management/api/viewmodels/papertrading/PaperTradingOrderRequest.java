package com.nestegg.portfolio.management.api.viewmodels.papertrading;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PaperTradingOrderRequest(@NotBlank String ticker, @Min(1) long shares, @Pattern(regexp = "BUY|SELL") String side) {}
