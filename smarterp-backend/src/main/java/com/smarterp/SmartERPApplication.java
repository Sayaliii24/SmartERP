package com.smarterp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;

@SpringBootApplication
public class SmartERPApplication {
    public static void main(String[] args) {
        // Render sets DATABASE_URL as postgres://user:pass@host:port/db
        // Convert it to JDBC format + SSL before Spring Boot starts
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                String jdbcUrl;
                String username;
                String password;

                if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                    String normalized = databaseUrl.replaceFirst("^postgres://", "postgresql://");
                    URI uri = new URI(normalized);
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;

                    // Render requires SSL
                    jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath() + "?sslmode=require";
                    username = userInfo[0];
                    password = userInfo.length > 1 ? userInfo[1] : "";
                } else if (databaseUrl.startsWith("jdbc:")) {
                    jdbcUrl = databaseUrl;
                    username = System.getenv().getOrDefault("DB_USERNAME", "postgres");
                    password = System.getenv().getOrDefault("DB_PASSWORD", "postgres");
                } else {
                    System.err.println("Unknown DATABASE_URL format, skipping override.");
                    SpringApplication.run(SmartERPApplication.class, args);
                    return;
                }

                System.setProperty("spring.datasource.url", jdbcUrl);
                System.setProperty("spring.datasource.username", username);
                System.setProperty("spring.datasource.password", password);
                System.out.println("Database URL configured: jdbc:postgresql://" + new URI(jdbcUrl.replace("jdbc:", "")).getHost() + ":***");

            } catch (Exception e) {
                System.err.println("Failed to parse DATABASE_URL: " + e.getMessage());
            }
        }

        SpringApplication.run(SmartERPApplication.class, args);
    }
}
