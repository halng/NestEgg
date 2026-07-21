package com.nestegg.portfolio.management.api.entities.papertrading;

import com.nestegg.portfolio.management.api.entities.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "paper_trading_accounts")
public class PaperTradingAccount extends AuditEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	@Column(nullable = false, unique = true)
	private String userId;

	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal startingCapital;

	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal cashBalance;

	@OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<PaperTradingHolding> holdings = new ArrayList<>();

	@OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<PaperTradingLedgerEntry> ledgerEntries = new ArrayList<>();
}
