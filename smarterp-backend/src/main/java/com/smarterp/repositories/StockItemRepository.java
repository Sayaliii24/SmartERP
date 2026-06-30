package com.smarterp.repositories;

import com.smarterp.entities.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    List<StockItem> findByCompanyId(Long companyId);
}
