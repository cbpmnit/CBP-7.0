package com.cbp7.cbp.controller;

import com.cbp7.auth.dto.request.LoginRequest;
import com.cbp7.auth.dto.request.RegisterRequest;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.profile.dto.request.CreateProfileRequest;
import com.cbp7.profile.dto.request.UpdateProfileRequest;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.ProfileCompletion;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.ProfileCompletionRepository;
import com.cbp7.profile.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class CbpRegistrationControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private ProfileCompletionRepository profileCompletionRepository;

    @Autowired
    private CbpRegistrationRepository cbpRegistrationRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    // Helper methods
    private String registerStudent(String studentId, String email, String name, String password) throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                studentId, email, name, "9876543210", password, password
        );
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        return login(studentId, password);
    }

    private String login(String studentId, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(studentId, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(responseStr);
        return root.path("data").path("token").asText();
    }

    private void createCompletedProfile(String token) throws Exception {
        CreateProfileRequest request = new CreateProfileRequest(
                "Parv", null, "Agrawal", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.COMPUTER_SCIENCE_ENGINEERING, 3, "A", true, "H-101", "Jaipur", "Rajasthan"
        );
        mockMvc.perform(post("/api/v1/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    private void printResponse(String label, MvcResult result) throws Exception {
        System.out.println("=== " + label + " ===");
        System.out.println("Status : " + result.getResponse().getStatus());
        String responseBody = result.getResponse().getContentAsString();
        if (StringUtils.hasText(responseBody)) {
            Object json = objectMapper.readValue(responseBody, Object.class);
            System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
        }
        System.out.println();
    }

    // 1. Successful Registration
    @Test
    void shouldRegisterSuccessfully() throws Exception {
        String token = registerStudent("2023UCP1001", "student1001@mnit.ac.in", "Parv Agrawal", "Password@123");
        createCompletedProfile(token);

        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.message", equalTo("CBP registration completed successfully.")))
                .andExpect(jsonPath("$.data.registrationId", startsWith("CBP7")))
                .andExpect(jsonPath("$.data.registrationStatus", equalTo(RegistrationStatus.PAYMENT_PENDING.name())))
                .andReturn();

        printResponse("REGISTER SUCCESS RESPONSE", result);
    }

    // 2. Duplicate Registration Rejection
    @Test
    void shouldRejectDuplicateRegistration() throws Exception {
        String token = registerStudent("2023UCP1002", "student1002@mnit.ac.in", "Parv Agrawal", "Password@123");
        createCompletedProfile(token);

        // First registration
        mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        // Duplicate registration
        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(409)))
                .andExpect(jsonPath("$.message", equalTo("You are already registered for CBP.")))
                .andReturn();

        printResponse("DUPLICATE REGISTRATION RESPONSE", result);
    }

    // 3. Reject Without Profile
    @Test
    void shouldRejectWithoutProfile() throws Exception {
        String token = registerStudent("2023UCP1003", "student1003@mnit.ac.in", "Parv Agrawal", "Password@123");

        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(400)))
                .andExpect(jsonPath("$.message", equalTo("Please complete your profile before registering.")))
                .andReturn();

        printResponse("REJECT WITHOUT PROFILE RESPONSE", result);
    }

    // 4. Reject Incomplete Profile
    @Test
    void shouldRejectIncompleteProfile() throws Exception {
        String token = registerStudent("2023UCP1004", "student1004@mnit.ac.in", "Parv Agrawal", "Password@123");
        User user = userRepository.findByStudentId("2023ucp1004").orElseThrow();

        // Create incomplete profile completion status manually
        UserProfile userProfile = UserProfile.builder()
                .user(user)
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .phoneNumber("9876543210")
                .sameAsWhatsapp(true)
                .institute("MNIT Jaipur")
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(3)
                .hosteller(false)
                .build();
        userProfileRepository.save(userProfile);

        ProfileCompletion completion = ProfileCompletion.builder()
                .user(user)
                .profileCompleted(false)
                .completionPercentage(60)
                .lastCompletedStep("ACADEMIC")
                .build();
        profileCompletionRepository.save(completion);

        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(400)))
                .andExpect(jsonPath("$.message", equalTo("Please complete your profile before registering.")))
                .andReturn();

        printResponse("REJECT INCOMPLETE PROFILE RESPONSE", result);
    }

    // 5. Reject Without JWT
    @Test
    void shouldRejectWithoutJwt() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", equalTo(401)))
                .andReturn();

        printResponse("REJECT WITHOUT JWT RESPONSE", result);
    }

    // 6. Reject Volunteer Role
    @Test
    void shouldRejectVolunteerRole() throws Exception {
        String token = registerStudent("2023UCP1006", "volunteer1006@mnit.ac.in", "Volunteer User", "Password@123");
        User user = userRepository.findByStudentId("2023ucp1006").orElseThrow();
        user.setRole(Role.ROLE_VOLUNTEER);
        userRepository.save(user);

        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", equalTo(403)))
                .andReturn();

        printResponse("REJECT VOLUNTEER ROLE RESPONSE", result);
    }

    // 7. Reject Admin Role
    @Test
    void shouldRejectAdminRole() throws Exception {
        String token = registerStudent("2023UCP1007", "admin1007@mnit.ac.in", "Admin User", "Password@123");
        User user = userRepository.findByStudentId("2023ucp1007").orElseThrow();
        user.setRole(Role.ROLE_ADMIN);
        userRepository.save(user);

        MvcResult result = mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", equalTo(403)))
                .andReturn();

        printResponse("REJECT ADMIN ROLE RESPONSE", result);
    }

    // 8. Fetch Registration Successfully
    @Test
    void shouldFetchRegistrationSuccessfully() throws Exception {
        String token = registerStudent("2023UCP1008", "student1008@mnit.ac.in", "Parv Agrawal", "Password@123");
        createCompletedProfile(token);

        mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(get("/api/v1/cbp/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", equalTo(true)))
                .andExpect(jsonPath("$.data.registrationId", startsWith("CBP7")))
                .andExpect(jsonPath("$.data.registrationStatus", equalTo(RegistrationStatus.PAYMENT_PENDING.name())))
                .andExpect(jsonPath("$.data.createdAt", notNullValue()))
                .andExpect(jsonPath("$.data.profile.studentId", equalTo("2023ucp1008")))
                .andExpect(jsonPath("$.data.profile.email", equalTo("student1008@mnit.ac.in")))
                .andExpect(jsonPath("$.data.profile.firstName", equalTo("Parv")))
                .andExpect(jsonPath("$.data.profile.lastName", equalTo("Agrawal")))
                .andExpect(jsonPath("$.data.profile.branch", equalTo("COMPUTER_SCIENCE_ENGINEERING")))
                .andReturn();

        printResponse("FETCH REGISTRATION ME RESPONSE", result);
    }

    // 9. Return 404 When Registration Missing
    @Test
    void shouldReturn404WhenRegistrationMissing() throws Exception {
        String token = registerStudent("2023UCP1009", "student1009@mnit.ac.in", "Parv Agrawal", "Password@123");
        createCompletedProfile(token);

        MvcResult result = mockMvc.perform(get("/api/v1/cbp/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", equalTo(false)))
                .andExpect(jsonPath("$.status", equalTo(404)))
                .andExpect(jsonPath("$.message", equalTo("No CBP registration found for current user.")))
                .andReturn();

        printResponse("REGISTRATION MISSING RESPONSE", result);
    }

    // 10. Preserve Snapshot After Profile Update
    @Test
    void shouldPreserveSnapshotAfterProfileUpdate() throws Exception {
        String token = registerStudent("2023UCP1010", "student1010@mnit.ac.in", "Parv Agrawal", "Password@123");
        createCompletedProfile(token);

        // Register for CBP
        mockMvc.perform(post("/api/v1/cbp/register")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        // Update profile
        UpdateProfileRequest updateRequest = new UpdateProfileRequest(
                "ParvUpdated", null, "AgrawalUpdated", null, Gender.MALE, LocalDate.of(2002, 5, 15),
                "9876543210", true, null, "MNIT Jaipur", Course.BTECH,
                Branch.ARTIFICIAL_INTELLIGENCE_DATA_SCIENCE, 4, "B", true, "H-202", "Mumbai", "Maharashtra"
        );
        mockMvc.perform(put("/api/v1/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        // Fetch registration and verify snapshot is unchanged
        MvcResult result = mockMvc.perform(get("/api/v1/cbp/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.profile.firstName", equalTo("Parv"))) // Unchanged
                .andExpect(jsonPath("$.data.profile.lastName", equalTo("Agrawal"))) // Unchanged
                .andExpect(jsonPath("$.data.profile.branch", equalTo("COMPUTER_SCIENCE_ENGINEERING"))) // Unchanged
                .andExpect(jsonPath("$.data.profile.city", equalTo("Jaipur"))) // Unchanged
                .andExpect(jsonPath("$.data.profile.roomNumber", equalTo("H-101"))) // Unchanged
                .andReturn();

        printResponse("PRESERVED SNAPSHOT RESPONSE", result);

        // Verify profile table was updated but registration snapshot remained intact
        UserProfile profile = userProfileRepository.findByUser(userRepository.findByStudentId("2023ucp1010").orElseThrow()).orElseThrow();
        assertEquals("ParvUpdated", profile.getFirstName());
        assertEquals("Mumbai", profile.getCity());
    }
}
