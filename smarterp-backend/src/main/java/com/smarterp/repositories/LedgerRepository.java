package com.smarterp.repositories;

import com.smarterp.entities.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LedgerRepository extends JpaRepository<Ledger, Long> {
    List<Ledger> findByCompanyId(Long companyId);
    List<Ledger> findByCompanyIdAndLedgerType(Long companyId, String ledgerType);
}
