package com.smarterp.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ledgers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ledger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long groupId; // references AccountGroup

    @Column(nullable = false)
    private Long companyId; // references Company

    private Double openingBalance;

    private Double currentBalance;

    private String gstNumber;

    private String mobileNumber;

    private String address;

    @Column(nullable = false)
    private String ledgerType; // CUSTOMER, SUPPLIER, EXPENSE, INCOME, BANK, CASH
}
