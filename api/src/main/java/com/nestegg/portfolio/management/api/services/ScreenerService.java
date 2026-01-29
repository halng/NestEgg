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
import com.nestegg.portfolio.management.api.dto.ScreenerCreate;

/**
 * Service interface for managing screeners.
 */
public interface ScreenerService {

	/**
	 * Creates a new screener.
	 *
	 * @param req the screener creation request containing screener details
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes createScreener(ScreenerCreate req);

	/**
	 * Updates an existing screener.
	 *
	 * @param req the screener update request containing updated screener details
	 * @param id  the ID of the screener to update
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes updateScreener(ScreenerCreate req, String id);

	/**
	 * Retrieves a screener by its ID.
	 *
	 * @param id the ID of the screener to retrieve
	 * @return an {@link ApiRes} containing the screener details if found
	 */
	ApiRes getScreenerById(String id);

	/**
	 * Retrieves all screeners for a user.
	 *
	 * @param userId the ID of the user
	 * @return an {@link ApiRes} containing the list of screeners
	 */
	ApiRes getScreenersByUserId(String userId);

	/**
	 * Marks a screener as deleted by its ID.
	 *
	 * @param id the ID of the screener to delete
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes deleteScreenerById(String id);
}
