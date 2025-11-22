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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "stock_balance_sheets")
public class StockBalanceSheet extends AuditEntity{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String ticker;
	private Integer quarter;
	private Integer year;
	private Double shortAsset;
	private Double cash;
	private Double shortInvest;
	private Double shortReceivable;
	private Double inventory;
	private Double longAsset;
	private Double fixedAsset;
	private Double asset;
	private Double debt;
	private Double shortDebt;
	private Double longDebt;
	private Double equity;
	private Double capital;
	private Double centralBankDeposit;
	private Double otherBankDeposit;
	private Double otherBankLoan;
	private Double stockInvest;
	private Double customerLoan;
	private Double badLoan;
	private Double provision;
	private Double netCustomerLoan;
	private Double otherAsset;
	private Double otherBankCredit;
	private Double oweOtherBank;
	private Double oweCentralBank;
	private Double valuablePaper;
	private Double payableInterest;
	private Double receivableInterest;
	private Double deposit;
	private Double otherDebt;
	private Double fund;
	private Double unDistributedIncome;
	private Double minorShareHolderProfit;
	private Double payable;

}
