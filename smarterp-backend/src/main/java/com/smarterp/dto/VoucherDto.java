package com.smarterp.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

public class VoucherDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateVoucherRequest {
        private String voucherNumber;
        private LocalDate date;
        private String type; // CONTRA, PAYMENT, RECEIPT, JOURNAL, PURCHASE, SALES, CREDIT_NOTE, DEBIT_NOTE
        private Long companyId;
        private String narration;
        private Double totalAmount;
        private Double gstAmount;
        private List<VoucherEntryRequest> entries;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VoucherEntryRequest {
        private Long ledgerId;
        private Double amount;
        private String entryType; // DEBIT, CREDIT
        private Long stockItemId; // Optional
        private Double quantity; // Optional
        private Double rate; // Optional
    }
}
