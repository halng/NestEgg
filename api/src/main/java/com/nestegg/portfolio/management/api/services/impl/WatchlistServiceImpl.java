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

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.WatchlistEntryCreate;
import com.nestegg.portfolio.management.api.dto.WatchlistEntryView;
import com.nestegg.portfolio.management.api.entities.WatchlistEntry;
import com.nestegg.portfolio.management.api.repositories.WatchlistRepository;
import com.nestegg.portfolio.management.api.services.WatchlistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WatchlistServiceImpl implements WatchlistService {

	private final WatchlistRepository watchlistRepository;

	public WatchlistServiceImpl(WatchlistRepository watchlistRepository) {
		this.watchlistRepository = watchlistRepository;
	}

	@Override
	@Transactional
	public ApiRes addToWatchlist(WatchlistEntryCreate req) {
		log.info("Adding stock to watchlist: ticker={}, exchange={}", req.ticker(), req.exchange());

		// AC-2: Check for duplicate active entry
		if (watchlistRepository.existsByTickerAndExchangeAndIsDeletedFalse(req.ticker(), req.exchange())) {
			log.warn("Stock already exists in watchlist: ticker={}, exchange={}", req.ticker(), req.exchange());
			return ApiRes.conflict("Stock is already in the watchlist");
		}

		// Check if there's a soft-deleted entry that can be reactivated
		Optional<WatchlistEntry> deletedEntry = watchlistRepository.findByTickerAndExchange(req.ticker(), req.exchange());
		if (deletedEntry.isPresent() && deletedEntry.get().getIsDeleted()) {
			// Reactivate the existing entry
			WatchlistEntry entry = deletedEntry.get();
			entry.setIsDeleted(false);
			entry.setIsActive(true);
			entry.setSnapshotTimestamp(Instant.now()); // Update snapshot timestamp
			WatchlistEntry savedEntry = watchlistRepository.save(entry);
			log.info("Stock reactivated in watchlist: id={}", savedEntry.getId());

			WatchlistEntryView view = convertToView(savedEntry);
			return ApiRes.created("Stock added to watchlist successfully", view);
		}

		// AC-3: Create new entry with ticker, exchange, and snapshot timestamp
		WatchlistEntry entry = WatchlistEntry.builder()
			.ticker(req.ticker())
			.exchange(req.exchange())
			.snapshotTimestamp(Instant.now())
			.build();

		WatchlistEntry savedEntry = watchlistRepository.save(entry);
		log.info("Stock added to watchlist successfully: id={}", savedEntry.getId());

		WatchlistEntryView view = convertToView(savedEntry);
		return ApiRes.created("Stock added to watchlist successfully", view);
	}

	@Override
	@Transactional(readOnly = true)
	public ApiRes getAllWatchlistEntries() {
		log.info("Retrieving all watchlist entries");

		List<WatchlistEntry> entries = watchlistRepository.findAllByIsDeletedFalse();
		List<WatchlistEntryView> views = entries.stream()
			.map(this::convertToView)
			.collect(Collectors.toList());

		log.info("Retrieved {} watchlist entries", views.size());
		return ApiRes.ok("Watchlist entries retrieved successfully", views);
	}

	@Override
	@Transactional(readOnly = true)
	public ApiRes getWatchlistEntryById(String id) {
		log.info("Retrieving watchlist entry: id={}", id);

		return watchlistRepository.findById(id)
			.filter(entry -> !entry.getIsDeleted())
			.map(entry -> {
				WatchlistEntryView view = convertToView(entry);
				return ApiRes.ok("Watchlist entry retrieved successfully", view);
			})
			.orElseGet(() -> {
				log.warn("Watchlist entry not found: id={}", id);
				return ApiRes.notFound("Watchlist entry not found");
			});
	}

	@Override
	@Transactional
	public ApiRes removeFromWatchlist(String id) {
		log.info("Removing stock from watchlist: id={}", id);
		
		// TODO: Add authorization check to verify the user owns this watchlist entry
		// Currently missing user context - need to implement Spring Security or similar

		return watchlistRepository.findById(id)
			.filter(entry -> !entry.getIsDeleted())
			.map(entry -> {
				// AC-4: Soft delete - does not affect market data or screener rules
				entry.setIsDeleted(true);
				entry.setIsActive(false);
				watchlistRepository.save(entry);
				log.info("Stock removed from watchlist successfully: id={}", id);
				return ApiRes.ok("Stock removed from watchlist successfully");
			})
			.orElseGet(() -> {
				log.warn("Watchlist entry not found or already deleted: id={}", id);
				return ApiRes.notFound("Watchlist entry not found");
			});
	}

	private WatchlistEntryView convertToView(WatchlistEntry entry) {
		return WatchlistEntryView.builder()
			.id(entry.getId())
			.ticker(entry.getTicker())
			.exchange(entry.getExchange())
			.snapshotTimestamp(entry.getSnapshotTimestamp())
			.isActive(entry.getIsActive())
			.isDeleted(entry.getIsDeleted())
			.build();
	}
}
