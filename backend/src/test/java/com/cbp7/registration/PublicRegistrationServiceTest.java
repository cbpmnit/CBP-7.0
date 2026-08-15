package com.cbp7.registration;

import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.registration.config.PublicRegistrationProperties;
import com.cbp7.registration.dto.request.CompletePublicRegistrationRequest;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import com.cbp7.registration.dto.response.PaymentConfigResponse;
import com.cbp7.registration.dto.response.PublicOrderResponse;
import com.cbp7.registration.dto.response.PublicRegistrationStatusResponse;
import com.cbp7.registration.entity.PublicPaymentTransaction;
import com.cbp7.registration.entity.PublicRegistration;
import com.cbp7.registration.enums.PublicPaymentStatus;
import com.cbp7.registration.enums.PublicRegistrationStatus;
import com.cbp7.registration.mapper.PublicRegistrationMapper;
import com.cbp7.registration.repository.PublicPaymentTransactionRepository;
import com.cbp7.registration.repository.PublicRegistrationRepository;
import com.cbp7.registration.service.impl.PublicRegistrationServiceImpl;
import com.cbp7.registration.validator.PublicRegistrationValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicRegistrationServiceTest {

    @Mock
    private PublicRegistrationRepository publicRegistrationRepository;

    @Mock
    private PublicPaymentTransactionRepository publicPaymentTransactionRepository;

    @Mock
    private com.cbp7.payment.gateway.PaymentGateway paymentGateway;

    @Mock
    private com.cbp7.registration.service.PublicRegistrationAuditService auditService;

    private PublicRegistrationProperties publicRegistrationProperties;
    private PublicRegistrationServiceImpl publicRegistrationService;

    @BeforeEach
    void setUp() {
        publicRegistrationProperties = new PublicRegistrationProperties();
        publicRegistrationProperties.setFee(new BigDecimal("100.00"));

        publicRegistrationService = new PublicRegistrationServiceImpl(
                publicRegistrationRepository,
                publicPaymentTransactionRepository,
                new PublicRegistrationValidator(),
                new PublicRegistrationMapper(),
                publicRegistrationProperties,
                paymentGateway,
                auditService
        );
    }

    @Test
    void getPaymentConfig_ReturnsConfiguredAmountAndCurrency() {
        PaymentConfigResponse config = publicRegistrationService.getPaymentConfig();
        assertNotNull(config);
        assertEquals(new BigDecimal("100.00"), config.amount());
        assertEquals("INR", config.currency());
    }

    @Test
    void createOrder_ValidRequest_SuccessWithConfiguredAmount() {
        CreatePublicOrderRequest request = new CreatePublicOrderRequest(
                "John Doe",
                "2024PUB001",
                "john.doe@example.com",
                "9876543210",
                ProgramLevel.UNDERGRADUATE,
                "Computer Science and Engineering",
                null,
                3,
                StudentType.DAY_SCHOLAR,
                "123 Public Street, Jaipur",
                null,
                null,
                "Great learning experience"
        );

        when(publicRegistrationRepository.existsByEmailIgnoreCaseAndPaymentStatus("john.doe@example.com", PublicRegistrationStatus.REGISTERED)).thenReturn(false);
        when(publicRegistrationRepository.existsByStudentIdIgnoreCaseAndPaymentStatus("2024PUB001", PublicRegistrationStatus.REGISTERED)).thenReturn(false);
        when(publicRegistrationRepository.findByEmailIgnoreCase("john.doe@example.com")).thenReturn(Optional.empty());

        when(publicRegistrationRepository.save(any(PublicRegistration.class))).thenAnswer(invocation -> {
            PublicRegistration reg = invocation.getArgument(0);
            reg.setId(UUID.randomUUID());
            return reg;
        });

        PublicOrderResponse response = publicRegistrationService.createOrder(request);

        assertNotNull(response);
        assertNotNull(response.registrationId());
        assertTrue(response.merchantOrderId().startsWith("PUB_ORD_"));
        assertEquals(new BigDecimal("100.00"), response.amount());
        assertEquals("INITIATED", response.paymentStatus());
        verify(publicPaymentTransactionRepository).save(any(PublicPaymentTransaction.class));
    }

    @Test
    void createOrder_DepartmentOtherWithCustomDepartment_Success() {
        CreatePublicOrderRequest request = new CreatePublicOrderRequest(
                "Jane Doe",
                "2024PUB002",
                "jane.doe@example.com",
                "9876543210",
                ProgramLevel.POSTGRADUATE,
                "Other",
                "Robotics & Automation",
                2,
                StudentType.HOSTELLER,
                null,
                "Hostel 5",
                "302",
                "Robotics research"
        );

        when(publicRegistrationRepository.existsByEmailIgnoreCaseAndPaymentStatus("jane.doe@example.com", PublicRegistrationStatus.REGISTERED)).thenReturn(false);
        when(publicRegistrationRepository.existsByStudentIdIgnoreCaseAndPaymentStatus("2024PUB002", PublicRegistrationStatus.REGISTERED)).thenReturn(false);

        when(publicRegistrationRepository.save(any(PublicRegistration.class))).thenAnswer(invocation -> {
            PublicRegistration reg = invocation.getArgument(0);
            reg.setId(UUID.randomUUID());
            assertEquals("Robotics & Automation", reg.getDepartment());
            return reg;
        });

        PublicOrderResponse response = publicRegistrationService.createOrder(request);
        assertNotNull(response);
    }

    @Test
    void createOrder_DepartmentOtherWithoutCustomDepartment_ThrowsException() {
        CreatePublicOrderRequest request = new CreatePublicOrderRequest(
                "Jane Doe", "2024PUB002", "jane.doe@example.com", "9876543210",
                ProgramLevel.POSTGRADUATE, "Other", null, 2,
                StudentType.HOSTELLER, null, "Hostel 5", "302", null
        );

        assertThrows(IllegalArgumentException.class, () -> publicRegistrationService.createOrder(request));
    }

    @Test
    void completeRegistration_Success() {
        UUID regId = UUID.randomUUID();
        PublicRegistration reg = PublicRegistration.builder()
                .fullName("John Doe")
                .studentId("2024PUB001")
                .email("john.doe@example.com")
                .mobileNumber("9876543210")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("Computer Science and Engineering")
                .year(3)
                .studentType(StudentType.DAY_SCHOLAR)
                .address("123 Street")
                .paymentStatus(PublicRegistrationStatus.PENDING)
                .build();
        reg.setId(regId);

        PublicPaymentTransaction tx = PublicPaymentTransaction.builder()
                .registration(reg)
                .merchantOrderId("PUB_ORD_12345")
                .amount(new BigDecimal("100.00"))
                .status(PublicPaymentStatus.INITIATED)
                .build();

        CompletePublicRegistrationRequest req = new CompletePublicRegistrationRequest(regId, "PUB_ORD_12345", "GATEWAY_TXN_99");

        when(publicRegistrationRepository.findById(regId)).thenReturn(Optional.of(reg));
        when(publicPaymentTransactionRepository.findByMerchantOrderId("PUB_ORD_12345")).thenReturn(Optional.of(tx));
        when(publicRegistrationRepository.save(any(PublicRegistration.class))).thenAnswer(inv -> inv.getArgument(0));

        PublicRegistrationStatusResponse res = publicRegistrationService.completeRegistration(req);

        assertNotNull(res);
        assertEquals("REGISTERED", res.paymentStatus());
        assertEquals("PUB_ORD_12345", res.paymentTransactionId());
    }

    @Test
    void checkRegistrationStatus_ByStudentId_Found_ReturnsRegistered() {
        PublicRegistration reg = PublicRegistration.builder()
                .fullName("Parv Agarwal")
                .studentId("2024PUB001")
                .email("parv@example.com")
                .mobileNumber("9876543210")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("CSE")
                .year(3)
                .studentType(StudentType.DAY_SCHOLAR)
                .paymentStatus(PublicRegistrationStatus.REGISTERED)
                .accountVerified(true)
                .build();
        reg.setCreatedAt(java.time.LocalDateTime.now());

        when(publicRegistrationRepository.findTopByStudentIdIgnoreCaseOrderByCreatedAtDesc("2024PUB001"))
                .thenReturn(Optional.of(reg));

        com.cbp7.registration.dto.request.PublicStatusCheckRequest req =
                new com.cbp7.registration.dto.request.PublicStatusCheckRequest("2024PUB001", null);

        com.cbp7.registration.dto.response.PublicStatusCheckResponse res =
                publicRegistrationService.checkRegistrationStatus(req);

        assertNotNull(res);
        assertTrue(res.registrationExists());
        assertEquals("Parv Agarwal", res.fullName());
        assertEquals("2024PUB001", res.studentId());
        assertEquals("CSE", res.department());
        assertEquals("UNDERGRADUATE", res.programLevel());
        assertTrue(res.accountVerified());
        assertNotNull(res.registrationDate());
        assertTrue(res.registrationDate().contains("IST"));
    }

    @Test
    void checkRegistrationStatus_ByMobileNumber_Found_ReturnsRegistered() {
        PublicRegistration reg = PublicRegistration.builder()
                .fullName("John Doe")
                .studentId("2024PUB002")
                .email("john@example.com")
                .mobileNumber("9876543210")
                .programLevel(ProgramLevel.UNDERGRADUATE)
                .department("ECE")
                .year(2)
                .studentType(StudentType.DAY_SCHOLAR)
                .paymentStatus(PublicRegistrationStatus.REGISTERED)
                .accountVerified(true)
                .build();
        reg.setCreatedAt(java.time.LocalDateTime.now());

        when(publicRegistrationRepository.findTopByMobileNumberOrderByCreatedAtDesc("9876543210"))
                .thenReturn(Optional.of(reg));

        com.cbp7.registration.dto.request.PublicStatusCheckRequest req =
                new com.cbp7.registration.dto.request.PublicStatusCheckRequest(null, "9876543210");

        com.cbp7.registration.dto.response.PublicStatusCheckResponse res =
                publicRegistrationService.checkRegistrationStatus(req);

        assertNotNull(res);
        assertTrue(res.registrationExists());
        assertEquals("John Doe", res.fullName());
        assertTrue(res.accountVerified());
    }

    @Test
    void checkRegistrationStatus_NotFound_ReturnsNotRegistered() {
        when(publicRegistrationRepository.findTopByStudentIdIgnoreCaseOrderByCreatedAtDesc("UNKNOWN"))
                .thenReturn(Optional.empty());

        com.cbp7.registration.dto.request.PublicStatusCheckRequest req =
                new com.cbp7.registration.dto.request.PublicStatusCheckRequest("UNKNOWN", null);

        com.cbp7.registration.dto.response.PublicStatusCheckResponse res =
                publicRegistrationService.checkRegistrationStatus(req);

        assertNotNull(res);
        assertFalse(res.registrationExists());
        assertNotNull(res.message());
    }

    @Test
    void checkRegistrationStatus_EmptyRequest_ReturnsNotRegistered() {
        com.cbp7.registration.dto.request.PublicStatusCheckRequest req =
                new com.cbp7.registration.dto.request.PublicStatusCheckRequest("", "");

        com.cbp7.registration.dto.response.PublicStatusCheckResponse res =
                publicRegistrationService.checkRegistrationStatus(req);

        assertNotNull(res);
        assertFalse(res.registrationExists());
    }
}
