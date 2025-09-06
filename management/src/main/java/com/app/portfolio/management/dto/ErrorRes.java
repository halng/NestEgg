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

package com.app.portfolio.management.dto;

import org.springframework.http.HttpStatus;

public record ErrorRes(String message, int status, String reasons) {
	public static ErrorRes of(HttpStatus status, String message, String reasons) {
		switch (status) {
			case BAD_REQUEST -> {
				return new ErrorRes(message, 400, reasons);
			}
			case UNAUTHORIZED -> {
				return new ErrorRes(message, 401, reasons);
			}
			case FORBIDDEN -> {
				return new ErrorRes(message, 403, reasons);
			}
			case NOT_FOUND -> {
				return new ErrorRes(message, 404, reasons);
			}
			case CONFLICT -> {
				return new ErrorRes(message, 409, reasons);
			}
			case INTERNAL_SERVER_ERROR -> {
				return new ErrorRes(message, 500, reasons);
			}
			default -> {
				return new ErrorRes(message, status.value(), reasons);
			}
		}
	}
}
