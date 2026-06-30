package com.smarterp.services;

import com.smarterp.dto.VoucherDto.CreateVoucherRequest;
import com.smarterp.dto.VoucherDto.VoucherEntryRequest;
import com.smarterp.entities.Ledger;
import com.smarterp.entities.StockItem;
import com.smarterp.entities.Voucher;
import com.smarterp.entities.VoucherEntry;
import com.smarterp.repositories.LedgerRepository;
import com.smarterp.repositories.StockItemRepository;
import com.smarterp.repositories.VoucherEntryRepository;
import com.smarterp.repositories.VoucherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherEntryRepository voucherEntryRepository;
    private final LedgerRepository ledgerRepository;
    private final StockItemRepository stockItemRepository;

    public VoucherService(VoucherRepository voucherRepository,
                          VoucherEntryRepository voucherEntryRepository,
                          LedgerRepository ledgerRepository,
                          StockItemRepository stockItemRepository) {
        this.voucherRepository = voucherRepository;
        this.voucherEntryRepository = voucherEntryRepository;
        this.ledgerRepository = ledgerRepository;
        this.stockItemRepository = stockItemRepository;
    }

    @Transactional
    public Voucher createVoucher(CreateVoucherRequest request) {
        // 1. Double Entry Check
        double debitSum = 0.0;
        double creditSum = 0.0;

        for (VoucherEntryRequest entry : request.getEntries()) {
            if ("DEBIT".equalsIgnoreCase(entry.getEntryType())) {
                debitSum += entry.getAmount();
            } else if ("CREDIT".equalsIgnoreCase(entry.getEntryType())) {
                creditSum += entry.getAmount();
            }
        }

        // Allow tiny rounding difference (e.g. GST decimals)
        if (Math.abs(debitSum - creditSum) > 0.01) {
            throw new RuntimeException("Debits and Credits must balance! Debit total: " + debitSum + ", Credit total: " + creditSum);
        }

        // 2. Save Voucher Header
        Voucher voucher = Voucher.builder()
                .voucherNumber(request.getVoucherNumber())
                .date(request.getDate())
                .type(request.getType().toUpperCase())
                .companyId(request.getCompanyId())
                .narration(request.getNarration())
                .totalAmount(debitSum)
                .gstAmount(request.getGstAmount() != null ? request.getGstAmount() : 0.0)
                .build();

        Voucher savedVoucher = voucherRepository.save(voucher);

        // 3. Process each entry, update ledger accounts and inventory
        for (VoucherEntryRequest entryReq : request.getEntries()) {
            // A. Update Ledger Account Balance
            Ledger ledger = ledgerRepository.findById(entryReq.getLedgerId())
                    .orElseThrow(() -> new RuntimeException("Ledger not found with ID: " + entryReq.getLedgerId()));

            double multiplier = 1.0;
            // Assets, Customers, Cash, Bank, Expenses: Debits increase (+), Credits decrease (-)
            // Liabilities, Suppliers, Incomes: Credits increase (+), Debits decrease (-)
            String type = ledger.getLedgerType().toUpperCase();
            boolean isAssetOrExpense = type.equals("CUSTOMER") || type.equals("BANK") || type.equals("CASH") || type.equals("EXPENSE");

            if ("DEBIT".equalsIgnoreCase(entryReq.getEntryType())) {
                multiplier = isAssetOrExpense ? 1.0 : -1.0;
            } else { // CREDIT
                multiplier = isAssetOrExpense ? -1.0 : 1.0;
            }

            ledger.setCurrentBalance(ledger.getCurrentBalance() + (entryReq.getAmount() * multiplier));
            ledgerRepository.save(ledger);

            // B. Update Stock Inventory if stockItemId is provided
            if (entryReq.getStockItemId() != null && entryReq.getQuantity() != null) {
                StockItem stockItem = stockItemRepository.findById(entryReq.getStockItemId())
                        .orElseThrow(() -> new RuntimeException("Stock Item not found with ID: " + entryReq.getStockItemId()));

                // Purchase increases inventory, Sales decreases inventory
                if ("PURCHASE".equalsIgnoreCase(request.getType())) {
                    stockItem.setQuantity(stockItem.getQuantity() + entryReq.getQuantity());
                } else if ("SALES".equalsIgnoreCase(request.getType())) {
                    if (stockItem.getQuantity() < entryReq.getQuantity()) {
                        throw new RuntimeException("Insufficient stock for item: " + stockItem.getName() + 
                                ". Available: " + stockItem.getQuantity() + ", Required: " + entryReq.getQuantity());
                    }
                    stockItem.setQuantity(stockItem.getQuantity() - entryReq.getQuantity());
                }
                stockItemRepository.save(stockItem);
            }

            // C. Save Voucher Entry details
            VoucherEntry entryEntity = VoucherEntry.builder()
                    .voucherId(savedVoucher.getId())
                    .ledgerId(entryReq.getLedgerId())
                    .amount(entryReq.getAmount())
                    .entryType(entryReq.getEntryType().toUpperCase())
                    .stockItemId(entryReq.getStockItemId())
                    .quantity(entryReq.getQuantity())
                    .rate(entryReq.getRate())
                    .build();

            voucherEntryRepository.save(entryEntity);
        }

        return savedVoucher;
    }

    public List<VoucherEntry> getEntriesForVoucher(Long voucherId) {
        return voucherEntryRepository.findByVoucherId(voucherId);
    }
}
