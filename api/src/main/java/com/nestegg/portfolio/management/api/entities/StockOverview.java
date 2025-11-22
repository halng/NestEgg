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

package com.nestegg.portfolio.management.api.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.util.Map;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "stock_overviews")
public class StockOverview extends AuditEntity {
	@Id
	private String symbol;
	private String name;
	private Double rating;
	private String exchange;
	private Double deltaInWeek;
	private Double deltaInMonth;
	private Double deltaInYear;
	private Boolean isActivelyTraded;
	private String industry;
	private Double outstandingShare;
	private Double issueShare;

	public StockOverview fromObject(Object o) {
		if (!(o instanceof Map map)) {
			throw new IllegalArgumentException("Object is not a map");
		}

		StockOverviewBuilder builder = StockOverview.builder()
				.symbol(getStringValue(map, "ticker"))
				.name(getStringValue(map, "shortName"))
				.exchange(getStringValue(map, "exchange"))
				.isActivelyTraded(true);

		setDoubleIfPresent(builder::rating, map, "stockRating");
		setDoubleIfPresent(builder::deltaInWeek, map, "deltaInWeek");
		setDoubleIfPresent(builder::deltaInMonth, map, "deltaInMonth");
		setDoubleIfPresent(builder::deltaInYear, map, "deltaInYear");
		setStringIfPresent(builder::industry, map, "industryEn");
		setDoubleIfPresent(builder::outstandingShare, map, "outstandingShare");
		setDoubleIfPresent(builder::issueShare, map, "issueShare");

		return builder.build();
	}

	private String getStringValue(Map<?, ?> map, String key) {
		Object value = map.get(key);
		return value != null ? value.toString() : null;
	}

	private void setDoubleIfPresent(java.util.function.Consumer<Double> setter, Map<?, ?> map, String key) {
		Object value = map.get(key);
		if (value != null) {
			setter.accept(Double.parseDouble(value.toString()));
		}
	}

	private void setStringIfPresent(java.util.function.Consumer<String> setter, Map<?, ?> map, String key) {
		Object value = map.get(key);
		if (value != null) {
			setter.accept(value.toString());
		}
	}
}
