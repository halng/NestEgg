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

package com.nestegg.portfolio.management.api.services.impl;

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.CriteriaDto;
import com.nestegg.portfolio.management.api.dto.ScreenerCreate;
import com.nestegg.portfolio.management.api.entities.Screener;
import com.nestegg.portfolio.management.api.entities.ScreenerCriteria;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.ScreenerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScreenerServiceImplTest {

	@Mock
	private ScreenerRepository screenerRepository;

	@InjectMocks
	private ScreenerServiceImpl screenerService;

	private ScreenerCreate validScreenerCreate;
	private Screener mockScreener;

	@BeforeEach
	void setUp() {
		List<CriteriaDto> criteria = List.of(
				new CriteriaDto("peRatio", "lessThan", "15"),
				new CriteriaDto("marketCap", "lessThan", "50000000000")
		);

		validScreenerCreate = new ScreenerCreate(
				"Value Stocks",
				"Undervalued stocks",
				"user-123",
				criteria
		);

		mockScreener = Screener.builder()
				.id("test-id-123")
				.name("Value Stocks")
				.description("Undervalued stocks")
				.userId("user-123")
				.build();

		List<ScreenerCriteria> criteriaList = new ArrayList<>();
		criteriaList.add(ScreenerCriteria.builder()
				.id("criteria-1")
				.field("peRatio")
				.operator("lessThan")
				.value("15")
				.screener(mockScreener)
				.build());

		mockScreener.setCriteria(criteriaList);
	}

	@Test
	void createScreener_WithValidData_ShouldReturnCreated() {
		// Arrange
		when(screenerRepository.existsByNameAndUserId(anyString(), anyString())).thenReturn(false);
		when(screenerRepository.save(any(Screener.class))).thenReturn(mockScreener);

		// Act
		ApiRes response = screenerService.createScreener(validScreenerCreate);

		// Assert
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertEquals(true, response.getBody().success());
		verify(screenerRepository, times(1)).save(any(Screener.class));
	}

	@Test
	void createScreener_WithNullName_ShouldReturnBadRequest() {
		// Arrange
		ScreenerCreate invalidScreener = new ScreenerCreate(
				null,
				"Description",
				"user-123",
				List.of(new CriteriaDto("field", "operator", "value"))
		);

		// Act
		ApiRes response = screenerService.createScreener(invalidScreener);

		// Assert
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals(false, response.getBody().success());
		verify(screenerRepository, never()).save(any(Screener.class));
	}

	@Test
	void createScreener_WithEmptyCriteria_ShouldReturnBadRequest() {
		// Arrange
		ScreenerCreate invalidScreener = new ScreenerCreate(
				"Test Screener",
				"Description",
				"user-123",
				List.of()
		);

		// Act
		ApiRes response = screenerService.createScreener(invalidScreener);

		// Assert
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals(false, response.getBody().success());
		assertTrue(response.getBody().message().contains("at least one criterion"));
		verify(screenerRepository, never()).save(any(Screener.class));
	}

	@Test
	void createScreener_WithDuplicateName_ShouldReturnConflict() {
		// Arrange
		when(screenerRepository.existsByNameAndUserId(anyString(), anyString())).thenReturn(true);

		// Act
		ApiRes response = screenerService.createScreener(validScreenerCreate);

		// Assert
		assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
		assertEquals(false, response.getBody().success());
		assertTrue(response.getBody().message().contains("already exists"));
		verify(screenerRepository, never()).save(any(Screener.class));
	}

	@Test
	void getScreenerById_WithValidId_ShouldReturnScreener() {
		// Arrange
		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.of(mockScreener));

		// Act
		ApiRes response = screenerService.getScreenerById("test-id-123");

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(true, response.getBody().success());
		assertNotNull(response.getBody().data());
	}

	@Test
	void getScreenerById_WithInvalidId_ShouldThrowException() {
		// Arrange
		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> {
			screenerService.getScreenerById("invalid-id");
		});
	}

	@Test
	void getScreenersByUserId_WithValidUserId_ShouldReturnList() {
		// Arrange
		when(screenerRepository.findByUserIdAndIsDeletedFalse(anyString())).thenReturn(List.of(mockScreener));

		// Act
		ApiRes response = screenerService.getScreenersByUserId("user-123");

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(true, response.getBody().success());
		assertNotNull(response.getBody().data());
	}

	@Test
	void deleteScreenerById_WithValidId_ShouldMarkAsDeleted() {
		// Arrange
		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.of(mockScreener));
		when(screenerRepository.save(any(Screener.class))).thenReturn(mockScreener);

		// Act
		ApiRes response = screenerService.deleteScreenerById("test-id-123");

		// Assert
		assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
		assertEquals(true, response.getBody().success());
		verify(screenerRepository, times(1)).save(any(Screener.class));
	}

	@Test
	void updateScreener_WithValidData_ShouldUpdateSuccessfully() {
		// Arrange
		mockScreener.setIsActive(true);
		mockScreener.setIsDeleted(false);
		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.of(mockScreener));
		when(screenerRepository.findByUserIdAndIsDeletedFalse(anyString())).thenReturn(List.of());
		when(screenerRepository.save(any(Screener.class))).thenReturn(mockScreener);

		// Act
		ApiRes response = screenerService.updateScreener(validScreenerCreate, "test-id-123");

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(true, response.getBody().success());
		verify(screenerRepository, times(1)).save(any(Screener.class));
	}

	@Test
	void updateScreener_WithInvalidId_ShouldThrowException() {
		// Arrange
		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.empty());

		// Act & Assert
		assertThrows(ResourceNotFoundException.class, () -> {
			screenerService.updateScreener(validScreenerCreate, "invalid-id");
		});
	}

	@Test
	void createScreener_WithInvalidCriteriaFields_ShouldReturnBadRequest() {
		// Arrange - Criterion with empty field
		ScreenerCreate invalidScreener = new ScreenerCreate(
				"Test Screener",
				"Description",
				"user-123",
				List.of(new CriteriaDto("", "operator", "value"))
		);

		// Act
		ApiRes response = screenerService.createScreener(invalidScreener);

		// Assert
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals(false, response.getBody().success());
		assertTrue(response.getBody().message().contains("criterion fields"));
		verify(screenerRepository, never()).save(any(Screener.class));
	}

	@Test
	void updateScreener_WithDifferentUserId_ShouldReturnBadRequest() {
		// Arrange
		mockScreener.setIsActive(true);
		mockScreener.setIsDeleted(false);
		mockScreener.setUserId("user-123");

		ScreenerCreate requestWithDifferentUser = new ScreenerCreate(
				"Updated Name",
				"Updated Description",
				"user-456", // Different user attempting to take ownership
				List.of(new CriteriaDto("field", "operator", "value"))
		);

		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.of(mockScreener));

		// Act
		ApiRes response = screenerService.updateScreener(requestWithDifferentUser, "test-id-123");

		// Assert
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals(false, response.getBody().success());
		assertTrue(response.getBody().message().contains("ownership"));
		verify(screenerRepository, never()).save(any(Screener.class));
	}

	@Test
	void updateScreener_WithSameName_ShouldUpdateSuccessfully() {
		// Arrange - Update with same name should work
		mockScreener.setIsActive(true);
		mockScreener.setIsDeleted(false);
		mockScreener.setName("Value Stocks");
		when(screenerRepository.findByIdAndIsDeletedFalse(anyString())).thenReturn(Optional.of(mockScreener));
		when(screenerRepository.save(any(Screener.class))).thenReturn(mockScreener);

		// Act
		ApiRes response = screenerService.updateScreener(validScreenerCreate, "test-id-123");

		// Assert
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(true, response.getBody().success());
		verify(screenerRepository, times(1)).save(any(Screener.class));
	}
}
