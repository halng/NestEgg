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

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.WatchlistEntryCreate;
import com.nestegg.portfolio.management.api.services.WatchlistService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

	private final WatchlistService watchlistService;

	public WatchlistController(WatchlistService watchlistService) {
		this.watchlistService = watchlistService;
	}

	@PostMapping
	public ApiRes addToWatchlist(@Valid @RequestBody WatchlistEntryCreate request) {
		return this.watchlistService.addToWatchlist(request);
	}

	@GetMapping
	public ApiRes getAllWatchlistEntries() {
		return this.watchlistService.getAllWatchlistEntries();
	}

	@GetMapping("/{id}")
	public ApiRes getWatchlistEntryById(@PathVariable String id) {
		return this.watchlistService.getWatchlistEntryById(id);
	}

	@DeleteMapping("/{id}")
	public ApiRes removeFromWatchlist(@PathVariable String id) {
		return this.watchlistService.removeFromWatchlist(id);
	}
}
