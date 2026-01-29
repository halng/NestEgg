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

package com.nestegg.portfolio.management.api.services;

import com.nestegg.portfolio.management.api.dto.*;

import java.util.List;

/**
 * Service interface for stock screening operations.
 * Provides basic stock listing and filtering, as well as explainability features.
 */
public interface StockScreenerService {
	/**
	 * Retrieves a list of all stocks with optional sorting.
	 * 
	 * @param sortBy Field to sort by (e.g., "symbol", "marketCap")
	 * @param sortOrder Sort direction ("asc" or "desc")
	 * @return ApiRes containing the list of stocks
	 */
	ApiRes getStockList(String sortBy, String sortOrder);
	
	/**
	 * Screens stocks based on provided criteria.
	 * 
	 * @param criteria The screening criteria to apply
	 * @return List of stocks matching the criteria
	 */
	List<StockScreeningResult> screenStocks(ScreeningCriteria criteria);
	
	/**
	 * Screens stocks with explainability - shows why each stock matched or didn't match.
	 * 
	 * @param request The screening request with filter criteria
	 * @return List of stock screening results with explanations
	 */
	List<StockScreenResult> screenStocksWithExplainability(ScreenRequest request);
	
	/**
	 * Retrieves detailed metrics for a specific stock.
	 * 
	 * @param ticker The stock ticker symbol
	 * @return Detailed metrics for the stock
	 */
	StockMetricsDetail getStockMetrics(String ticker);
}
