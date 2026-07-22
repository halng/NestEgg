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

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

/**
 * Typed configuration properties for the API Gateway.
 * Bound from the {@code gateway} prefix in application configuration.
 */
@ConfigurationProperties(prefix = "gateway")
@Validated
public class GatewayProperties {

	@Valid
	private Security security = new Security();

	@Valid
	private RateLimit rateLimit = new RateLimit();

	public Security getSecurity() {
		return security;
	}

	public void setSecurity(Security security) {
		this.security = security;
	}

	public RateLimit getRateLimit() {
		return rateLimit;
	}

	public void setRateLimit(RateLimit rateLimit) {
		this.rateLimit = rateLimit;
	}

	// -------------------------------------------------------------------------
	// Security
	// -------------------------------------------------------------------------

	public static class Security {

		private boolean enabled = true;

		private String jwkSetUri;

		@Valid
		private List<RoutePolicy> routes = new ArrayList<>();

		public boolean isEnabled() {
			return enabled;
		}

		public void setEnabled(boolean enabled) {
			this.enabled = enabled;
		}

		public String getJwkSetUri() {
			return jwkSetUri;
		}

		public void setJwkSetUri(String jwkSetUri) {
			this.jwkSetUri = jwkSetUri;
		}

		public List<RoutePolicy> getRoutes() {
			return routes;
		}

		public void setRoutes(List<RoutePolicy> routes) {
			this.routes = routes;
		}

		public static class RoutePolicy {

			@NotBlank
			private String path;

			private List<String> roles = new ArrayList<>();

			private List<String> scopes = new ArrayList<>();

			private boolean authenticated = true;

			private boolean permitAll = false;

			public String getPath() {
				return path;
			}

			public void setPath(String path) {
				this.path = path;
			}

			public List<String> getRoles() {
				return roles;
			}

			public void setRoles(List<String> roles) {
				this.roles = roles;
			}

			public List<String> getScopes() {
				return scopes;
			}

			public void setScopes(List<String> scopes) {
				this.scopes = scopes;
			}

			public boolean isAuthenticated() {
				return authenticated;
			}

			public void setAuthenticated(boolean authenticated) {
				this.authenticated = authenticated;
			}

			public boolean isPermitAll() {
				return permitAll;
			}

			public void setPermitAll(boolean permitAll) {
				this.permitAll = permitAll;
			}
		}
	}

	// -------------------------------------------------------------------------
	// Rate Limiting
	// -------------------------------------------------------------------------

	public static class RateLimit {

		private boolean enabled = true;

		@Min(1)
		private int defaultReplenishRate = 100;

		@Min(1)
		private int defaultBurstCapacity = 200;

		private KeyStrategy keyStrategy = KeyStrategy.AUTHENTICATED_USER;

		@Valid
		private List<RoutePolicy> routes = new ArrayList<>();

		public boolean isEnabled() {
			return enabled;
		}

		public void setEnabled(boolean enabled) {
			this.enabled = enabled;
		}

		public int getDefaultReplenishRate() {
			return defaultReplenishRate;
		}

		public void setDefaultReplenishRate(int defaultReplenishRate) {
			this.defaultReplenishRate = defaultReplenishRate;
		}

		public int getDefaultBurstCapacity() {
			return defaultBurstCapacity;
		}

		public void setDefaultBurstCapacity(int defaultBurstCapacity) {
			this.defaultBurstCapacity = defaultBurstCapacity;
		}

		public KeyStrategy getKeyStrategy() {
			return keyStrategy;
		}

		public void setKeyStrategy(KeyStrategy keyStrategy) {
			this.keyStrategy = keyStrategy;
		}

		public List<RoutePolicy> getRoutes() {
			return routes;
		}

		public void setRoutes(List<RoutePolicy> routes) {
			this.routes = routes;
		}

		public enum KeyStrategy {
			AUTHENTICATED_USER,
			CLIENT_IP,
			GLOBAL
		}

		public static class RoutePolicy {

			@NotBlank
			private String routeId;

			@Min(1)
			private int replenishRate;

			@Min(1)
			private int burstCapacity;

			public String getRouteId() {
				return routeId;
			}

			public void setRouteId(String routeId) {
				this.routeId = routeId;
			}

			public int getReplenishRate() {
				return replenishRate;
			}

			public void setReplenishRate(int replenishRate) {
				this.replenishRate = replenishRate;
			}

			public int getBurstCapacity() {
				return burstCapacity;
			}

			public void setBurstCapacity(int burstCapacity) {
				this.burstCapacity = burstCapacity;
			}
		}
	}
}
