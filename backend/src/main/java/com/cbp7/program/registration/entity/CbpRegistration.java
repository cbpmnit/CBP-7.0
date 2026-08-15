package com.cbp7.program.registration.entity;

import com.cbp7.identity.auth.entity.BaseEntity;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.entity.UserProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "registrations", schema = "program")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CbpRegistration extends BaseEntity {

    @Column(name = "registration_id", nullable = false, unique = true)
    private String registrationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private UserProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false)
    private RegistrationStatus registrationStatus;

    // Snapshot fields copied from User & UserProfile at registration time
    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String institute;

    @Column(name = "program_level", nullable = false)
    private String programLevel;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Column
    private String section;

    @Column(name = "student_type")
    private String studentType;

    @Column
    private String address;

    @Column(name = "hostel_number")
    private String hostelNumber;

    @Column(nullable = false)
    private Boolean hosteller;

    @Column(name = "room_number")
    private String roomNumber;

    @Column
    private String city;

    @Column
    private String state;
}
