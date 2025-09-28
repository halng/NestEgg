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

import com.nestegg.portfolio.management.api.entities.Account;
import com.nestegg.portfolio.management.api.entities.Category;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.AccountRepository;
import com.nestegg.portfolio.management.api.repositories.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CommonService {
	private static final Logger LOGGER = LoggerFactory.getLogger(CommonService.class);

	private final AccountRepository accountRepository;
	private final CategoryRepository categoryRepository;

	public CommonService(AccountRepository accountRepository, CategoryRepository categoryRepository) {
		this.accountRepository = accountRepository;
		this.categoryRepository = categoryRepository;
	}

	private UUID fromString(String id) {
		try {
			return UUID.fromString(id);
		} catch (IllegalArgumentException e) {
			LOGGER.error("Invalid UUID string: {}", id);
			throw new ResourceNotFoundException("Invalid UUID string: %s".formatted(id));
		}
	}

	protected Account getAccount(String id) {
		return this.accountRepository.findById(fromString(id)).orElseThrow(() -> {
			LOGGER.debug("Account with id {} not found", id);
			return new ResourceNotFoundException("Account with id %s not found".formatted(id));
		});
	}

	protected Category getCategory(String id) {
		return this.categoryRepository.findById(fromString(id)).orElseThrow(() -> {
			LOGGER.debug("Category with id {} not found", id);
			return new ResourceNotFoundException("Category with id %s not found".formatted(id));
		});
	}

}
