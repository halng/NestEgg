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
import com.nestegg.portfolio.management.api.dto.ScreenerCreate;
import com.nestegg.portfolio.management.api.services.ScreenerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/screeners")
public class ScreenerController {

	private final ScreenerService screenerService;

	public ScreenerController(ScreenerService screenerService) {
		this.screenerService = screenerService;
	}

	@PostMapping()
	public ApiRes createScreener(@Valid @RequestBody ScreenerCreate request) {
		return this.screenerService.createScreener(request);
	}

	@PutMapping("/{screenerId}")
	public ApiRes updateScreener(@Valid @RequestBody ScreenerCreate request, @PathVariable String screenerId) {
		return this.screenerService.updateScreener(request, screenerId);
	}

	@GetMapping("/{screenerId}")
	public ApiRes getScreenerById(@PathVariable String screenerId) {
		return this.screenerService.getScreenerById(screenerId);
	}

	@GetMapping()
	public ApiRes getScreenersByUserId(@RequestParam String userId) {
		return this.screenerService.getScreenersByUserId(userId);
	}

	@DeleteMapping("/{screenerId}")
	public ApiRes deleteScreenerById(@PathVariable String screenerId) {
		return this.screenerService.deleteScreenerById(screenerId);
	}
}
