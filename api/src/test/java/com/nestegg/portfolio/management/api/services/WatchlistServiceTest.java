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
import com.nestegg.portfolio.management.api.dto.WatchlistEntryView;
import com.nestegg.portfolio.management.api.entities.WatchlistEntry;
import com.nestegg.portfolio.management.api.repositories.WatchlistRepository;
import com.nestegg.portfolio.management.api.services.impl.WatchlistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WatchlistServiceTest {

	@Mock
	private WatchlistRepository watchlistRepository;

	private WatchlistService watchlistService;

	@BeforeEach
	void setUp() {
		watchlistService = new WatchlistServiceImpl(watchlistRepository);
	}

	@Test
	void addToWatchlist_Success() {
		// Given
		WatchlistEntryCreate request = WatchlistEntryCreate.builder()
			.ticker("AAPL")
			.exchange("NASDAQ")
			.build();

		WatchlistEntry savedEntry = WatchlistEntry.builder()
			.id("test-id")
			.ticker("AAPL")
			.exchange("NASDAQ")
			.snapshotTimestamp(Instant.now())
			.build();
		savedEntry.setIsActive(true);
		savedEntry.setIsDeleted(false);

		when(watchlistRepository.existsByTickerAndExchangeAndIsDeletedFalse("AAPL", "NASDAQ")).thenReturn(false);
		when(watchlistRepository.findByTickerAndExchange("AAPL", "NASDAQ")).thenReturn(Optional.empty());
		when(watchlistRepository.save(any(WatchlistEntry.class))).thenReturn(savedEntry);

		// When
		ApiRes response = watchlistService.addToWatchlist(request);

		// Then - AC-1: User can add a stock to watchlist
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getBody().isSuccess());
		assertEquals(201, response.getBody().status());
		
		WatchlistEntryView view = (WatchlistEntryView) response.getBody().data();
		assertNotNull(view);
		assertEquals("AAPL", view.ticker());
		assertEquals("NASDAQ", view.exchange());
		assertNotNull(view.snapshotTimestamp()); // AC-3: Snapshot reference timestamp

		verify(watchlistRepository, times(1)).save(any(WatchlistEntry.class));
	}

	@Test
	void addToWatchlist_Duplicate_Conflict() {
		// Given
		WatchlistEntryCreate request = WatchlistEntryCreate.builder()
			.ticker("AAPL")
			.exchange("NASDAQ")
			.build();

		when(watchlistRepository.existsByTickerAndExchangeAndIsDeletedFalse("AAPL", "NASDAQ")).thenReturn(true);

		// When
		ApiRes response = watchlistService.addToWatchlist(request);

		// Then - AC-2: Stock cannot be duplicated
		assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
		assertNotNull(response.getBody());
		assertFalse(response.getBody().isSuccess());
		assertEquals(409, response.getBody().status());
		assertTrue(response.getBody().message().contains("already in the watchlist"));

		verify(watchlistRepository, never()).save(any(WatchlistEntry.class));
	}

	@Test
	void addToWatchlist_ReactivateDeletedEntry() {
		// Given
		WatchlistEntryCreate request = WatchlistEntryCreate.builder()
			.ticker("AAPL")
			.exchange("NASDAQ")
			.build();

		WatchlistEntry deletedEntry = WatchlistEntry.builder()
			.id("test-id")
			.ticker("AAPL")
			.exchange("NASDAQ")
			.snapshotTimestamp(Instant.now().minusSeconds(3600))
			.build();
		deletedEntry.setIsActive(false);
		deletedEntry.setIsDeleted(true);

		when(watchlistRepository.existsByTickerAndExchangeAndIsDeletedFalse("AAPL", "NASDAQ")).thenReturn(false);
		when(watchlistRepository.findByTickerAndExchange("AAPL", "NASDAQ")).thenReturn(Optional.of(deletedEntry));
		when(watchlistRepository.save(any(WatchlistEntry.class))).thenReturn(deletedEntry);

		// When
		ApiRes response = watchlistService.addToWatchlist(request);

		// Then - Should reactivate the deleted entry
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getBody().isSuccess());

		verify(watchlistRepository, times(1)).save(argThat(entry ->
			!entry.getIsDeleted() && entry.getIsActive() && entry.getTicker().equals("AAPL")
		));
	}

	@Test
	void getAllWatchlistEntries_Success() {
		// Given
		WatchlistEntry entry1 = createTestEntry("1", "AAPL", "NASDAQ");
		WatchlistEntry entry2 = createTestEntry("2", "GOOGL", "NASDAQ");

		when(watchlistRepository.findAllByIsDeletedFalse()).thenReturn(Arrays.asList(entry1, entry2));

		// When
		ApiRes response = watchlistService.getAllWatchlistEntries();

		// Then
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getBody().isSuccess());
		
		@SuppressWarnings("unchecked")
		List<WatchlistEntryView> views = (List<WatchlistEntryView>) response.getBody().data();
		assertEquals(2, views.size());
		
		// AC-3: Verify entries retain ticker, exchange, and timestamp
		assertEquals("AAPL", views.get(0).ticker());
		assertEquals("NASDAQ", views.get(0).exchange());
		assertNotNull(views.get(0).snapshotTimestamp());
	}

	@Test
	void getWatchlistEntryById_Success() {
		// Given
		WatchlistEntry entry = createTestEntry("test-id", "AAPL", "NASDAQ");

		when(watchlistRepository.findById("test-id")).thenReturn(Optional.of(entry));

		// When
		ApiRes response = watchlistService.getWatchlistEntryById("test-id");

		// Then
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getBody().isSuccess());
		
		WatchlistEntryView view = (WatchlistEntryView) response.getBody().data();
		assertNotNull(view);
		assertEquals("AAPL", view.ticker());
		assertEquals("NASDAQ", view.exchange());
	}

	@Test
	void getWatchlistEntryById_NotFound() {
		// Given
		when(watchlistRepository.findById(anyString())).thenReturn(Optional.empty());

		// When
		ApiRes response = watchlistService.getWatchlistEntryById("non-existent");

		// Then
		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
		assertNotNull(response.getBody());
		assertFalse(response.getBody().isSuccess());
	}

	@Test
	void removeFromWatchlist_Success() {
		// Given
		WatchlistEntry entry = createTestEntry("test-id", "AAPL", "NASDAQ");

		when(watchlistRepository.findById("test-id")).thenReturn(Optional.of(entry));
		when(watchlistRepository.save(any(WatchlistEntry.class))).thenReturn(entry);

		// When
		ApiRes response = watchlistService.removeFromWatchlist("test-id");

		// Then - AC-4: Removing does not affect market data or screener rules (soft delete)
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getBody().isSuccess());

		verify(watchlistRepository, times(1)).save(argThat(savedEntry -> 
			savedEntry.getIsDeleted() && !savedEntry.getIsActive()
		));
	}

	@Test
	void removeFromWatchlist_NotFound() {
		// Given
		when(watchlistRepository.findById(anyString())).thenReturn(Optional.empty());

		// When
		ApiRes response = watchlistService.removeFromWatchlist("non-existent");

		// Then
		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
		assertNotNull(response.getBody());
		assertFalse(response.getBody().isSuccess());

		verify(watchlistRepository, never()).save(any(WatchlistEntry.class));
	}

	private WatchlistEntry createTestEntry(String id, String ticker, String exchange) {
		WatchlistEntry entry = WatchlistEntry.builder()
			.id(id)
			.ticker(ticker)
			.exchange(exchange)
			.snapshotTimestamp(Instant.now())
			.build();
		entry.setIsActive(true);
		entry.setIsDeleted(false);
		return entry;
	}
}
