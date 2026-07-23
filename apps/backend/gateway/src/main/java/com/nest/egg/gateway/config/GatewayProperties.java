package com.nest.egg.gateway.config;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("gateway")
public record GatewayProperties(
        @Valid @NotEmpty List<Route> routes,
        @Valid RateLimit rateLimit,
        @Valid Security security,
        @Valid Timeouts timeouts) {

    public GatewayProperties {
        routes = routes == null ? List.of() : List.copyOf(routes);
        rateLimit = rateLimit == null ? new RateLimit(false, new Policy(1000, 1000), List.of(), new KeyStrategy("ip", null)) : rateLimit;
        security = security == null ? new Security(false, null, null) : security;
        timeouts = timeouts == null ? new Timeouts(Duration.ofSeconds(2), Duration.ofSeconds(10)) : timeouts;
    }

    public record Route(@NotBlank String id, @NotBlank String path, @NotBlank String service,
                        List<String> methods, String host, Map<String, String> headers,
                        boolean publicRoute, List<String> roles, List<String> scopes) {
        public Route {
            methods = methods == null ? List.of() : List.copyOf(methods);
            headers = headers == null ? Map.of() : Map.copyOf(headers);
            roles = roles == null ? List.of() : List.copyOf(roles);
            scopes = scopes == null ? List.of() : List.copyOf(scopes);
        }
    }

    public record RateLimit(boolean enabled, @Valid Policy defaultPolicy,
                            List<RoutePolicy> routes, @Valid KeyStrategy keyStrategy) {
        public RateLimit { routes = routes == null ? List.of() : List.copyOf(routes); }
        public Policy policyFor(String routeId) {
            return routes.stream().filter(p -> p.routeId().equals(routeId)).findFirst()
                    .map(p -> new Policy(p.requests(), p.burstCapacity())).orElse(defaultPolicy);
        }
    }
    public record Policy(@Min(1) int requests, @Min(1) int burstCapacity) {}
    public record RoutePolicy(@NotBlank String routeId, @Min(1) int requests, @Min(1) int burstCapacity) {}
    public record KeyStrategy(@NotBlank String type, String header) {}
    public record Security(boolean enabled, String issuerUri, String audience) {}
    public record Timeouts(Duration connect, Duration request) {}
}
