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

import java.time.Instant;

/**
 * Standardized error response body returned by the API Gateway for all error conditions.
 *
 * <p>Clients should use the {@code code} field for programmatic error handling.
 * The {@code message} field is a human-readable description for developers.
 * The {@code traceId} field can be used to correlate the error with gateway
 * and downstream service logs and distributed traces.
 *
 * <p>Sensitive implementation details and stack traces are never included.
 */
public class ErrorResponse {

	private final int status;
	private final String code;
	private final String message;
	private final String traceId;
	private final Instant timestamp;

	private ErrorResponse(Builder builder) {
		this.status = builder.status;
		this.code = builder.code;
		this.message = builder.message;
		this.traceId = builder.traceId;
		this.timestamp = builder.timestamp != null ? builder.timestamp : Instant.now();
	}

	public int getStatus() {
		return status;
	}

	public String getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}

	public String getTraceId() {
		return traceId;
	}

	public Instant getTimestamp() {
		return timestamp;
	}

	public static Builder builder() {
		return new Builder();
	}

	public static class Builder {

		private int status;
		private String code;
		private String message;
		private String traceId;
		private Instant timestamp;

		public Builder status(int status) {
			this.status = status;
			return this;
		}

		public Builder code(ErrorCode code) {
			this.code = code.name();
			return this;
		}

		public Builder code(String code) {
			this.code = code;
			return this;
		}

		public Builder message(String message) {
			this.message = message;
			return this;
		}

		public Builder traceId(String traceId) {
			this.traceId = traceId;
			return this;
		}

		public Builder timestamp(Instant timestamp) {
			this.timestamp = timestamp;
			return this;
		}

		public ErrorResponse build() {
			return new ErrorResponse(this);
		}
	}
}
