package com.cbp7.registration.entity;

import com.cbp7.identity.auth.entity.BaseEntity;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.registration.enums.PublicRegistrationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "public_registrations", schema = "registration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PublicRegistration extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String email;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "program_level", nullable = false)
    private ProgramLevel programLevel;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(name = "student_type", nullable = false)
    private StudentType studentType;

    @Column
    private String address;

    @Column(name = "hostel_number")
    private String hostelNumber;

    @Column(name = "room_number")
    private String roomNumber;

    @Column
    private String expectations;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PublicRegistrationStatus paymentStatus = PublicRegistrationStatus.PENDING;

    @Column(name = "payment_transaction_id")
    private String paymentTransactionId;
}
