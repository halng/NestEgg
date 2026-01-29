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

package com.nestegg.portfolio.management.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningCriteria {
	private String industry;
	private String exchange;
	private Double minRating;
	private Double maxRating;
	private Double minDeltaInYear;
	private Double maxDeltaInYear;
	private Double minPriceToEarning;
	private Double maxPriceToEarning;
	private Double minPriceToBook;
	private Double maxPriceToBook;
	private Double minRoe;
	private Double maxRoe;
	private Double minRoa;
	private Double maxRoa;
	private Double minDividend;
	private Double maxDividend;
}
