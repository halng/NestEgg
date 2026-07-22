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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter;

import java.util.List;

/**
 * Reactive Spring Security configuration for the API Gateway.
 *
 * <p>When {@code gateway.security.enabled=true} (the default), the gateway:
 * <ul>
 *   <li>Validates OAuth 2.0 / OIDC ****** issued by Keycloak.</li>
 *   <li>Enforces route-level RBAC policies defined in {@link GatewayProperties}.</li>
 *   <li>Removes sensitive headers ({@code Authorization}) from downstream requests.</li>
 *   <li>Denies requests with invalid, expired, or missing tokens by default.</li>
 * </ul>
 *
 * <p>When {@code gateway.security.enabled=false}, all requests are permitted —
 * useful for local development without Keycloak.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

	private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

	private final GatewayProperties gatewayProperties;

	public SecurityConfig(GatewayProperties gatewayProperties) {
		this.gatewayProperties = gatewayProperties;
	}

	/**
	 * Security filter chain when gateway security is disabled (open access).
	 * This bean is only created when {@code gateway.security.enabled=false}.
	 */
	@Bean
	@ConditionalOnProperty(prefix = "gateway.security", name = "enabled", havingValue = "false")
	public SecurityWebFilterChain openSecurityFilterChain(ServerHttpSecurity http) {
		log.warn("Gateway security is DISABLED – all requests are permitted. " +
				"Do not use this configuration in production.");
		return http
				.csrf(ServerHttpSecurity.CsrfSpec::disable)
				.authorizeExchange(exchanges -> exchanges.anyExchange().permitAll())
				.build();
	}

	/**
	 * Security filter chain when gateway security is enabled (default).
	 * Validates JWTs and applies route-level authorization rules from configuration.
	 */
	@Bean
	@ConditionalOnProperty(prefix = "gateway.security", name = "enabled", matchIfMissing = true)
	public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
		List<GatewayProperties.Security.RoutePolicy> routePolicies = gatewayProperties.getSecurity().getRoutes();

		http
				.csrf(ServerHttpSecurity.CsrfSpec::disable)
				.headers(headers -> headers
						.frameOptions(frame -> frame.mode(XFrameOptionsServerHttpHeadersWriter.Mode.DENY))
				)
				.authorizeExchange(exchanges -> {
					// Apply route-level policies in declaration order
					for (GatewayProperties.Security.RoutePolicy policy : routePolicies) {
						if (policy.isPermitAll()) {
							exchanges.pathMatchers(policy.getPath()).permitAll();
						} else if (!policy.getRoles().isEmpty()) {
							String[] roles = policy.getRoles().toArray(new String[0]);
							exchanges.pathMatchers(policy.getPath()).hasAnyRole(roles);
						} else if (policy.isAuthenticated()) {
							exchanges.pathMatchers(policy.getPath()).authenticated();
						}
					}
					// Deny-by-default: any unmatched path requires authentication
					exchanges.anyExchange().authenticated();
				})
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

		return http.build();
	}
}
