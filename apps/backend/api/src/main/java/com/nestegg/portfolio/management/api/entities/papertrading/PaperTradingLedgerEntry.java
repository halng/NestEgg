package com.nestegg.portfolio.management.api.entities.papertrading;

import com.nestegg.portfolio.management.api.entities.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "paper_trading_ledger_entries")
public class PaperTradingLedgerEntry extends AuditEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "account_id", nullable = false)
	private PaperTradingAccount account;

	@Column(nullable = false, length = 4)
	private String side;

	@Column(nullable = false, length = 20)
	private String ticker;

	@Column(nullable = false)
	private long shares;

	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal price;

	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal total;

	@Column(nullable = false)
	private Instant executedAt;
}
