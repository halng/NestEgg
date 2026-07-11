package com.nestegg.portfolio.management.api.entities.papertrading;

import com.nestegg.portfolio.management.api.entities.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "paper_trading_holdings", uniqueConstraints = @UniqueConstraint(columnNames = {"account_id", "ticker"}))
public class PaperTradingHolding extends AuditEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "account_id", nullable = false)
	private PaperTradingAccount account;

	@Column(nullable = false, length = 4)
	private String ticker;

	@Column(nullable = false)
	private long shares;

	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal averageCost;
}
