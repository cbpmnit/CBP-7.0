package com.cbp7.auth.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "users",
    schema = "identity"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity implements java.security.Principal {

    @Column(name = "student_id", unique = true, nullable = true)
    private String studentId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean enabled;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "user_permissions",
        schema = "identity",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "permission")
    @Builder.Default
    private Set<String> permissions = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (this.studentId != null) {
            String trimmed = this.studentId.trim();
            this.studentId = trimmed.isEmpty() ? null : trimmed.toLowerCase();
        }
        if (this.email != null) {
            this.email = this.email.toLowerCase().trim();
        }
        if (this.enabled == null) {
            this.enabled = true;
        }
        if (this.authProvider == null) {
            this.authProvider = AuthProvider.LOCAL;
        }
        if (this.permissions == null) {
            this.permissions = new HashSet<>();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.studentId != null) {
            String trimmed = this.studentId.trim();
            this.studentId = trimmed.isEmpty() ? null : trimmed.toLowerCase();
        }
        if (this.email != null) {
            this.email = this.email.toLowerCase().trim();
        }
    }
}
