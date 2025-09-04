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

package com.app.portfolio.management.handlers;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

@Configuration(proxyBeanMethods = false)
public class AppRouters {

	@Bean
	public RouterFunction<ServerResponse> accountRoutes(AccountHandler controllers) {
		return RouterFunctions.route()
				.path(
						"/api/accounts", builder -> builder
								.GET("", controllers::createAccount)
								.POST("", request -> ServerResponse.ok().build())
								.GET("/{id}", request -> ServerResponse.ok().build())
								.PUT("/{id}", request -> ServerResponse.ok().build())
								.DELETE("/{id}", request -> ServerResponse.ok().build())
				)
				.build();
	}

	@Bean
	public RouterFunction<ServerResponse> budgetRoutes(BudgetHandler controllers) {
		return RouterFunctions.route()
				.path(
						"/api/budgets", builder -> builder
								.GET("", controllers::createBudget)
								.POST("", request -> ServerResponse.ok().build())
								.GET("/{id}", request -> ServerResponse.ok().build())
								.PUT("/{id}", request -> ServerResponse.ok().build())
								.DELETE("/{id}", request -> ServerResponse.ok().build())
				)
				.build();
	}
}
