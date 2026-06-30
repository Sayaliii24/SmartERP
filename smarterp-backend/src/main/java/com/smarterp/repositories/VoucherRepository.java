package com.smarterp.repositories;

import com.smarterp.entities.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByCompanyId(Long companyId);
    List<Voucher> findByCompanyIdAndType(Long companyId, String type);
}
