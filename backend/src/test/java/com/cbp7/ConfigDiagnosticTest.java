package com.cbp7;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.core.env.PropertySource;

import javax.sql.DataSource;
import java.util.Map;

@SpringBootTest
class ConfigDiagnosticTest {

    @Autowired
    private Environment env;

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void runDiagnostics() {
        System.out.println("========================================================");
        System.out.println("EMPIRICAL DIAGNOSTIC REPORT");
        System.out.println("========================================================");

        System.out.println("\n--- 1 & 2. RESOLVED DATASOURCE PROPERTIES ---");
        System.out.println("spring.datasource.url: " + env.getProperty("spring.datasource.url"));
        System.out.println("spring.datasource.username: " + env.getProperty("spring.datasource.username"));
        System.out.println("spring.datasource.driver-class-name: " + env.getProperty("spring.datasource.driver-class-name"));

        System.out.println("\n--- 3 & 4. .ENV ENVIRONMENT VARIABLES LOADED ---");
        System.out.println("SERVER_PORT: " + env.getProperty("SERVER_PORT"));
        System.out.println("DB_HOST: " + env.getProperty("DB_HOST"));
        System.out.println("DB_PORT: " + env.getProperty("DB_PORT"));
        System.out.println("DB_NAME: " + env.getProperty("DB_NAME"));
        System.out.println("DB_USERNAME: " + env.getProperty("DB_USERNAME"));
        System.out.println("DB_PASSWORD: " + (env.getProperty("DB_PASSWORD") != null ? "[PRESENT - LENGTH " + env.getProperty("DB_PASSWORD").length() + "]" : "null"));
        System.out.println("DB_SSLMODE: " + env.getProperty("DB_SSLMODE"));
        System.out.println("JWT_SECRET: " + (env.getProperty("JWT_SECRET") != null ? "[PRESENT]" : "null"));
        System.out.println("JWT_EXPIRATION: " + env.getProperty("JWT_EXPIRATION"));
        System.out.println("FRONTEND_URL: " + env.getProperty("FRONTEND_URL"));

        System.out.println("\n--- 5. POSTGRESQL DRIVER CHECK ---");
        try {
            Class<?> driverClass = Class.forName("org.postgresql.Driver");
            System.out.println("Driver Class: " + driverClass.getName() + " [LOADED SUCCESSFULLY]");
        } catch (ClassNotFoundException e) {
            System.out.println("Driver Class: NOT FOUND");
        }

        System.out.println("\n--- 6. HIKARI DATASOURCE BEAN VALUES ---");
        Map<String, DataSource> dsBeans = applicationContext.getBeansOfType(DataSource.class);
        System.out.println("DataSource Bean Count: " + dsBeans.size());
        for (Map.Entry<String, DataSource> entry : dsBeans.entrySet()) {
            System.out.println("Bean Name: " + entry.getKey() + ", Class: " + entry.getValue().getClass().getName());
            if (entry.getValue() instanceof HikariDataSource hikariDs) {
                System.out.println("  Hikari JdbcUrl: " + hikariDs.getJdbcUrl());
                System.out.println("  Hikari Username: " + hikariDs.getUsername());
                System.out.println("  Hikari DriverClassName: " + hikariDs.getDriverClassName());
                System.out.println("  Hikari MaximumPoolSize: " + hikariDs.getMaximumPoolSize());
                System.out.println("  Hikari ConnectionTimeout: " + hikariDs.getConnectionTimeout());
            }
        }

        System.out.println("\n--- 7. FLYWAY BEAN CHECK ---");
        String[] flywayBeans = applicationContext.getBeanNamesForType(Object.class);
        boolean flywayFound = false;
        for (String beanName : flywayBeans) {
            if (beanName.toLowerCase().contains("flyway")) {
                System.out.println("Flyway Bean Found: " + beanName);
                flywayFound = true;
            }
        }
        if (!flywayFound) {
            System.out.println("Flyway Beans: NONE (Flyway is NOT present or active)");
        }

        System.out.println("\n--- 8 & 9. DATASOURCE BEAN & HIBERNATE CHECK ---");
        System.out.println("Total DataSource Beans in Context: " + dsBeans.size());
        String[] entityManagerFactoryBeans = applicationContext.getBeanNamesForType(jakarta.persistence.EntityManagerFactory.class);
        System.out.println("EntityManagerFactory Beans Count: " + entityManagerFactoryBeans.length);

        System.out.println("\n--- 10. ACTIVE CONFIGURATION SOURCE & PROPERTY SOURCES ---");
        String[] activeProfiles = env.getActiveProfiles();
        System.out.println("Active Profiles: " + (activeProfiles.length == 0 ? "[DEFAULT / NONE]" : String.join(", ", activeProfiles)));
        if (env instanceof ConfigurableEnvironment configEnv) {
            System.out.println("Property Sources in Environment:");
            for (PropertySource<?> ps : configEnv.getPropertySources()) {
                System.out.println("  - " + ps.getName());
            }
        }
        System.out.println("========================================================");
    }
}
