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

package com.nest.egg.gateway.error;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.micrometer.tracing.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.support.NotFoundException;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebExceptionHandler;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Global exception handler that intercepts all unhandled exceptions from the
 * Spring Cloud Gateway pipeline and returns a consistent {@link ErrorResponse} JSON body.
 *
 * <p>Handles the following error categories:
 * <ul>
 *   <li>Authentication failures → {@code 401 Unauthorized}</li>
 *   <li>Authorization failures → {@code 403 Forbidden}</li>
 *   <li>Route not found → {@code 404 Not Found}</li>
 *   <li>Rate limit exceeded → {@code 429 Too Many Requests}</li>
 *   <li>Downstream timeout → {@code 504 Gateway Timeout}</li>
 *   <li>Downstream unavailable → {@code 503 Service Unavailable}</li>
 *   <li>All other errors → {@code 500 Internal Server Error}</li>
 * </ul>
 *
 * <p>Stack traces and implementation details are never exposed to callers.
 * The {@code traceId} field in the response body links the error to distributed traces
 * and structured logs.
 */
@Component
@Order(-1)
public class GlobalErrorWebExceptionHandler implements WebExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalErrorWebExceptionHandler.class);

	private final ObjectMapper objectMapper;
	private final Tracer tracer;

	public GlobalErrorWebExceptionHandler(@Autowired(required = false) Tracer tracer) {
		this.objectMapper = new ObjectMapper()
				.registerModule(new JavaTimeModule())
				.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		this.tracer = tracer;
	}

	@Override
	public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
		HttpStatus status = resolveStatus(ex);
		ErrorCode code = resolveCode(ex);
		String message = resolveMessage(ex, status);
		String traceId = resolveTraceId(exchange);

		log.error("Gateway error [status={}, code={}, traceId={}]: {}", status, code, traceId,
				sanitizeMessage(ex.getMessage()), resolveLogThrowable(ex));

		ErrorResponse errorResponse = ErrorResponse.builder()
				.status(status.value())
				.code(code)
				.message(message)
				.traceId(traceId)
				.build();

		return writeResponse(exchange, status, errorResponse);
	}

	private HttpStatus resolveStatus(Throwable ex) {
		if (ex instanceof AuthenticationException) {
			return HttpStatus.UNAUTHORIZED;
		}
		if (ex instanceof AccessDeniedException) {
			return HttpStatus.FORBIDDEN;
		}
		if (ex instanceof NotFoundException) {
			return HttpStatus.NOT_FOUND;
		}
		if (ex instanceof ResponseStatusException rse) {
			HttpStatus resolved = HttpStatus.resolve(rse.getStatusCode().value());
			return resolved != null ? resolved : HttpStatus.INTERNAL_SERVER_ERROR;
		}
		if (isTimeoutException(ex)) {
			return HttpStatus.GATEWAY_TIMEOUT;
		}
		if (isConnectionException(ex)) {
			return HttpStatus.SERVICE_UNAVAILABLE;
		}
		return HttpStatus.INTERNAL_SERVER_ERROR;
	}

	private ErrorCode resolveCode(Throwable ex) {
		if (ex instanceof AuthenticationException) {
			return ErrorCode.UNAUTHORIZED;
		}
		if (ex instanceof AccessDeniedException) {
			return ErrorCode.FORBIDDEN;
		}
		if (ex instanceof NotFoundException) {
			return ErrorCode.ROUTE_NOT_FOUND;
		}
		if (ex instanceof ResponseStatusException rse) {
			int value = rse.getStatusCode().value();
			if (value == 429) {
				return ErrorCode.RATE_LIMIT_EXCEEDED;
			}
			if (value == 503) {
				return ErrorCode.DOWNSTREAM_UNAVAILABLE;
			}
			if (value == 504) {
				return ErrorCode.DOWNSTREAM_TIMEOUT;
			}
		}
		if (isTimeoutException(ex)) {
			return ErrorCode.DOWNSTREAM_TIMEOUT;
		}
		if (isConnectionException(ex)) {
			return ErrorCode.DOWNSTREAM_UNAVAILABLE;
		}
		return ErrorCode.INTERNAL_ERROR;
	}

	private String resolveMessage(Throwable ex, HttpStatus status) {
		return switch (status) {
			case UNAUTHORIZED -> "Authentication is required to access this resource";
			case FORBIDDEN -> "You do not have permission to access this resource";
			case NOT_FOUND -> "The requested resource or route was not found";
			case TOO_MANY_REQUESTS -> "Request rate limit exceeded";
			case GATEWAY_TIMEOUT -> "The upstream service did not respond in time";
			case SERVICE_UNAVAILABLE -> "The upstream service is currently unavailable";
			default -> "An internal gateway error occurred";
		};
	}

	private String resolveTraceId(ServerWebExchange exchange) {
		if (tracer != null && tracer.currentSpan() != null) {
			return tracer.currentSpan().context().traceId();
		}
		return exchange.getRequest().getId();
	}

	private Mono<Void> writeResponse(ServerWebExchange exchange, HttpStatus status, ErrorResponse errorResponse) {
		exchange.getResponse().setStatusCode(status);
		exchange.getResponse().getHeaders().set(HttpHeaders.CONTENT_TYPE,
				MediaType.APPLICATION_JSON_VALUE);

		byte[] bytes;
		try {
			bytes = objectMapper.writeValueAsBytes(errorResponse);
		} catch (JsonProcessingException e) {
			bytes = ("{\"status\":500,\"code\":\"INTERNAL_ERROR\",\"message\":\"An internal gateway error occurred\"}")
					.getBytes(StandardCharsets.UTF_8);
		}

		DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
		return exchange.getResponse().writeWith(Mono.just(buffer));
	}

	private boolean isTimeoutException(Throwable ex) {
		String name = ex.getClass().getName();
		return name.contains("TimeoutException") || name.contains("ReadTimeoutException")
				|| name.contains("ConnectTimeoutException");
	}

	private boolean isConnectionException(Throwable ex) {
		String name = ex.getClass().getName();
		return name.contains("ConnectException") || name.contains("ConnectionRefusedException")
				|| name.contains("UnknownHostException");
	}

	private String sanitizeMessage(String message) {
		if (message == null) {
			return "(no message)";
		}
		// Avoid logging potentially sensitive token or credential content
		if (message.toLowerCase().contains("token") || message.toLowerCase().contains("credential")
				|| message.toLowerCase().contains("secret") || message.toLowerCase().contains("password")) {
			return "(sanitized)";
		}
		return message;
	}

	private Throwable resolveLogThrowable(Throwable ex) {
		// Log full stack trace only for unexpected internal errors
		if (ex instanceof AuthenticationException || ex instanceof AccessDeniedException
				|| ex instanceof NotFoundException || ex instanceof ResponseStatusException) {
			return null;
		}
		return ex;
	}
}
