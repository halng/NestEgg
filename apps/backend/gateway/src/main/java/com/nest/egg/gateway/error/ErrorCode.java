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

/**
 * Application-level error codes returned in {@link ErrorResponse} payloads.
 * These codes are stable identifiers that clients can use for programmatic error handling.
 */
public enum ErrorCode {

	/** The request was valid but the client is not authenticated. */
	UNAUTHORIZED,

	/** The authenticated client does not have permission to access the resource. */
	FORBIDDEN,

	/** The requested route does not match any configured gateway route. */
	ROUTE_NOT_FOUND,

	/** The client has exceeded its configured request rate limit. */
	RATE_LIMIT_EXCEEDED,

	/** The incoming request payload failed validation. */
	INVALID_REQUEST,

	/** The downstream service did not respond within the configured timeout. */
	DOWNSTREAM_TIMEOUT,

	/** The downstream service is unavailable or refused the connection. */
	DOWNSTREAM_UNAVAILABLE,

	/** The circuit breaker for the target service is currently open. */
	CIRCUIT_BREAKER_OPEN,

	/** An unexpected error occurred inside the gateway. */
	INTERNAL_ERROR
}
