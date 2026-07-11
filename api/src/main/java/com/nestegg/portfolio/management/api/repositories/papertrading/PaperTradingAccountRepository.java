package com.nestegg.portfolio.management.api.repositories.papertrading;

import com.nestegg.portfolio.management.api.entities.papertrading.PaperTradingAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaperTradingAccountRepository extends JpaRepository<PaperTradingAccount, String> {
	Optional<PaperTradingAccount> findByUserId(String userId);
}
