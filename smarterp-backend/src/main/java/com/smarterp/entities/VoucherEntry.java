package com.smarterp.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "voucher_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long voucherId;

    @Column(nullable = false)
    private Long ledgerId; // references Ledger

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String entryType; // DEBIT, CREDIT

    // Fields for inventory updates inside vouchers (e.g. Sales/Purchase)
    private Long stockItemId; 
    private Double quantity;
    private Double rate;
}
