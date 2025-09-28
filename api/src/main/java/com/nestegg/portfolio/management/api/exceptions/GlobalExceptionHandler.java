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

package com.nestegg.portfolio.management.api.exceptions;

import com.nestegg.portfolio.management.api.dto.ApiRes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@Order(1)
	@ExceptionHandler({MethodArgumentNotValidException.class})
	public ApiRes handleValidationException(MethodArgumentNotValidException ex) {
		log.error("Validation error: {}, detail {}", ex.getMessage(), ex.getBindingResult().getAllErrors());
		return ApiRes.badRequest(
				ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage()
		);
	}

	@ExceptionHandler({IllegalArgumentException.class})
	@Order(1)
	public ApiRes handleIllegalArgumentException(IllegalArgumentException ex) {
		log.error("Illegal argument: {}", ex.getMessage(), ex);
		return ApiRes.badRequest(ex.getMessage());
	}

	@ExceptionHandler({ResourceNotFoundException.class})
	@Order(1)
	public ApiRes handleResourceNotFoundException(ResourceNotFoundException ex) {
		log.error("Resource not found: {}", ex.getMessage(), ex);
		return ApiRes.notFound(ex.getMessage());
	}


	@Order(1000)
	@ExceptionHandler(Exception.class)
	public ApiRes handleGenericException(Exception ex) {
		log.error("Generic internal server error: {}", ex.getMessage(), ex);
		return ApiRes
				.internalError("Internal server error occurred. Please contact support if the problem persists.");
	}
}
