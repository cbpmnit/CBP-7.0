package com.cbp7;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CbpBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CbpBackendApplication.class, args);
	}

}
