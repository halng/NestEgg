package com.nest.egg.gateway.api;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.webflux.error.ErrorWebExceptionHandler;
import org.springframework.cloud.gateway.support.NotFoundException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GatewayErrorWebExceptionHandler implements ErrorWebExceptionHandler {
    private final ObjectMapper mapper;
    private final MeterRegistry metrics;

    public GatewayErrorWebExceptionHandler(ObjectMapper mapper, MeterRegistry metrics) {
        this.mapper = mapper;
        this.metrics = metrics;
    }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable error) {
        HttpStatus status = error instanceof NotFoundException ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR;
        String code = status == HttpStatus.SERVICE_UNAVAILABLE ? "DOWNSTREAM_UNAVAILABLE" : "INTERNAL_GATEWAY_ERROR";
        metrics.counter("gateway.errors", "code", code).increment();
        var response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String requestId = exchange.getRequest().getId();
        String traceId = exchange.getRequest().getHeaders().getFirst("traceparent");
        try {
            byte[] body = mapper.writeValueAsString(new GatewayError(status.value(), code,
                    status == HttpStatus.SERVICE_UNAVAILABLE ? "Downstream service unavailable" : "An internal gateway error occurred",
                    Instant.now(), traceId, requestId)).getBytes(StandardCharsets.UTF_8);
            return response.writeWith(Mono.just(response.bufferFactory().wrap(body)));
        } catch (JsonProcessingException ignored) {
            return response.setComplete();
        }
    }
}
