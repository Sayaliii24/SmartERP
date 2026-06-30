package com.smarterp.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String sku;

    private String hsnCode;

    private Double purchasePrice;

    private Double sellingPrice;

    @Column(nullable = false)
    private Double quantity; // Stock quantity available

    private Double gstRate; // GST percentage (e.g. 18.0)

    private String unit; // PCS, BOX, KG, LTR

    private Long stockGroupId; // references StockGroup

    @Column(nullable = false)
    private Long companyId; // references Company
}
