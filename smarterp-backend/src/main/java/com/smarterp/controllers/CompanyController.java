package com.smarterp.controllers;

import com.smarterp.entities.Company;
import com.smarterp.repositories.CompanyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyRepository companyRepository;

    public CompanyController(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public ResponseEntity<List<Company>> getCompanies() {
        return ResponseEntity.ok(companyRepository.findByUserId(getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        Long userId = getCurrentUserId();
        if (companyRepository.countByUserId(userId) >= 5) {
            return ResponseEntity.badRequest().body("Error: Limit of 5 companies per user reached!");
        }
        company.setUserId(userId);
        return ResponseEntity.ok(companyRepository.save(company));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @RequestBody Company companyDetails) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        company.setName(companyDetails.getName());
        company.setGstNumber(companyDetails.getGstNumber());
        company.setFinancialYear(companyDetails.getFinancialYear());
        company.setAddress(companyDetails.getAddress());
        company.setState(companyDetails.getState());
        company.setContactInfo(companyDetails.getContactInfo());

        return ResponseEntity.ok(companyRepository.save(company));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        companyRepository.delete(company);
        return ResponseEntity.ok("Company deleted successfully");
    }
}
