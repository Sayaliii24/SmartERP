package com.smarterp.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
    public DataSource dataSource(DataSourceProperties properties) {
        String databaseUrl = System.getenv("DATABASE_URL");

        HikariDataSource dataSource = new HikariDataSource();

        if (databaseUrl != null && (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            // Render-style URL: postgres://user:pass@host:port/dbname
            try {
                // Normalize the scheme so URI can parse it
                String normalized = databaseUrl;
                if (normalized.startsWith("postgres://")) {
                    normalized = "postgresql://" + normalized.substring("postgres://".length());
                }

                URI dbUri = new URI(normalized);
                String userInfo = dbUri.getUserInfo();
                String username = userInfo.split(":")[0];
                String password = userInfo.split(":")[1];
                String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost()
                        + ":" + dbUri.getPort()
                        + dbUri.getPath()
                        + "?sslmode=require";

                dataSource.setJdbcUrl(jdbcUrl);
                dataSource.setUsername(username);
                dataSource.setPassword(password);
            } catch (URISyntaxException e) {
                throw new RuntimeException("Invalid DATABASE_URL format", e);
            }
        } else if (databaseUrl != null && databaseUrl.startsWith("jdbc:")) {
            // Already a JDBC URL
            dataSource.setJdbcUrl(databaseUrl);
            dataSource.setUsername(properties.getUsername());
            dataSource.setPassword(properties.getPassword());
        } else {
            // Fallback to properties
            dataSource.setJdbcUrl(properties.getUrl());
            dataSource.setUsername(properties.getUsername());
            dataSource.setPassword(properties.getPassword());
        }

        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(3);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);

        return dataSource;
    }
}
