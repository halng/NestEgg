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

package com.nestegg.portfolio.management.api.controllers;

import com.nestegg.portfolio.management.api.dto.ApiRes;
import com.nestegg.portfolio.management.api.dto.CategoryCreate;
import com.nestegg.portfolio.management.api.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
public class CategoryController {

	private final CategoryService categoryService;

	public CategoryController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@PostMapping()
	public ApiRes createCategory(@Valid @RequestBody CategoryCreate request) {
		return this.categoryService.createCategory(request);
	}

	@PutMapping("/{categoryId}")
	public ApiRes updateCategory(@Valid @RequestBody CategoryCreate request, @PathVariable String categoryId) {
		return this.categoryService.updateCategory(request, categoryId);
	}

	@PatchMapping("/{categoryId}")
	public ApiRes updateCategoryStatus(@PathVariable String categoryId) {
		return this.categoryService.updateStatusCategory(categoryId);
	}

	@GetMapping("/{categoryId}")
	public ApiRes getCategoryById(@PathVariable String categoryId) {
		return this.categoryService.getCategoryById(categoryId);
	}

	@DeleteMapping("/{categoryId}")
	public ApiRes deleteCategoryById(@PathVariable String categoryId) {
		return this.categoryService.deleteCategory(categoryId);
	}

}
