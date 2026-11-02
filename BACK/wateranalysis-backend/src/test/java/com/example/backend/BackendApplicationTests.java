package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@SpringBootTest
class BackendApplicationTests {

	@Test
	void contextLoads() {
		// This test will simply check if the application context loads successfully.
		// No additional logic is needed here as we are just verifying the setup.
		// If there are issues with the configuration, this test will fail.
	}

}
