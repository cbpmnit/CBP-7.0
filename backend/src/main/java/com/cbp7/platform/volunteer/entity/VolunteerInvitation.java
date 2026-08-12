package com.cbp7.platform.volunteer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(
        name = "volunteer_invitations",
        schema = "identity",
        indexes = {
                @Index(name = "idx_volunteer_invitations_email", columnList = "email"),
                @Index(name = "idx_volunteer_invitations_token", columnList = "invitation_token")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column
    private String name;

    @Column(name = "invitation_token", nullable = false, unique = true)
    private String invitationToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VolunteerInvitationStatus status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "email_delivery_status")
    @Builder.Default
    private String emailDeliveryStatus = "SENT";

    @Column(name = "email_failure_reason")
    private String emailFailureReason;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "volunteer_invitation_permissions",
            schema = "identity",
            joinColumns = @JoinColumn(name = "invitation_id")
    )
    @Column(name = "permission")
    @Builder.Default
    private Set<String> permissions = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }
        if (this.status == null) {
            this.status = VolunteerInvitationStatus.PENDING;
        }
        if (this.expiresAt == null) {
            this.expiresAt = LocalDateTime.now().plusDays(7);
        }
        if (this.emailSentAt == null) {
            this.emailSentAt = LocalDateTime.now();
        }
        if (this.emailDeliveryStatus == null) {
            this.emailDeliveryStatus = "SENT";
        }
        if (this.permissions == null) {
            this.permissions = new HashSet<>();
        }
    }
}
