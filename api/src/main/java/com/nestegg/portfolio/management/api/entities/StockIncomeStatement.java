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

import jakarta.persistence.*;
import lombok.*;

import java.util.Base64;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "stock_income_statements")
public class StockIncomeStatement extends AuditEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String uniqueHash;

	@Column(nullable = false)
	private String ticker;

	@Column(nullable = false)
	private Integer quarter;

	@Column(nullable = false)
	private Integer year;

	private Double revenue;
	private Double yearRevenueGrowth;
	private Double quarterRevenueGrowth;
	private Double costOfGoodSold;
	private Double grossProfit;
	private Double operationExpense;
	private Double operationProfit;
	private Double yearOperationProfitGrowth;
	private Double quarterOperationProfitGrowth;
	private Double interestExpense;
	private Double preTaxProfit;
	private Double postTaxProfit;
	private Double shareHolderIncome;
	private Double yearShareHolderIncomeGrowth;
	private Double quarterShareHolderIncomeGrowth;
	private Double investProfit;
	private Double serviceProfit;
	private Double otherProfit;
	private Double provisionExpense;
	private Double operationIncome;
	private Double ebitda;

	@PrePersist
	private void generateUniqueHash() {
		if (this.id == null && this.ticker != null && this.quarter != null && this.year != null) {
			this.uniqueHash = Base64.getEncoder().encodeToString(String.format(getHashPattern(), this.ticker, this.year, this.quarter).getBytes());
		}
	}

	public static String getHashPattern() {
		return "%s_%dQ%d";
	}
}
