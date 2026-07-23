package com.nest.egg.gateway.unit.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.nest.egg.gateway.config.GatewayProperties;
import java.util.List;
import org.junit.jupiter.api.Test;

class GatewayPropertiesTest {
    @Test
    void routePolicyOverridesDefaultPolicy() {
        var rateLimit = new GatewayProperties.RateLimit(true, new GatewayProperties.Policy(100, 120),
                List.of(new GatewayProperties.RoutePolicy("orders", 10, 15)),
                new GatewayProperties.KeyStrategy("ip", null));

        assertThat(rateLimit.policyFor("orders").requests()).isEqualTo(10);
        assertThat(rateLimit.policyFor("users").requests()).isEqualTo(100);
    }

    @Test
    void missingOptionalCollectionsBecomeImmutableEmptyCollections() {
        var route = new GatewayProperties.Route("users", "/users/**", "users", null, null, null, false, null, null);

        assertThat(route.methods()).isEmpty();
        assertThat(route.headers()).isEmpty();
        assertThat(route.roles()).isEmpty();
        assertThat(route.scopes()).isEmpty();
    }
}
