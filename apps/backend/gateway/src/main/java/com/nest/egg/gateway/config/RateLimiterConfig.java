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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.util.Objects;

/**
 * Configuration for rate-limiting key resolvers used by Spring Cloud Gateway's
 * {@code RequestRateLimiter} filter.
 *
 * <p>Three resolvers are registered:
 * <ul>
 *   <li>{@code authenticatedUserKeyResolver} – resolves the rate-limit key from the
 *       authenticated principal name (user ID from JWT).  Falls back to
 *       {@code "anonymous"} for unauthenticated requests.</li>
 *   <li>{@code clientIpKeyResolver} – resolves the key from the client's remote IP.</li>
 *   <li>{@code globalKeyResolver} – uses a single fixed key, enforcing a
 *       gateway-wide limit.</li>
 * </ul>
 *
 * <p>The {@code defaultRedisRateLimiter} bean applies the replenish-rate and
 * burst-capacity values from {@link GatewayProperties}.
 */
@Configuration
public class RateLimiterConfig {

	private static final Logger log = LoggerFactory.getLogger(RateLimiterConfig.class);

	private static final String ANONYMOUS_KEY = "anonymous";
	private static final String GLOBAL_KEY = "global";

	private final GatewayProperties gatewayProperties;

	public RateLimiterConfig(GatewayProperties gatewayProperties) {
		this.gatewayProperties = gatewayProperties;
	}

	/**
	 * Primary key resolver: resolves the rate-limit key from the authenticated
	 * principal name (JWT subject claim).  Falls back to {@code "anonymous"}.
	 */
	@Bean
	@Primary
	public KeyResolver authenticatedUserKeyResolver() {
		return exchange -> exchange.getPrincipal()
				.map(principal -> {
					String name = principal.getName();
					log.debug("Rate-limit key (user): {}", name);
					return name;
				})
				.switchIfEmpty(Mono.just(ANONYMOUS_KEY));
	}

	/**
	 * Key resolver based on the originating client IP address.
	 * Supports common proxy headers ({@code X-Forwarded-For}).
	 */
	@Bean
	public KeyResolver clientIpKeyResolver() {
		return exchange -> {
			String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
			String ip;
			if (forwardedFor != null && !forwardedFor.isBlank()) {
				ip = forwardedFor.split(",")[0].trim();
			} else {
				ip = Objects.requireNonNull(
						exchange.getRequest().getRemoteAddress(),
						"Remote address must not be null"
				).getAddress().getHostAddress();
			}
			log.debug("Rate-limit key (IP): {}", ip);
			return Mono.just(ip);
		};
	}

	/**
	 * Key resolver that applies a single global rate limit across all callers.
	 */
	@Bean
	public KeyResolver globalKeyResolver() {
		return exchange -> Mono.just(GLOBAL_KEY);
	}

	/**
	 * Default {@link RedisRateLimiter} bean using the replenish-rate and
	 * burst-capacity from {@link GatewayProperties}.
	 */
	@Bean
	public RedisRateLimiter defaultRedisRateLimiter() {
		GatewayProperties.RateLimit rl = gatewayProperties.getRateLimit();
		return new RedisRateLimiter(rl.getDefaultReplenishRate(), rl.getDefaultBurstCapacity());
	}
}
