/*
 *    Copyright 2026 Hao Nguyen Tan
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

import com.nestegg.portfolio.management.api.services.TradingAgentService;
import com.nestegg.portfolio.management.api.viewmodels.trading.TradingSuggestionResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@RestController
@RequestMapping("/agents")
public class TradingAgentController {
	private static final String SUGGESTION_EVENT_NAME = "suggestion";

	private final TradingAgentService tradingAgentService;

	public TradingAgentController(TradingAgentService tradingAgentService) {
		this.tradingAgentService = tradingAgentService;
	}

	@GetMapping(value = "/suggestions", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter streamSuggestions(@RequestParam String ticker) throws IOException {
		TradingSuggestionResponse suggestion = tradingAgentService.suggest(ticker);
		SseEmitter emitter = new SseEmitter();
		emitter.send(SseEmitter.event()
				.name(SUGGESTION_EVENT_NAME)
				.data(suggestion, MediaType.APPLICATION_JSON));
		emitter.complete();
		return emitter;
	}
}
