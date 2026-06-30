package com.smarterp.controllers;

import com.smarterp.entities.AccountGroup;
import com.smarterp.entities.Ledger;
import com.smarterp.repositories.AccountGroupRepository;
import com.smarterp.repositories.LedgerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/ledgers")
public class LedgerController {

    private final LedgerRepository ledgerRepository;
    private final AccountGroupRepository groupRepository;

    public LedgerController(LedgerRepository ledgerRepository, AccountGroupRepository groupRepository) {
        this.ledgerRepository = ledgerRepository;
        this.groupRepository = groupRepository;
    }

    // Get and/or seed account groups
    @GetMapping("/groups")
    public ResponseEntity<List<AccountGroup>> getGroups(@RequestParam Long companyId) {
        List<AccountGroup> groups = groupRepository.findByCompanyId(companyId);
        if (groups.isEmpty()) {
            // Seed standard account groups
            List<String> defaultGroups = Arrays.asList(
                    "Current Assets", "Current Liabilities",
                    "Direct Income", "Direct Expenses",
                    "Indirect Income", "Indirect Expenses",
                    "Sales Accounts", "Purchase Accounts"
            );
            for (String gName : defaultGroups) {
                AccountGroup ag = AccountGroup.builder()
                        .name(gName)
                        .companyId(companyId)
                        .build();
                groupRepository.save(ag);
            }
            groups = groupRepository.findByCompanyId(companyId);
        }
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/groups")
    public ResponseEntity<AccountGroup> createGroup(@RequestBody AccountGroup group) {
        return ResponseEntity.ok(groupRepository.save(group));
    }

    @GetMapping
    public ResponseEntity<List<Ledger>> getLedgers(@RequestParam Long companyId, @RequestParam(required = false) String type) {
        if (type != null) {
            return ResponseEntity.ok(ledgerRepository.findByCompanyIdAndLedgerType(companyId, type));
        }
        return ResponseEntity.ok(ledgerRepository.findByCompanyId(companyId));
    }

    @PostMapping
    public ResponseEntity<?> createLedger(@RequestBody Ledger ledger) {
        if (ledger.getOpeningBalance() == null) {
            ledger.setOpeningBalance(0.0);
        }
        if (ledger.getCurrentBalance() == null) {
            ledger.setCurrentBalance(ledger.getOpeningBalance());
        }
        return ResponseEntity.ok(ledgerRepository.save(ledger));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLedger(@PathVariable Long id) {
        ledgerRepository.deleteById(id);
        return ResponseEntity.ok("Ledger deleted successfully");
    }
}
