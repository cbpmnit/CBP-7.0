package com.cbp7.registration;

import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("local")
class PublicRegistrationControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void getPaymentConfig_PublicAccess_Success() throws Exception {
        mockMvc.perform(get("/api/v1/public/registration/payment-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.amount").value(100.0))
                .andExpect(jsonPath("$.data.currency").value("INR"));
    }

    @Test
    void createOrder_UnauthenticatedPublicAccess_Success() throws Exception {
        CreatePublicOrderRequest request = new CreatePublicOrderRequest(
                "Public Visitor",
                "2024PUB999",
                "public.visitor@example.com",
                "9123456789",
                ProgramLevel.UNDERGRADUATE,
                "Computer Science and Engineering",
                null,
                2,
                StudentType.DAY_SCHOLAR,
                "456 Civil Lines, Jaipur",
                null,
                null,
                "Excited for CBP 7.0"
        );

        mockMvc.perform(post("/api/v1/public/registration/create-order")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.merchantOrderId").exists())
                .andExpect(jsonPath("$.data.amount").value(100.0));
    }
}
