package com.nestegg.portfolio.management.api.repositories.papertrading;

import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingAccount;
import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperTradingLedgerEntryRepository extends JpaRepository<PaperTradingLedgerEntry, Long> {
	List<PaperTradingLedgerEntry> findTop25ByAccountOrderByExecutedAtDesc(PaperTradingAccount account);
	void deleteByAccount(PaperTradingAccount account);
}
