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

package com.nestegg.portfolio.management.api.controllers;

import com.nestegg.portfolio.management.api.dto.AccountCreate;
import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.services.AccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
public class AccountController {

	private final AccountService accountService;

	public AccountController(AccountService accountService) {
		this.accountService = accountService;
	}

	@PostMapping()
	public ApiRes createAccount(@Valid @RequestBody AccountCreate request) {
		return this.accountService.createAccount(request);
	}

	@PutMapping("/{accountId}")
	public ApiRes updateAccount(@Valid @RequestBody AccountCreate request, @PathVariable String accountId) {
		return this.accountService.updateAccount(request, accountId);
	}

	@PatchMapping("/{accountId}")
	public ApiRes updateAccountStatus(@PathVariable String accountId) {
		return this.accountService.updateAccount(accountId);
	}

	@GetMapping("/{accountId}")
	public ApiRes getAccountById(@PathVariable String accountId) {
		return this.accountService.getAccountById(accountId);
	}

	@DeleteMapping("/{accountId}")
	public ApiRes deleteAccountById(@PathVariable String accountId) {
		return this.accountService.deleteAccountById(accountId);
	}
}
