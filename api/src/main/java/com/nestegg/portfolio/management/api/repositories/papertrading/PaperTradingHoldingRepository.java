package com.nestegg.portfolio.management.api.repositories.papertrading;

import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingAccount;
import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaperTradingHoldingRepository extends JpaRepository<PaperTradingHolding, Long> {
	List<PaperTradingHolding> findByAccountOrderByTickerAsc(PaperTradingAccount account);
	Optional<PaperTradingHolding> findByAccountAndTicker(PaperTradingAccount account, String ticker);
	void deleteByAccount(PaperTradingAccount account);
}
