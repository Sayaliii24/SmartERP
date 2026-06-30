package com.smarterp.controllers;

import com.smarterp.entities.Ledger;
import com.smarterp.entities.StockItem;
import com.smarterp.repositories.LedgerRepository;
import com.smarterp.repositories.StockItemRepository;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final LedgerRepository ledgerRepository;
    private final StockItemRepository stockItemRepository;

    public ReportController(LedgerRepository ledgerRepository, StockItemRepository stockItemRepository) {
        this.ledgerRepository = ledgerRepository;
        this.stockItemRepository = stockItemRepository;
    }

    @Data
    @Builder
    public static class BalanceSheetResponse {
        private Double totalAssets;
        private Double totalLiabilities;
        private List<Ledger> assets;
        private List<Ledger> liabilities;
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetResponse> getBalanceSheet(@RequestParam Long companyId) {
        List<Ledger> allLedgers = ledgerRepository.findByCompanyId(companyId);
        List<Ledger> assets = new ArrayList<>();
        List<Ledger> liabilities = new ArrayList<>();

        double assetTotal = 0.0;
        double liabilityTotal = 0.0;

        for (Ledger l : allLedgers) {
            String type = l.getLedgerType().toUpperCase();
            if (type.equals("CUSTOMER") || type.equals("BANK") || type.equals("CASH")) {
                assets.add(l);
                assetTotal += l.getCurrentBalance();
            } else if (type.equals("SUPPLIER")) {
                liabilities.add(l);
                liabilityTotal += l.getCurrentBalance();
            }
        }

        return ResponseEntity.ok(BalanceSheetResponse.builder()
                .totalAssets(assetTotal)
                .totalLiabilities(liabilityTotal)
                .assets(assets)
                .liabilities(liabilities)
                .build());
    }

    @Data
    @Builder
    public static class ProfitLossResponse {
        private Double totalIncomes;
        private Double totalExpenses;
        private Double netProfitOrLoss;
        private List<Ledger> incomes;
        private List<Ledger> expenses;
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<ProfitLossResponse> getProfitLoss(@RequestParam Long companyId) {
        List<Ledger> allLedgers = ledgerRepository.findByCompanyId(companyId);
        List<Ledger> incomes = new ArrayList<>();
        List<Ledger> expenses = new ArrayList<>();

        double incomeTotal = 0.0;
        double expenseTotal = 0.0;

        for (Ledger l : allLedgers) {
            String type = l.getLedgerType().toUpperCase();
            if (type.equals("INCOME")) {
                incomes.add(l);
                incomeTotal += l.getCurrentBalance();
            } else if (type.equals("EXPENSE")) {
                expenses.add(l);
                expenseTotal += l.getCurrentBalance();
            }
        }

        return ResponseEntity.ok(ProfitLossResponse.builder()
                .totalIncomes(incomeTotal)
                .totalExpenses(expenseTotal)
                .netProfitOrLoss(incomeTotal - expenseTotal)
                .incomes(incomes)
                .expenses(expenses)
                .build());
    }

    @GetMapping("/stock-summary")
    public ResponseEntity<List<StockItem>> getStockSummary(@RequestParam Long companyId) {
        return ResponseEntity.ok(stockItemRepository.findByCompanyId(companyId));
    }
}
