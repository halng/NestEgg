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
import com.nestegg.portfolio.management.api.dto.CategoryCreate;
import com.nestegg.portfolio.management.api.dto.CategoryView;
import com.nestegg.portfolio.management.api.entities.Category;
import com.nestegg.portfolio.management.api.repositories.CategoryRepository;
import com.nestegg.portfolio.management.api.services.CategoryService;
import com.nestegg.portfolio.management.api.utils.StringValidators;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CategoryServiceImpl implements CategoryService {
	private static final Logger LOGGER = LoggerFactory.getLogger(CategoryServiceImpl.class);
	private final CategoryRepository categoryRepository;
	private final CommonService commonService;

	public CategoryServiceImpl(CategoryRepository categoryRepository, CommonService commonService) {
		this.categoryRepository = categoryRepository;
		this.commonService = commonService;
	}

	private boolean isInvalid(CategoryCreate req) {
		return StringValidators.isNullOrEmpty(req.name())
				|| StringValidators.isNullOrEmpty(req.description())
				|| this.categoryRepository.existsByName(req.name());
	}

	@Override
	public ApiRes createCategory(CategoryCreate req) {
		LOGGER.info("Creating category with name: {}", req.name());
		if (isInvalid(req)) {
			LOGGER.warn("Category creation failed. Category name or description is null or blank, or category with name {} already exists.", req.name());
			return ApiRes.badRequest("Category name and description must not be null or blank, and category with the same name must not exist");
		}

		Category category = Category.builder()
				.name(req.name()).description(req.description()).build();
		Category newCate = this.categoryRepository.save(category);
		LOGGER.info("Category with id {} created successfully.", newCate.getId());
		return ApiRes.created("Category created successfully", Map.of("id", newCate.getId().toString()));
	}

	@Override
	public ApiRes updateCategory(CategoryCreate req, String id) {
		LOGGER.info("Updating category with id: {}", id);

		if (isInvalid(req)) {
			LOGGER.warn("Category update failed. Category name or description is null or blank, or category with name {} already exists.", req.name());
			return ApiRes.badRequest("Category name and description must not be null or blank, and category with the same name must not exist");
		}

		Category category = this.commonService.getCategory(id);
		category.setName(req.name());
		category.setDescription(req.description());

		Category updatedCate = this.categoryRepository.save(category);
		LOGGER.info("Category with id {} updated successfully.", updatedCate.getId());

		return ApiRes.ok("Category updated successfully", Map.of("id", updatedCate.getId().toString()));
	}

	@Override
	public ApiRes updateStatusCategory(String id) {
		LOGGER.info("Updating status of category with id: {}", id);
		Category category = this.commonService.getCategory(id);
		if (category.getIsDeleted()) {
			return ApiRes.badRequest("Cannot update status of a deleted category");
		}

		category.setIsActive(!category.getIsActive());
		Category updatedCate = this.categoryRepository.save(category);
		LOGGER.info("Category with id {} status updated successfully to {}.", updatedCate.getId(), updatedCate.getIsActive());
		return ApiRes.ok("Category status updated successfully", Map.of("id", updatedCate.getId().toString(), "isActive", updatedCate.getIsActive()));
	}

	@Override
	public ApiRes deleteCategory(String id) {
		LOGGER.info("Deleting category with id: {}", id);
		Category category = this.commonService.getCategory(id);
		if (category.getIsDeleted()) {
			return ApiRes.badRequest("Category is already deleted");
		}
		category.setIsDeleted(true);
		Category deletedCate = this.categoryRepository.save(category);
		LOGGER.info("Category with id {} marked as deleted successfully.", deletedCate.getId());
		return ApiRes.accepted("Category deleted successfully");
	}

	@Override
	public ApiRes getCategoryById(String id) {
		LOGGER.info("Retrieving category with id: {}", id);
		Category category = this.commonService.getCategory(id);

		CategoryView view = new CategoryView(category.getId().toString(), category.getName(), category.getDescription(), category.getIsActive(), category.getIsDeleted());

		return ApiRes.ok("Category retrieved successfully", view);
	}

	@Override
	public ApiRes getAllCategories() {
		//TODO: will be implemented later when the authentication is done
		return null;
	}
}
