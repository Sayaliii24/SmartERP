package com.smarterp.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Database configuration that handles Render's DATABASE_URL format.
 * Render provides URLs like: postgres://user:pass@host:port/dbname
 * Spring Boot needs: jdbc:postgresql://host:port/dbname with separate username/password.
 */
@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(3);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);

        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                // Render-style URL: postgres://user:pass@host:port/dbname
                try {
                    String normalized = databaseUrl;
                    if (normalized.startsWith("postgres://")) {
                        normalized = "postgresql://" + normalized.substring("postgres://".length());
                    }

                    URI dbUri = new URI(normalized);
                    String userInfo = dbUri.getUserInfo();
                    String username = userInfo.split(":")[0];
                    String password = userInfo.split(":")[1];

                    int port = dbUri.getPort();
                    String portStr = (port > 0) ? (":" + port) : "";

                    String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost()
                            + portStr
                            + dbUri.getPath()
                            + "?sslmode=require";

                    dataSource.setJdbcUrl(jdbcUrl);
                    dataSource.setUsername(username);
                    dataSource.setPassword(password);
                } catch (URISyntaxException e) {
                    throw new RuntimeException("Invalid DATABASE_URL format: " + e.getMessage(), e);
                }
            } else if (databaseUrl.startsWith("jdbc:")) {
                // Already a JDBC URL
                dataSource.setJdbcUrl(databaseUrl);
                dataSource.setUsername(System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "postgres");
                dataSource.setPassword(System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "postgres");
            } else {
                throw new RuntimeException("Unsupported DATABASE_URL format. Expected postgres:// or jdbc:postgresql:// but got: " + databaseUrl.substring(0, Math.min(20, databaseUrl.length())));
            }
        } else {
            // Local development fallback
            dataSource.setJdbcUrl("jdbc:postgresql://localhost:5432/smarterp");
            dataSource.setUsername(System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "postgres");
            dataSource.setPassword(System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "postgres");
        }

        return dataSource;
    }
}
