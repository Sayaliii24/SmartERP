package com.smarterp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;

@SpringBootApplication
public class SmartERPApplication {
    public static void main(String[] args) {
        // Render sets DATABASE_URL as postgres://user:pass@host:port/db
        // Convert it to JDBC format before Spring Boot starts
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                try {
                    String normalized = databaseUrl.replaceFirst("^postgres://", "postgresql://");
                    URI uri = new URI(normalized);
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    int port = uri.getPort() > 0 ? uri.getPort() : 5432;

                    String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();
                    System.setProperty("SPRING_DATASOURCE_URL", jdbcUrl);
                    System.setProperty("SPRING_DATASOURCE_USERNAME", userInfo[0]);
                    System.setProperty("SPRING_DATASOURCE_PASSWORD", userInfo.length > 1 ? userInfo[1] : "");

                    // Also set spring properties directly
                    System.setProperty("spring.datasource.url", jdbcUrl);
                    System.setProperty("spring.datasource.username", userInfo[0]);
                    System.setProperty("spring.datasource.password", userInfo.length > 1 ? userInfo[1] : "");
                } catch (Exception e) {
                    System.err.println("Could not parse DATABASE_URL: " + e.getMessage());
                }
            } else if (databaseUrl.startsWith("jdbc:")) {
                System.setProperty("spring.datasource.url", databaseUrl);
            }
        }

        SpringApplication.run(SmartERPApplication.class, args);
    }
}
