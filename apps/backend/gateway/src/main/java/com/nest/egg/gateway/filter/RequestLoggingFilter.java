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

package com.nest.egg.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

/**
 * Global gateway filter that produces structured access logs for every request.
 *
 * <p>Logged fields:
 * <ul>
 *   <li>{@code method} – HTTP method</li>
 *   <li>{@code path} – request path (query string excluded)</li>
 *   <li>{@code statusCode} – HTTP response status code</li>
 *   <li>{@code durationMs} – total request duration in milliseconds</li>
 *   <li>{@code requestId} – unique request identifier from the exchange</li>
 * </ul>
 *
 * <p>Sensitive headers (e.g. {@code Authorization}) are never logged.
 * The {@code traceId} and {@code spanId} are emitted by the OpenTelemetry
 * instrumentation in the MDC, so they appear automatically in structured log output.
 */
@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

	private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

	private static final int ORDER = -2;

	@Override
	public int getOrder() {
		return ORDER;
	}

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		Instant start = Instant.now();
		ServerHttpRequest request = exchange.getRequest();

		return chain.filter(exchange)
				.doFinally(signalType -> {
					ServerHttpResponse response = exchange.getResponse();
					long durationMs = Duration.between(start, Instant.now()).toMillis();
					int statusCode = response.getStatusCode() != null
							? response.getStatusCode().value()
							: 0;

					log.info("method={} path={} status={} duration_ms={} request_id={}",
							request.getMethod(),
							request.getPath().value(),
							statusCode,
							durationMs,
							request.getId());
				});
	}
}
