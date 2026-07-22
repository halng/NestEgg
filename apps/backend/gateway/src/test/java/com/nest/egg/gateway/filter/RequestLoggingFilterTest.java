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

import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link RequestLoggingFilter}.
 */
class RequestLoggingFilterTest {

	private final RequestLoggingFilter filter = new RequestLoggingFilter();

	@Test
	void filterOrderIsNegative() {
		assertThat(filter.getOrder()).isLessThan(0);
	}

	@Test
	void filterDelegatesToChain() {
		MockServerHttpRequest request = MockServerHttpRequest.method(HttpMethod.GET, "/test").build();
		MockServerWebExchange exchange = MockServerWebExchange.from(request);
		exchange.getResponse().setStatusCode(HttpStatus.OK);

		GatewayFilterChain chain = mock(GatewayFilterChain.class);
		when(chain.filter(any())).thenReturn(Mono.empty());

		StepVerifier.create(filter.filter(exchange, chain))
				.verifyComplete();
	}

	@Test
	void filterCompletesOnChainError() {
		MockServerHttpRequest request = MockServerHttpRequest.method(HttpMethod.GET, "/test").build();
		MockServerWebExchange exchange = MockServerWebExchange.from(request);

		GatewayFilterChain chain = mock(GatewayFilterChain.class);
		when(chain.filter(any())).thenReturn(Mono.error(new RuntimeException("upstream error")));

		StepVerifier.create(filter.filter(exchange, chain))
				.expectError(RuntimeException.class)
				.verify();
	}
}
