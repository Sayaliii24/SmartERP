package com.smarterp.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "account_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long companyId; // Each company has its own account groups (though some standard ones are pre-seeded)
}
