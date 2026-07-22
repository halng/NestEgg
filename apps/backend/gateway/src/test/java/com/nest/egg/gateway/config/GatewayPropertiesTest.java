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

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link GatewayProperties}.
 */
class GatewayPropertiesTest {

	@Test
	void defaultSecurityEnabledIsTrue() {
		GatewayProperties props = new GatewayProperties();
		assertThat(props.getSecurity().isEnabled()).isTrue();
	}

	@Test
	void defaultRateLimitEnabledIsTrue() {
		GatewayProperties props = new GatewayProperties();
		assertThat(props.getRateLimit().isEnabled()).isTrue();
	}

	@Test
	void defaultRateLimitValues() {
		GatewayProperties props = new GatewayProperties();
		assertThat(props.getRateLimit().getDefaultReplenishRate()).isEqualTo(100);
		assertThat(props.getRateLimit().getDefaultBurstCapacity()).isEqualTo(200);
	}

	@Test
	void defaultKeyStrategyIsAuthenticatedUser() {
		GatewayProperties props = new GatewayProperties();
		assertThat(props.getRateLimit().getKeyStrategy())
				.isEqualTo(GatewayProperties.RateLimit.KeyStrategy.AUTHENTICATED_USER);
	}

	@Test
	void securityRoutePolicyPermitAllOverridesAuthenticated() {
		GatewayProperties.Security.RoutePolicy policy = new GatewayProperties.Security.RoutePolicy();
		policy.setPath("/health/**");
		policy.setPermitAll(true);

		assertThat(policy.isPermitAll()).isTrue();
		assertThat(policy.getPath()).isEqualTo("/health/**");
	}

	@Test
	void securityRoutePolicyWithRoles() {
		GatewayProperties.Security.RoutePolicy policy = new GatewayProperties.Security.RoutePolicy();
		policy.setPath("/admin/**");
		policy.setRoles(List.of("ADMIN", "SUPERUSER"));

		assertThat(policy.getRoles()).containsExactly("ADMIN", "SUPERUSER");
		assertThat(policy.isAuthenticated()).isTrue();
	}

	@Test
	void rateLimitRoutePolicyValues() {
		GatewayProperties.RateLimit.RoutePolicy routePolicy = new GatewayProperties.RateLimit.RoutePolicy();
		routePolicy.setRouteId("order-service");
		routePolicy.setReplenishRate(50);
		routePolicy.setBurstCapacity(100);

		assertThat(routePolicy.getRouteId()).isEqualTo("order-service");
		assertThat(routePolicy.getReplenishRate()).isEqualTo(50);
		assertThat(routePolicy.getBurstCapacity()).isEqualTo(100);
	}

	@Test
	void securityDisabledCanBeSet() {
		GatewayProperties props = new GatewayProperties();
		props.getSecurity().setEnabled(false);
		assertThat(props.getSecurity().isEnabled()).isFalse();
	}
}
