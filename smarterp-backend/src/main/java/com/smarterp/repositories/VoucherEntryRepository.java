package com.smarterp.repositories;

import com.smarterp.entities.VoucherEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherEntryRepository extends JpaRepository<VoucherEntry, Long> {
    List<VoucherEntry> findByVoucherId(Long voucherId);
}
