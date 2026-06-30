package com.smarterp.controllers;

import com.smarterp.entities.StockGroup;
import com.smarterp.entities.StockItem;
import com.smarterp.repositories.StockGroupRepository;
import com.smarterp.repositories.StockItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockItemRepository stockItemRepository;
    private final StockGroupRepository stockGroupRepository;

    public StockController(StockItemRepository stockItemRepository, StockGroupRepository stockGroupRepository) {
        this.stockItemRepository = stockItemRepository;
        this.stockGroupRepository = stockGroupRepository;
    }

    // Stock Groups
    @GetMapping("/groups")
    public ResponseEntity<List<StockGroup>> getGroups(@RequestParam Long companyId) {
        List<StockGroup> groups = stockGroupRepository.findByCompanyId(companyId);
        if (groups.isEmpty()) {
            List<String> defaultGroups = java.util.Arrays.asList("General", "Raw Materials", "Finished Goods");
            for (String gName : defaultGroups) {
                StockGroup sg = StockGroup.builder()
                        .name(gName)
                        .companyId(companyId)
                        .build();
                stockGroupRepository.save(sg);
            }
            groups = stockGroupRepository.findByCompanyId(companyId);
        }
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/groups")
    public ResponseEntity<StockGroup> createGroup(@RequestBody StockGroup group) {
        return ResponseEntity.ok(stockGroupRepository.save(group));
    }

    // Stock Items
    @GetMapping("/items")
    public ResponseEntity<List<StockItem>> getItems(@RequestParam Long companyId) {
        return ResponseEntity.ok(stockItemRepository.findByCompanyId(companyId));
    }

    @PostMapping("/items")
    public ResponseEntity<StockItem> createItem(@RequestBody StockItem item) {
        if (item.getQuantity() == null) {
            item.setQuantity(0.0);
        }
        return ResponseEntity.ok(stockItemRepository.save(item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        stockItemRepository.deleteById(id);
        return ResponseEntity.ok("Stock item deleted successfully");
    }
}
