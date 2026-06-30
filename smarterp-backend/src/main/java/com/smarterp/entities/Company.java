package com.smarterp.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String gstNumber;

    private String financialYear;

    private String address;

    private String state;

    private String contactInfo;

    @Column(nullable = false)
    private Long userId; // The owner user id
}
