package com.cbp7.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "users",
    schema = "cbp"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean enabled;

    @PrePersist
    protected void onCreate() {
        if (this.studentId != null) {
            this.studentId = this.studentId.toLowerCase().trim();
        }
        if (this.email != null) {
            this.email = this.email.toLowerCase().trim();
        }
        if (this.enabled == null) {
            this.enabled = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.studentId != null) {
            this.studentId = this.studentId.toLowerCase().trim();
        }
        if (this.email != null) {
            this.email = this.email.toLowerCase().trim();
        }
    }
}
