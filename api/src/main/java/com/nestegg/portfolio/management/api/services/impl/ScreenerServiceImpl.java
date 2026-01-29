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
import com.nestegg.portfolio.management.api.dto.ScreenerView;
import com.nestegg.portfolio.management.api.entities.Screener;
import com.nestegg.portfolio.management.api.entities.ScreenerCriteria;
import com.nestegg.portfolio.management.api.exceptions.ResourceNotFoundException;
import com.nestegg.portfolio.management.api.repositories.ScreenerRepository;
import com.nestegg.portfolio.management.api.services.ScreenerService;
import com.nestegg.portfolio.management.api.utils.StringValidators;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ScreenerServiceImpl implements ScreenerService {

	private static final Logger LOGGER = LoggerFactory.getLogger(ScreenerServiceImpl.class);

	private final ScreenerRepository screenerRepository;

	public ScreenerServiceImpl(ScreenerRepository screenerRepository) {
		this.screenerRepository = screenerRepository;
	}

	@Override
	@Transactional
	public ApiRes createScreener(ScreenerCreate req) {
		LOGGER.info("Creating new screener with name: {}", req.name());

		if (StringValidators.isNullOrEmpty(req.name()) || StringValidators.isNullOrEmpty(req.userId())) {
			LOGGER.warn("Screener creation failed. Screener name or userId is null or blank.");
			return ApiRes.badRequest("Screener name and userId must not be null or blank");
		}

		if (req.criteria() == null || req.criteria().isEmpty()) {
			LOGGER.warn("Screener creation failed. Criteria list is null or empty.");
			return ApiRes.badRequest("Screener must have at least one criterion");
		}

		if (this.screenerRepository.existsByNameAndUserId(req.name(), req.userId())) {
			LOGGER.warn("Screener creation failed. Screener with name {} already exists for user {}.", req.name(), req.userId());
			return ApiRes.conflict("Screener with the same name already exists for this user");
		}

		var newScreener = Screener.builder()
				.name(req.name())
				.description(req.description())
				.userId(req.userId())
				.build();

		List<ScreenerCriteria> criteriaList = req.criteria().stream()
				.map(c -> ScreenerCriteria.builder()
						.field(c.field())
						.operator(c.operator())
						.value(c.value())
						.screener(newScreener)
						.build())
				.toList();

		newScreener.setCriteria(criteriaList);

		var createdScreener = this.screenerRepository.save(newScreener);
		LOGGER.info("Created new screener name {} id {}", createdScreener.getName(), createdScreener.getId());
		return ApiRes.created(
				"Screener created successfully", Map.of(
						"id", createdScreener.getId()
				)
		);
	}

	@Override
	@Transactional
	public ApiRes updateScreener(ScreenerCreate req, String id) {
		LOGGER.info("Updating screener with id: {}", id);

		Screener screener = screenerRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new ResourceNotFoundException("Screener not found with id: " + id));

		if (!screener.getIsActive()) {
			return ApiRes.badRequest("Cannot update an inactive screener");
		}

		if (StringValidators.isNullOrEmpty(req.name()) || StringValidators.isNullOrEmpty(req.userId())) {
			return ApiRes.badRequest("Screener name and userId must not be null or blank");
		}

		if (req.criteria() == null || req.criteria().isEmpty()) {
			return ApiRes.badRequest("Screener must have at least one criterion");
		}

		// Check if name already exists for this user (excluding current screener)
		boolean nameExists = screenerRepository.findByUserIdAndIsDeletedFalse(req.userId()).stream()
				.anyMatch(s -> s.getName().equals(req.name()) && !s.getId().equals(id));

		if (nameExists) {
			return ApiRes.conflict("Screener with the same name already exists for this user");
		}

		screener.setName(req.name());
		screener.setDescription(req.description());
		screener.setUserId(req.userId());

		// Clear existing criteria and add new ones
		screener.getCriteria().clear();

		List<ScreenerCriteria> criteriaList = req.criteria().stream()
				.map(c -> ScreenerCriteria.builder()
						.field(c.field())
						.operator(c.operator())
						.value(c.value())
						.screener(screener)
						.build())
				.toList();

		screener.setCriteria(criteriaList);

		this.screenerRepository.save(screener);

		LOGGER.info("Updated screener with id: {}", id);
		return ApiRes.ok("Screener updated successfully");
	}

	@Override
	public ApiRes getScreenerById(String id) {
		LOGGER.info("Getting screener with id: {}", id);

		Screener screener = screenerRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new ResourceNotFoundException("Screener not found with id: " + id));

		List<CriteriaDto> criteriaDtos = screener.getCriteria().stream()
				.map(c -> new CriteriaDto(c.getField(), c.getOperator(), c.getValue()))
				.toList();

		ScreenerView view = new ScreenerView(
				screener.getId(),
				screener.getName(),
				screener.getDescription(),
				screener.getUserId(),
				criteriaDtos,
				screener.getCreatedAt(),
				screener.getUpdatedAt(),
				screener.getIsActive(),
				screener.getIsDeleted()
		);

		return ApiRes.ok("Screener found", view);
	}

	@Override
	public ApiRes getScreenersByUserId(String userId) {
		LOGGER.info("Getting screeners for user: {}", userId);

		if (StringValidators.isNullOrEmpty(userId)) {
			return ApiRes.badRequest("UserId must not be null or blank");
		}

		List<Screener> screeners = screenerRepository.findByUserIdAndIsDeletedFalse(userId);

		List<ScreenerView> screenerViews = screeners.stream()
				.map(screener -> {
					List<CriteriaDto> criteriaDtos = screener.getCriteria().stream()
							.map(c -> new CriteriaDto(c.getField(), c.getOperator(), c.getValue()))
							.toList();

					return new ScreenerView(
							screener.getId(),
							screener.getName(),
							screener.getDescription(),
							screener.getUserId(),
							criteriaDtos,
							screener.getCreatedAt(),
							screener.getUpdatedAt(),
							screener.getIsActive(),
							screener.getIsDeleted()
					);
				})
				.toList();

		return ApiRes.ok("Screeners retrieved successfully", screenerViews);
	}

	@Override
	@Transactional
	public ApiRes deleteScreenerById(String id) {
		LOGGER.info("Deleting screener with id: {}", id);

		Screener screener = screenerRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new ResourceNotFoundException("Screener not found with id: " + id));

		screener.setIsDeleted(true);
		this.screenerRepository.save(screener);

		LOGGER.info("Deleted screener with id: {}", id);
		return ApiRes.accepted("Screener deleted successfully");
	}
}
