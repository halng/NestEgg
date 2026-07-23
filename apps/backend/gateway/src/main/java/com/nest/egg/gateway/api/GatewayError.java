package com.nest.egg.gateway.api;

import java.time.Instant;

public record GatewayError(int status, String code, String message, Instant timestamp, String traceId, String requestId) {}
