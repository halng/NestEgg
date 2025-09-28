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

package com.nestegg.portfolio.management.api.services;

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.CategoryCreate;

/**
 * Service interface for managing categories.
 */
public interface CategoryService {

	/**
	 * Creates a new category.
	 *
	 * @param req the category creation request containing category details
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes createCategory(CategoryCreate req);

	/**
	 * Updates an existing category.
	 *
	 * @param req the category update request containing updated category details
	 * @param id  the ID of the category to update
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes updateCategory(CategoryCreate req, String id);

	/**
	 * Toggles the active status of a category.
	 *
	 * @param id the ID of the category to update
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes updateStatusCategory(String id);

	/**
	 * Marks a category as deleted by its ID.
	 *
	 * @param id the ID of the category to delete
	 * @return an {@link ApiRes} indicating the result of the operation
	 */
	ApiRes deleteCategory(String id);

	/**
	 * Retrieves a category by its ID.
	 *
	 * @param id the ID of the category to retrieve
	 * @return an {@link ApiRes} containing the category details if found
	 */
	ApiRes getCategoryById(String id);

	/**
	 * Retrieves all categories.
	 *
	 * @return an {@link ApiRes} containing a list of all categories
	 */
	ApiRes getAllCategories();
}