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
import jakarta.persistence.Table;
import lombok.*;

@Getter
@Setter
@Builder
@Entity
@Table(name = "stock_ratios")
@AllArgsConstructor
@NoArgsConstructor
public class StockRatio extends AuditEntity {

	private Double capitalize;

	private Long tradeVolume;

	private Double priceToEarning;

	private Double priceToBook;

	private Double valueBeforeEbitda;

	private Double dividend;

	private Double roe;

	private Double profitGrowthAvarage;

	private Double ageOfReceivable;

	private Double ageOfInventory;

	private Double payableOnEquity;

	private Double payableOnEbitda;

	private Double ebitOnInterest;

	private Double shortOnLongTermPayable;

	private Double revenue;

	private Double operationProfit;

	private Double netProfit;

	private Double earningPerShare;

	private Double asset;

	private Double liability;

	private Double equity;

	private Double bookValuePerShare;

	@Column
	private Double profitMargin;

	@Column
	private Double nonInterestOnToi;

	@Column
	private Double loanOnDeposit;

	@Column
	private Double creditGrowth;

	@Column
	private Double badDebtPercentage;

	@Column
	private Double provisionOnBadDebt;

	@Column
	private Double customerCredit;

	@Column
	private Double betaIndex;

	@Column(nullable = false, unique = true)
	private String ticker;

}
