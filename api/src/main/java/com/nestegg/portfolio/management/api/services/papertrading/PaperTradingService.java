package com.nestegg.portfolio.management.api.services.papertrading;

import com.nestegg.portfolio.management.api.viewmodels.papertrading.PaperTradingOrderRequest;
import com.nestegg.portfolio.management.api.viewmodels.papertrading.PaperTradingSession;

public interface PaperTradingService {
	PaperTradingSession getSession(String userId);
	PaperTradingSession placeOrder(String userId, PaperTradingOrderRequest request);
	PaperTradingSession reset(String userId);
}
