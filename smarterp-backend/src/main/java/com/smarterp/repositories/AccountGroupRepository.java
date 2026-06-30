package com.smarterp.repositories;

import com.smarterp.entities.AccountGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountGroupRepository extends JpaRepository<AccountGroup, Long> {
    List<AccountGroup> findByCompanyId(Long companyId);
}
