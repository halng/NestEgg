package com.nest.egg.gateway.config;

import java.util.Optional;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ServerWebExchange;

@Configuration(proxyBeanMethods = false)
public class RoutingConfiguration {

    @Bean
    RouteLocator gatewayRoutes(RouteLocatorBuilder builder, GatewayProperties properties,
                               RedisRateLimiter rateLimiter, KeyResolver gatewayKeyResolver) {
        var routes = builder.routes();
        for (var route : properties.routes()) {
            routes.route(route.id(), spec -> spec
                    .path(route.path())
                    .and().asyncPredicate(exchange -> matchesOptionalPredicates(exchange, route))
                    .filters(filters -> {
                        filters.removeRequestHeader("Authorization")
                                .removeRequestHeader("X-Authenticated-User")
                                .addRequestHeader("X-Gateway-Route", route.id())
                                .circuitBreaker(config -> config.setName(route.service()));
                        if (properties.rateLimit().enabled()) {
                            var policy = properties.rateLimit().policyFor(route.id());
                            filters.requestRateLimiter(config -> config
                                    .setRateLimiter(rateLimiter)
                                    .setKeyResolver(gatewayKeyResolver)
                                    .setStatusCode(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS)
                                    .setDenyEmptyKey(true));
                            rateLimiter.getConfig().put(route.id(), new RedisRateLimiter.Config()
                                    .setReplenishRate(policy.requests())
                                    .setBurstCapacity(policy.burstCapacity())
                                    .setRequestedTokens(1));
                        }
                        return filters;
                    })
                    .uri("lb://" + route.service()));
        }
        return routes.build();
    }

    private boolean matchesOptionalPredicates(ServerWebExchange exchange, GatewayProperties.Route route) {
        if (!route.methods().isEmpty()) {
            String method = Optional.ofNullable(exchange.getRequest().getMethod()).map(HttpMethod::name).orElse("");
            if (route.methods().stream().noneMatch(method::equalsIgnoreCase)) return false;
        }
        if (route.host() != null && !exchange.getRequest().getHeaders().getHost().getHostName().matches(route.host())) return false;
        return route.headers().entrySet().stream().allMatch(entry ->
                entry.getValue().equals(exchange.getRequest().getHeaders().getFirst(entry.getKey())));
    }

    @Bean
    RedisRateLimiter redisRateLimiter(GatewayProperties properties) {
        var policy = properties.rateLimit().defaultPolicy();
        return new RedisRateLimiter(policy.requests(), policy.burstCapacity(), 1);
    }

    @Bean
    KeyResolver gatewayKeyResolver(GatewayProperties properties) {
        return exchange -> switch (properties.rateLimit().keyStrategy().type()) {
            case "authenticated-user" -> exchange.getPrincipal().cast(Authentication.class).map(Authentication::getName).defaultIfEmpty("anonymous");
            case "client" -> exchange.getPrincipal().cast(Authentication.class)
                    .map(auth -> String.valueOf(auth.getPrincipal())).defaultIfEmpty("anonymous");
            case "header" -> reactor.core.publisher.Mono.justOrEmpty(exchange.getRequest().getHeaders()
                    .getFirst(properties.rateLimit().keyStrategy().header())).defaultIfEmpty("missing");
            default -> reactor.core.publisher.Mono.just(Optional.ofNullable(exchange.getRequest().getRemoteAddress())
                    .map(address -> address.getAddress().getHostAddress()).orElse("unknown"));
        };
    }
}
