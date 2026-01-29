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

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.WatchlistEntryCreate;

/**
 * Service interface for managing watchlist entries.
 */
public interface WatchlistService {

	/**
	 * Adds a stock to the watchlist.
	 *
	 * @param req the watchlist entry creation request containing ticker and exchange
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes addToWatchlist(WatchlistEntryCreate req);

	/**
	 * Retrieves all active watchlist entries.
	 *
	 * @return an {@link ApiRes} containing the list of watchlist entries
	 */
	ApiRes getAllWatchlistEntries();

	/**
	 * Retrieves a specific watchlist entry by ID.
	 *
	 * @param id the ID of the watchlist entry to retrieve
	 * @return an {@link ApiRes} containing the watchlist entry if found
	 */
	ApiRes getWatchlistEntryById(String id);

	/**
	 * Removes a stock from the watchlist (soft delete).
	 *
	 * @param id the ID of the watchlist entry to remove
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes removeFromWatchlist(String id);
}
