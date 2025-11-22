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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock_financial_ratios")
public class StockFinancialRatio extends AuditEntity{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String ticker;
	private Integer quarter;
	private Integer year;
	private Double priceToEarning;
	private Double priceToBook;
	private Double valueBeforeEbitda;
	private Double dividend;
	private Double roe;
	private Double roa;
	private Double daysReceivable;
	private Double daysInventory;
	private Double daysPayable;
	private Double ebitOnInterest;
	private Double earningPerShare;
	private Double bookValuePerShare;
	private Double interestMargin;
	private Double nonInterestOnToi;
	private Double badDebtPercentage;
	private Double provisionOnBadDebt;
	private Double costOfFinancing;
	private Double equityOnTotalAsset;
	private Double equityOnLoan;
	private Double costToIncome;
	private Double equityOnLiability;
	private Double currentPayment;
	private Double quickPayment;
	private Double epsChange;
	private Double ebitdaOnStock;
	private Double grossProfitMargin;
	private Double operatingProfitMargin;
	private Double postTaxMargin;
	private Double debtOnEquity;
	private Double debtOnAsset;
	private Double debtOnEbitda;
	private Double shortOnLongDebt;
	private Double assetOnEquity;
	private Double capitalBalance;
	private Double cashOnEquity;
	private Double cashOnCapitalize;
	private Double cashCirculation;
	private Double revenueOnWorkCapital;
	private Double capexOnFixedAsset;
	private Double revenueOnAsset;
	private Double postTaxOnPreTax;
	private Double ebitOnRevenue;
	private Double preTaxOnEbit;
	private Double preProvisionOnToi;
	private Double postTaxOnToi;
	private Double loanOnEarnAsset;
	private Double loanOnAsset;
	private Double loanOnDeposit;
	private Double depositOnEarnAsset;
	private Double badDebtOnAsset;
	private Double liquidityOnLiability;
	private Double payableOnEquity;
	private Double cancelDebt;
	private Double ebitdaOnStockChange;
	private Double bookValuePerShareChange;
	private Double creditGrowth;
}
