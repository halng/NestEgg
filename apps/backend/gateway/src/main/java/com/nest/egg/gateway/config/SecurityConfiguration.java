package com.nest.egg.gateway.config;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration(proxyBeanMethods = false)
public class SecurityConfiguration {

    @Bean
    @ConditionalOnProperty(prefix = "gateway.security", name = "enabled", havingValue = "true")
    ReactiveJwtDecoder keycloakJwtDecoder(GatewayProperties properties) {
        var security = properties.security();
        var decoder = NimbusReactiveJwtDecoder.withIssuerLocation(security.issuerUri()).build();
        OAuth2TokenValidator<Jwt> audience = jwt -> security.audience() == null || jwt.getAudience().contains(security.audience())
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Required audience is missing", null));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(security.issuerUri()), audience));
        return decoder;
    }

    @Bean
    SecurityWebFilterChain gatewaySecurity(ServerHttpSecurity http, GatewayProperties properties) {
        http.csrf(ServerHttpSecurity.CsrfSpec::disable)
                .headers(headers -> headers.contentSecurityPolicy(policy -> policy.policyDirectives("default-src 'none'")))
                .authorizeExchange(exchanges -> {
                    exchanges.pathMatchers("/actuator/health/**").permitAll();
                    if (!properties.security().enabled()) {
                        exchanges.anyExchange().permitAll();
                        return;
                    }
                    for (var route : properties.routes()) {
                        if (route.publicRoute()) {
                            exchanges.pathMatchers(route.path()).permitAll();
                        } else if (!route.roles().isEmpty()) {
                            exchanges.pathMatchers(route.path()).hasAnyRole(route.roles().toArray(String[]::new));
                        } else if (!route.scopes().isEmpty()) {
                            exchanges.pathMatchers(route.path()).hasAnyAuthority(route.scopes().stream()
                                    .map(scope -> "SCOPE_" + scope).toArray(String[]::new));
                        } else {
                            exchanges.pathMatchers(route.path()).authenticated();
                        }
                    }
                    exchanges.anyExchange().permitAll();
                });
        if (properties.security().enabled()) {
            http.oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        }
        return http.build();
    }

    private ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter() {
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakAuthoritiesConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    static final class KeycloakAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            var authorities = new ArrayList<GrantedAuthority>();
            String scope = jwt.getClaimAsString("scope");
            if (scope != null) scope.lines().flatMap(line -> java.util.Arrays.stream(line.split(" ")))
                    .filter(value -> !value.isBlank()).map(value -> new SimpleGrantedAuthority("SCOPE_" + value)).forEach(authorities::add);
            var realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.get("roles") instanceof Collection<?> roles) {
                roles.stream().map(String::valueOf).map(role -> new SimpleGrantedAuthority("ROLE_" + role)).forEach(authorities::add);
            }
            return authorities;
        }
    }
}
