package com.smarterp.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String voucherNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String type; // CONTRA, PAYMENT, RECEIPT, JOURNAL, PURCHASE, SALES, CREDIT_NOTE, DEBIT_NOTE

    @Column(nullable = false)
    private Long companyId;

    private String narration;

    private Double totalAmount;

    private Double gstAmount;
}
