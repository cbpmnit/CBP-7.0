package com.cbp7;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false"
})
class CbpBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
