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

package com.nest.egg.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.test.StepVerifier;

/**
 * Unit tests for {@link RateLimiterConfig} key resolvers.
 */
class RateLimiterConfigTest {

	private RateLimiterConfig rateLimiterConfig;

	@BeforeEach
	void setUp() {
		GatewayProperties properties = new GatewayProperties();
		rateLimiterConfig = new RateLimiterConfig(properties);
	}

	@Test
	void clientIpKeyResolver_resolvesByRemoteAddress() {
		MockServerHttpRequest request = MockServerHttpRequest
				.get("/test")
				.remoteAddress(new java.net.InetSocketAddress("192.168.1.10", 8080))
				.build();
		MockServerWebExchange exchange = MockServerWebExchange.from(request);

		StepVerifier.create(rateLimiterConfig.clientIpKeyResolver().resolve(exchange))
				.expectNext("192.168.1.10")
				.verifyComplete();
	}

	@Test
	void clientIpKeyResolver_prefersXForwardedForHeader() {
		MockServerHttpRequest request = MockServerHttpRequest
				.get("/test")
				.header("X-Forwarded-For", "10.0.0.1, 172.16.0.1")
				.remoteAddress(new java.net.InetSocketAddress("127.0.0.1", 8080))
				.build();
		MockServerWebExchange exchange = MockServerWebExchange.from(request);

		StepVerifier.create(rateLimiterConfig.clientIpKeyResolver().resolve(exchange))
				.expectNext("10.0.0.1")
				.verifyComplete();
	}

	@Test
	void globalKeyResolver_returnsGlobalKey() {
		MockServerHttpRequest request = MockServerHttpRequest.get("/test").build();
		MockServerWebExchange exchange = MockServerWebExchange.from(request);

		StepVerifier.create(rateLimiterConfig.globalKeyResolver().resolve(exchange))
				.expectNext("global")
				.verifyComplete();
	}

	@Test
	void authenticatedUserKeyResolver_fallsBackToAnonymous() {
		MockServerHttpRequest request = MockServerHttpRequest.get("/test").build();
		MockServerWebExchange exchange = MockServerWebExchange.from(request);

		// No principal set, expect anonymous fallback
		StepVerifier.create(rateLimiterConfig.authenticatedUserKeyResolver().resolve(exchange))
				.expectNext("anonymous")
				.verifyComplete();
	}

	@Test
	void defaultRedisRateLimiter_createdWithDefaultProperties() {
		var rateLimiter = rateLimiterConfig.defaultRedisRateLimiter();
		// RedisRateLimiter is created without exception
		assert rateLimiter != null;
	}
}
