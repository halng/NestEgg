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

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link ErrorResponse}.
 */
class ErrorResponseTest {

	@Test
	void builderSetsAllFields() {
		Instant now = Instant.now();
		ErrorResponse response = ErrorResponse.builder()
				.status(429)
				.code(ErrorCode.RATE_LIMIT_EXCEEDED)
				.message("Request rate limit exceeded")
				.traceId("abc123")
				.timestamp(now)
				.build();

		assertThat(response.getStatus()).isEqualTo(429);
		assertThat(response.getCode()).isEqualTo("RATE_LIMIT_EXCEEDED");
		assertThat(response.getMessage()).isEqualTo("Request rate limit exceeded");
		assertThat(response.getTraceId()).isEqualTo("abc123");
		assertThat(response.getTimestamp()).isEqualTo(now);
	}

	@Test
	void builderUsesCurrentTimeWhenTimestampNotSet() {
		Instant before = Instant.now();
		ErrorResponse response = ErrorResponse.builder()
				.status(500)
				.code(ErrorCode.INTERNAL_ERROR)
				.message("Internal error")
				.build();
		Instant after = Instant.now();

		assertThat(response.getTimestamp()).isAfterOrEqualTo(before);
		assertThat(response.getTimestamp()).isBeforeOrEqualTo(after);
	}

	@Test
	void builderAcceptsStringCode() {
		ErrorResponse response = ErrorResponse.builder()
				.status(400)
				.code("CUSTOM_ERROR_CODE")
				.message("Custom error")
				.build();

		assertThat(response.getCode()).isEqualTo("CUSTOM_ERROR_CODE");
	}

	@Test
	void allErrorCodesAreDistinct() {
		ErrorCode[] codes = ErrorCode.values();
		long distinctCount = java.util.Arrays.stream(codes)
				.map(Enum::name)
				.distinct()
				.count();
		assertThat(distinctCount).isEqualTo(codes.length);
	}

	@Test
	void rateLimitResponseHasExpectedFields() {
		ErrorResponse response = ErrorResponse.builder()
				.status(429)
				.code(ErrorCode.RATE_LIMIT_EXCEEDED)
				.message("Request rate limit exceeded")
				.traceId("trace-001")
				.build();

		assertThat(response.getStatus()).isEqualTo(429);
		assertThat(response.getCode()).isEqualTo("RATE_LIMIT_EXCEEDED");
		assertThat(response.getTraceId()).isEqualTo("trace-001");
		assertThat(response.getTimestamp()).isNotNull();
	}

	@Test
	void unauthorizedResponseHasExpectedCode() {
		ErrorResponse response = ErrorResponse.builder()
				.status(401)
				.code(ErrorCode.UNAUTHORIZED)
				.message("Authentication is required")
				.build();

		assertThat(response.getCode()).isEqualTo("UNAUTHORIZED");
		assertThat(response.getStatus()).isEqualTo(401);
	}
}
