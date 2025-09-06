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

package com.app.portfolio.management.config;

import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class LoggingWebConfig implements WebFilter {
	private final static Logger logger = LoggerFactory.getLogger(LoggingWebConfig.class);

	@Override
	public @NonNull Mono<Void> filter(final ServerWebExchange exchange, final WebFilterChain chain) {
		final long startTime = System.currentTimeMillis();
		final String method = String.valueOf(exchange.getRequest().getMethod());
		final String path = exchange.getRequest().getURI().getPath();

		return chain.filter(exchange)
				.doOnSuccess(aVoid -> {
					final long duration = System.currentTimeMillis() - startTime;

					int status = exchange.getResponse().getStatusCode() != null ? exchange.getResponse().getStatusCode().value() : 0;

					logger.info("Request: {} {} | Status: {} | {} ms", method, path, status, duration);
				})
				.doOnError(error -> {
					long duration = System.currentTimeMillis() - startTime;
					logger.error(
							"Request: {} {} | Failed after {} ms | Error: {}",
							method, path, duration, error.getMessage(), error
					);
				});
	}
}
