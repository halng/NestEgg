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

import com.nestegg.portfolio.management.api.dto.AccountCreate;
import com.nestegg.portfolio.management.api.dto.ApiRes;

/**
 * Service interface for managing accounts.
 */
public interface AccountService {

	/**
	 * Creates a new account.
	 *
	 * @param req the account creation request containing account details
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes createAccount(AccountCreate req);

	/**
	 * Updates an existing account.
	 *
	 * @param req the account update request containing updated account details
	 * @param id  the ID of the account to update
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes updateAccount(AccountCreate req, String id);

	/**
	 * Toggles the active status of an account.
	 *
	 * @param id the ID of the account to update
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes updateAccount(String id);

	/**
	 * Retrieves an account by its ID.
	 *
	 * @param id the ID of the account to retrieve
	 * @return an {@link ApiRes} containing the account details if found
	 */
	ApiRes getAccountById(String id);

	/**
	 * Marks an account as deleted by its ID.
	 *
	 * @param id the ID of the account to delete
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes deleteAccountById(String id);
}