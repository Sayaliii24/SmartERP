package com.smarterp.repositories;

import com.smarterp.entities.StockGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockGroupRepository extends JpaRepository<StockGroup, Long> {
    List<StockGroup> findByCompanyId(Long companyId);
}
