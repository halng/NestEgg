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
@Entity(name = "tickers")
public class Ticker extends AuditEntity {
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

	public Ticker fromObject(Object o) {
		if (!(o instanceof Map map)) {
			throw new IllegalArgumentException("Object is not a map");
		}

		TickerBuilder ticker = Ticker.builder()
				.symbol(map.get("ticker").toString())
				.name(map.get("shortName").toString())
				.exchange(map.get("exchange").toString())
				.isActivelyTraded(true);

		if (map.get("stockRating") != null) {
			ticker.rating(Double.parseDouble(map.get("stockRating").toString()));
		}
		if (map.get("deltaInWeek") != null) {
			ticker.deltaInWeek(Double.parseDouble(map.get("deltaInWeek").toString()));
		}
		if (map.get("deltaInMonth") != null) {
			ticker.deltaInMonth(Double.parseDouble(map.get("deltaInMonth").toString()));
		}
		if (map.get("deltaInYear") != null) {
			ticker.deltaInYear(Double.parseDouble(map.get("deltaInYear").toString()));
		}

		if (map.get("industryEn") != null) {
			ticker.industry(map.get("industryEn").toString());
		}

		return ticker.build();
	}
}
