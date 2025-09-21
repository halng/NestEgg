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

package com.nestegg.portfolio.management.api.services.impl;

import com.nestegg.portfolio.management.api.dto.AccountCreate;
import com.nestegg.portfolio.management.api.dto.AccountView;
import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.entities.Account;
import com.nestegg.portfolio.management.api.entities.AccountType;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.AccountRepository;
import com.nestegg.portfolio.management.api.services.AccountService;
import com.nestegg.portfolio.management.api.utils.StringValidators;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

	private static final Logger LOGGER = LoggerFactory.getLogger(AccountServiceImpl.class);

	private final AccountRepository accountRepository;

	public AccountServiceImpl(AccountRepository accountRepository) {
		this.accountRepository = accountRepository;
	}

	private Account getAccount(String id) {
		UUID uuid = StringValidators.parseUUID(id);
		return this.accountRepository.findById(uuid).orElseThrow(() -> {
			LOGGER.warn("Account with id {} not found", id);
			return new ResourceNotFoundException("Account with id %s not found".formatted(id));
		});
	}

	@Override
	public ApiRes createAccount(AccountCreate req) {
		LOGGER.info("Creating new account with name: {}", req.name());

		if (StringValidators.isNullOrEmpty(req.name()) || StringValidators.isNullOrEmpty(req.branch())) {
			LOGGER.warn("Account creation failed. Account name or branch is null or blank.");
			return ApiRes.badRequest("Account name and branch must not be null or blank");
		}

		if (this.accountRepository.existsByName(req.name())) {
			LOGGER.warn("Account creation failed. Account with name {} already exists.", req.name());
			return ApiRes.conflict("Account with the same name already exists");
		}
		BigInteger balance = req.initialBalance() != null ? req.initialBalance() : BigInteger.valueOf(0);


		var newAccount = Account.builder().name(req.name())
				.type(AccountType.valueOf(req.type()))
				.branch(req.branch())
				.currentBalance(balance)
				.initialBalance(balance).build();

		var createdAccount = this.accountRepository.save(newAccount);
		LOGGER.info("Created new account name {} id {}", createdAccount.getName(), createdAccount.getId());
		return ApiRes.created("Account created successfully");
	}

	@Override
	public ApiRes updateAccount(AccountCreate req, String id) {
		Account account = this.getAccount(id);

		account.setType(AccountType.valueOf(req.type()));
		account.setBranch(req.branch());
		account.setName(req.name());

		this.accountRepository.save(account);

		return ApiRes.ok("Account updated successfully");
	}

	@Override
	public ApiRes getAccountById(String id) {
		Account account = this.getAccount(id);

		AccountView view = new AccountView(
				account.getId().toString(), account.getName(), account.getType().name(),
				account.getBranch(), account.getCurrentBalance()
		);

		return ApiRes.ok("Account existed", view);
	}
}
