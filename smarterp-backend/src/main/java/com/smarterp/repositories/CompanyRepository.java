package com.smarterp.repositories;

import com.smarterp.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByUserId(Long userId);
    long countByUserId(Long userId);
}
