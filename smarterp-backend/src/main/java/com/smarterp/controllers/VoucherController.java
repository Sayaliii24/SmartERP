package com.smarterp.controllers;

import com.smarterp.dto.VoucherDto.CreateVoucherRequest;
import com.smarterp.entities.Voucher;
import com.smarterp.entities.VoucherEntry;
import com.smarterp.repositories.VoucherRepository;
import com.smarterp.services.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherRepository voucherRepository;
    private final VoucherService voucherService;

    public VoucherController(VoucherRepository voucherRepository, VoucherService voucherService) {
        this.voucherRepository = voucherRepository;
        this.voucherService = voucherService;
    }

    @GetMapping
    public ResponseEntity<List<Voucher>> getVouchers(@RequestParam Long companyId, @RequestParam(required = false) String type) {
        if (type != null) {
            return ResponseEntity.ok(voucherRepository.findByCompanyIdAndType(companyId, type.toUpperCase()));
        }
        return ResponseEntity.ok(voucherRepository.findByCompanyId(companyId));
    }

    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody CreateVoucherRequest request) {
        try {
            Voucher voucher = voucherService.createVoucher(request);
            return ResponseEntity.ok(voucher);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<List<VoucherEntry>> getVoucherEntries(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getEntriesForVoucher(id));
    }
}
