package com.nest.egg.gateway.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.nest.egg.gateway.config.GatewayProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayApplicationIntegrationTest {
    @Autowired WebTestClient client;
    @Autowired GatewayProperties properties;

    @Test
    void testProfileLoadsExternalizedRoutesAndSafeDependencySettings() {
        assertThat(properties.routes()).extracting(GatewayProperties.Route::id)
                .containsExactly("user-service", "order-service");
        assertThat(properties.rateLimit().enabled()).isFalse();
        assertThat(properties.security().enabled()).isFalse();
    }

    @Test
    void healthEndpointIsPublic() {
        client.get().uri("/actuator/health").exchange().expectStatus().isOk();
    }

    @Test
    void unknownRouteReturnsNotFound() {
        client.get().uri("/does-not-exist").exchange().expectStatus().isNotFound();
    }
}
