package com.cbp7.volunteer.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.config.FrontendProperties;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.volunteer.dto.*;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.volunteer.repository.VolunteerInvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VolunteerInvitationService {

    private final VolunteerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;
    private final FrontendProperties frontendProperties;

    /**
     * Case A & B: Check or Invite Volunteer.
     * If user already exists in DB -> returns exists=true with user details so admin can grant access directly.
     * If user does NOT exist -> creates invitation, generates setup token, and sends invitation email.
     */
    @Transactional
    public VolunteerInviteCheckResponse inviteVolunteer(InviteVolunteerRequest request, String adminId) {
        String email = request.email().trim().toLowerCase();
        String name = request.name() != null && !request.name().isBlank() ? request.name().trim() : email.split("@")[0];

        Set<String> perms = request.permissions() != null && !request.permissions().isEmpty()
                ? new HashSet<>(request.permissions())
                : new HashSet<>(List.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"));

        // 1. Check if user already exists in identity.users
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            log.info("Existing user account found for volunteer invite check: email={}, currentRole={}", email, existingUser.getRole());

            Set<String> currentRoles = new HashSet<>();
            if (existingUser.getRoles() != null && !existingUser.getRoles().isEmpty()) {
                currentRoles = existingUser.getRoles().stream().map(Enum::name).collect(Collectors.toSet());
            } else if (existingUser.getRole() != null) {
                currentRoles.add(existingUser.getRole().name());
            }

            return new VolunteerInviteCheckResponse(
                    true,
                    existingUser.getId() != null ? existingUser.getId().toString() : existingUser.getStudentId(),
                    existingUser.getName(),
                    existingUser.getEmail(),
                    currentRoles,
                    existingUser.getPermissions() != null ? existingUser.getPermissions() : Set.of(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Existing user account found. You can grant volunteer access directly."
            );
        }

        // 2. New User: Create or update VolunteerInvitation
        Optional<VolunteerInvitation> existingInv = invitationRepository.findByEmailIgnoreCase(email);
        VolunteerInvitation invitation;

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusDays(7);

        if (existingInv.isPresent()) {
            invitation = existingInv.get();
            invitation.setName(name);
            invitation.setInvitationToken(token);
            invitation.setStatus(VolunteerInvitationStatus.PENDING);
            invitation.setExpiresAt(expiresAt);
            invitation.setEmailSentAt(now);
            invitation.setEmailDeliveryStatus("SENT");
            invitation.setEmailFailureReason(null);
            invitation.setPermissions(perms);
            invitation.setCreatedBy(adminId != null ? adminId : "admin");
        } else {
            invitation = VolunteerInvitation.builder()
                    .email(email)
                    .name(name)
                    .invitationToken(token)
                    .status(VolunteerInvitationStatus.PENDING)
                    .expiresAt(expiresAt)
                    .emailSentAt(now)
                    .emailDeliveryStatus("SENT")
                    .permissions(perms)
                    .createdBy(adminId != null ? adminId : "admin")
                    .build();
        }

        invitation = invitationRepository.save(invitation);
        String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + token);

        boolean emailSent = sendNewVolunteerInvitationEmail(email, name, activationLink);
        if (!emailSent) {
            invitation.setStatus(VolunteerInvitationStatus.EMAIL_FAILED);
            invitation.setEmailDeliveryStatus("FAILED");
            invitation.setEmailFailureReason("SMTP server unreachable or invalid recipient mailbox");
            invitation = invitationRepository.save(invitation);
        }

        return new VolunteerInviteCheckResponse(
                false,
                null,
                invitation.getName(),
                invitation.getEmail(),
                Set.of(),
                invitation.getPermissions(),
                invitation.getId(),
                invitation.getInvitationToken(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                activationLink,
                emailSent ? "Volunteer invitation created and email sent successfully." : "Invitation created but email delivery failed. You can retry sending from Pending Invitations."
        );
    }

    /**
     * Grant Volunteer role & permission scopes to an existing user without duplicating account.
     */
    @Transactional
    public VolunteerDetailResponse grantVolunteerAccess(GrantVolunteerAccessRequest request, String adminId) {
        String identifier = request.userIdOrEmail().trim().toLowerCase();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentIdIgnoreCase(identifier);
        }
        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(request.userIdOrEmail().trim());
                userOpt = userRepository.findById(uuid);
            } catch (Exception ignored) {}
        }

        if (userOpt.isEmpty()) {
            throw new ResourceNotFoundException("User account not found for identifier: " + request.userIdOrEmail());
        }

        User user = userOpt.get();

        // 1. Add ROLE_VOLUNTEER to roles
        user.addRole(Role.ROLE_VOLUNTEER);

        // 2. Set permissions
        Set<String> perms = request.permissions() != null && !request.permissions().isEmpty()
                ? new HashSet<>(request.permissions())
                : new HashSet<>(List.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"));
        user.setPermissions(perms);

        // 3. Ensure user is enabled
        user.setEnabled(true);

        if (request.name() != null && !request.name().isBlank() && (user.getName() == null || user.getName().isBlank())) {
            user.setName(request.name().trim());
        }

        user = userRepository.save(user);

        // 4. Mark any pending invitation as accepted
        invitationRepository.findByEmailIgnoreCase(user.getEmail()).ifPresent(inv -> {
            inv.setStatus(VolunteerInvitationStatus.ACCEPTED);
            inv.setAcceptedAt(LocalDateTime.now());
            invitationRepository.save(inv);
        });

        log.info("Admin {} granted ROLE_VOLUNTEER to existing user {} with permissions {}", adminId, user.getEmail(), perms);

        // 5. Send notification email
        sendVolunteerAccessGrantedEmail(user.getEmail(), user.getName(), perms);

        Set<String> assignedSessions = request.assignedSessions() != null && !request.assignedSessions().isEmpty()
                ? request.assignedSessions()
                : Set.of("All Workshop Sessions");

        return new VolunteerDetailResponse(
                user.getId() != null ? user.getId().toString() : user.getStudentId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "ROLE_VOLUNTEER",
                Boolean.TRUE.equals(user.getEnabled()) ? "ACTIVE" : "DISABLED",
                user.getPermissions(),
                assignedSessions,
                user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now(),
                user.getUpdatedAt(),
                null
        );
    }

    /**
     * Retrieve all pending, expired, revoked, or failed invitations.
     */
    @Transactional(readOnly = true)
    public List<VolunteerInvitationResponse> getPendingInvitations() {
        List<VolunteerInvitation> all = invitationRepository.findAllByOrderByCreatedAtDesc();
        List<VolunteerInvitationResponse> result = new ArrayList<>();

        for (VolunteerInvitation inv : all) {
            if (inv.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
                continue; // Accepted invitations are in Active Volunteers
            }

            VolunteerInvitationStatus currentStatus = inv.getStatus();
            if (currentStatus == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
                currentStatus = VolunteerInvitationStatus.EXPIRED;
            }

            String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + inv.getInvitationToken());

            result.add(new VolunteerInvitationResponse(
                    inv.getId(),
                    inv.getEmail(),
                    inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                    inv.getInvitationToken(),
                    currentStatus,
                    inv.getCreatedAt(),
                    inv.getExpiresAt(),
                    inv.getEmailSentAt() != null ? inv.getEmailSentAt() : inv.getCreatedAt(),
                    inv.getAcceptedAt(),
                    inv.getEmailDeliveryStatus() != null ? inv.getEmailDeliveryStatus() : "SENT",
                    inv.getEmailFailureReason(),
                    inv.getPermissions() != null ? inv.getPermissions() : Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"),
                    activationLink,
                    inv.getCreatedBy() != null ? inv.getCreatedBy() : "Admin"
            ));
        }

        return result;
    }

    /**
     * Retrieve single invitation details.
     */
    @Transactional(readOnly = true)
    public VolunteerInvitationResponse getInvitationById(UUID invitationId) {
        VolunteerInvitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        VolunteerInvitationStatus currentStatus = inv.getStatus();
        if (currentStatus == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            currentStatus = VolunteerInvitationStatus.EXPIRED;
        }

        String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + inv.getInvitationToken());

        return new VolunteerInvitationResponse(
                inv.getId(),
                inv.getEmail(),
                inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                inv.getInvitationToken(),
                currentStatus,
                inv.getCreatedAt(),
                inv.getExpiresAt(),
                inv.getEmailSentAt() != null ? inv.getEmailSentAt() : inv.getCreatedAt(),
                inv.getAcceptedAt(),
                inv.getEmailDeliveryStatus() != null ? inv.getEmailDeliveryStatus() : "SENT",
                inv.getEmailFailureReason(),
                inv.getPermissions() != null ? inv.getPermissions() : Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"),
                activationLink,
                inv.getCreatedBy() != null ? inv.getCreatedBy() : "Admin"
        );
    }

    /**
     * Resend an invitation: resets token, extends expiry by 7 days, and attempts email dispatch.
     */
    @Transactional
    public VolunteerInvitationResponse resendInvitation(UUID invitationId, String adminId) {
        VolunteerInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        if (invitation.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
            throw new IllegalStateException("Volunteer invitation has already been accepted.");
        }

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        LocalDateTime now = LocalDateTime.now();
        invitation.setInvitationToken(token);
        invitation.setStatus(VolunteerInvitationStatus.PENDING);
        invitation.setExpiresAt(now.plusDays(7));
        invitation.setEmailSentAt(now);
        invitation.setEmailDeliveryStatus("RESENT");
        invitation.setEmailFailureReason(null);
        invitation.setCreatedBy(adminId != null ? adminId : "admin");
        invitation = invitationRepository.save(invitation);

        String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + token);
        boolean emailSent = sendNewVolunteerInvitationEmail(invitation.getEmail(), invitation.getName(), activationLink);
        if (!emailSent) {
            invitation.setStatus(VolunteerInvitationStatus.EMAIL_FAILED);
            invitation.setEmailDeliveryStatus("FAILED");
            invitation.setEmailFailureReason("SMTP server delivery failed during resend attempt");
            invitation = invitationRepository.save(invitation);
        }

        return new VolunteerInvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getName(),
                invitation.getInvitationToken(),
                invitation.getStatus(),
                invitation.getCreatedAt(),
                invitation.getExpiresAt(),
                invitation.getEmailSentAt(),
                invitation.getAcceptedAt(),
                invitation.getEmailDeliveryStatus(),
                invitation.getEmailFailureReason(),
                invitation.getPermissions(),
                activationLink,
                invitation.getCreatedBy()
        );
    }

    /**
     * Revoke an active or pending invitation.
     */
    @Transactional
    public void revokeInvitation(UUID invitationId, String adminId) {
        VolunteerInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        invitation.setStatus(VolunteerInvitationStatus.REVOKED);
        invitation.setInvitationToken("revoked_" + UUID.randomUUID().toString().replace("-", ""));
        invitationRepository.save(invitation);
        log.info("Admin {} revoked volunteer invitation for {}", adminId, invitation.getEmail());
    }

    @Transactional
    public void disableVolunteer(String idOrEmail, String adminId) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(idOrEmail.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentIdIgnoreCase(idOrEmail.trim().toLowerCase());
        }
        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(idOrEmail.trim());
                userOpt = userRepository.findById(uuid);
            } catch (Exception ignored) {}
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
            userRepository.save(user);
            log.info("Admin {} toggled volunteer enabled status to {} for {}", adminId, user.getEnabled(), user.getEmail());
            if (!Boolean.TRUE.equals(user.getEnabled())) {
                sendVolunteerAccessRevokedEmail(user.getEmail(), user.getName());
            }
            return;
        }

        try {
            UUID id = UUID.fromString(idOrEmail);
            revokeInvitation(id, adminId);
            return;
        } catch (Exception ignored) {}

        Optional<VolunteerInvitation> invByEmail = invitationRepository.findByEmailIgnoreCase(idOrEmail.trim().toLowerCase());
        invByEmail.ifPresent(inv -> revokeInvitation(inv.getId(), adminId));
    }

    /**
     * Returns ONLY active registered volunteer users (distinct from pending invitations).
     */
    @Transactional(readOnly = true)
    public List<VolunteerListItemResponse> getAllVolunteers() {
        List<VolunteerListItemResponse> list = new ArrayList<>();

        // Registered Volunteer Users (Users with ROLE_VOLUNTEER in roles set or role field)
        List<User> activeVolunteers = userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_VOLUNTEER))
                .toList();

        for (User u : activeVolunteers) {
            String status = Boolean.TRUE.equals(u.getEnabled()) ? "ACTIVE" : "DISABLED";
            Set<String> perms = u.getPermissions() != null && !u.getPermissions().isEmpty()
                    ? u.getPermissions()
                    : Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW");

            list.add(new VolunteerListItemResponse(
                    u.getId() != null ? u.getId().toString() : u.getStudentId(),
                    u.getName(),
                    u.getEmail(),
                    "ROLE_VOLUNTEER",
                    status,
                    perms,
                    Set.of("All Workshop Sessions"),
                    u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now(),
                    u.getUpdatedAt()
            ));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public VolunteerDetailResponse getVolunteerById(String idOrEmail) {
        String clean = idOrEmail.trim().toLowerCase();

        // 1. Registered user
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(clean);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentIdIgnoreCase(clean);
        }
        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(idOrEmail.trim());
                userOpt = userRepository.findById(uuid);
            } catch (Exception ignored) {}
        }

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            String status = Boolean.TRUE.equals(u.getEnabled()) ? "ACTIVE" : "DISABLED";
            Set<String> perms = u.getPermissions() != null && !u.getPermissions().isEmpty()
                    ? u.getPermissions()
                    : Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW");

            return new VolunteerDetailResponse(
                    u.getId() != null ? u.getId().toString() : u.getStudentId(),
                    u.getName(),
                    u.getEmail(),
                    u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                    "ROLE_VOLUNTEER",
                    status,
                    perms,
                    Set.of("All Active Workshop Sessions"),
                    u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now(),
                    u.getUpdatedAt(),
                    null
            );
        }

        // 2. Invitation
        try {
            UUID uuid = UUID.fromString(idOrEmail.trim());
            Optional<VolunteerInvitation> invOpt = invitationRepository.findById(uuid);
            if (invOpt.isPresent()) {
                VolunteerInvitation inv = invOpt.get();
                String status = inv.getStatus().name();
                if (inv.getStatus() == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
                    status = "EXPIRED";
                }
                String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + inv.getInvitationToken());
                return new VolunteerDetailResponse(
                        inv.getId().toString(),
                        inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                        inv.getEmail(),
                        "",
                        "ROLE_VOLUNTEER",
                        status,
                        inv.getPermissions() != null && !inv.getPermissions().isEmpty() ? inv.getPermissions() : Set.of("ATTENDANCE_SCAN"),
                        Set.of("Gate Access Verification"),
                        inv.getCreatedAt() != null ? inv.getCreatedAt() : LocalDateTime.now(),
                        null,
                        activationLink
                );
            }
        } catch (Exception ignored) {}

        Optional<VolunteerInvitation> invByEmail = invitationRepository.findByEmailIgnoreCase(clean);
        if (invByEmail.isPresent()) {
            VolunteerInvitation inv = invByEmail.get();
            String status = inv.getStatus().name();
            if (inv.getStatus() == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
                status = "EXPIRED";
            }
            String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + inv.getInvitationToken());
            return new VolunteerDetailResponse(
                    inv.getId().toString(),
                    inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                    inv.getEmail(),
                    "",
                    "ROLE_VOLUNTEER",
                    status,
                    inv.getPermissions() != null && !inv.getPermissions().isEmpty() ? inv.getPermissions() : Set.of("ATTENDANCE_SCAN"),
                    Set.of("Gate Access Verification"),
                    inv.getCreatedAt() != null ? inv.getCreatedAt() : LocalDateTime.now(),
                    null,
                    activationLink
            );
        }

        throw new ResourceNotFoundException("Volunteer record not found for: " + idOrEmail);
    }

    @Transactional
    public VolunteerDetailResponse updateVolunteerPermissions(String idOrEmail, UpdateVolunteerPermissionsRequest request) {
        String clean = idOrEmail.trim().toLowerCase();
        Set<String> newPerms = request.permissions() != null ? request.permissions() : Set.of();

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(clean);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentIdIgnoreCase(clean);
        }
        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(idOrEmail.trim());
                userOpt = userRepository.findById(uuid);
            } catch (Exception ignored) {}
        }

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            u.setPermissions(new HashSet<>(newPerms));
            userRepository.save(u);
            log.info("Updated permission scopes for volunteer user {}", u.getEmail());
            sendVolunteerPermissionsUpdatedEmail(u.getEmail(), u.getName(), newPerms);
            return getVolunteerById(clean);
        }

        try {
            UUID uuid = UUID.fromString(idOrEmail.trim());
            Optional<VolunteerInvitation> invOpt = invitationRepository.findById(uuid);
            if (invOpt.isPresent()) {
                VolunteerInvitation inv = invOpt.get();
                inv.setPermissions(new HashSet<>(newPerms));
                invitationRepository.save(inv);
                log.info("Updated permission scopes for volunteer invitation {}", inv.getEmail());
                return getVolunteerById(clean);
            }
        } catch (Exception ignored) {}

        Optional<VolunteerInvitation> invByEmail = invitationRepository.findByEmailIgnoreCase(clean);
        if (invByEmail.isPresent()) {
            VolunteerInvitation inv = invByEmail.get();
            inv.setPermissions(new HashSet<>(newPerms));
            invitationRepository.save(inv);
            log.info("Updated permission scopes for volunteer invitation {}", inv.getEmail());
            return getVolunteerById(clean);
        }

        throw new ResourceNotFoundException("Volunteer record not found for: " + idOrEmail);
    }

    @Transactional
    public VerifyInvitationResponse verifyInvitation(String token) {
        if (token == null || token.isBlank()) {
            return new VerifyInvitationResponse(null, null, false, "Invitation token is required");
        }

        Optional<VolunteerInvitation> opt = invitationRepository.findByInvitationToken(token.trim());
        if (opt.isEmpty()) {
            return new VerifyInvitationResponse(null, null, false, "Invalid or unrecognized invitation link");
        }

        VolunteerInvitation inv = opt.get();
        if (inv.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
            return new VerifyInvitationResponse(inv.getEmail(), inv.getName(), false, "This invitation has already been accepted and activated");
        }

        if (inv.getStatus() == VolunteerInvitationStatus.REVOKED) {
            return new VerifyInvitationResponse(inv.getEmail(), inv.getName(), false, "This volunteer invitation was revoked by the administrator");
        }

        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            inv.setStatus(VolunteerInvitationStatus.EXPIRED);
            invitationRepository.save(inv);
            return new VerifyInvitationResponse(inv.getEmail(), inv.getName(), false, "This invitation link has expired. Please request a new invitation from admin");
        }

        return new VerifyInvitationResponse(inv.getEmail(), inv.getName(), true, "Invitation verified successfully");
    }

    @Transactional
    public String setupPassword(VolunteerPasswordSetupRequest request) {
        String token = request.token() != null ? request.token().trim() : "";
        String rawPassword = request.password() != null ? request.password().trim() : "";

        if (token.isEmpty() || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Token and password are required");
        }

        VolunteerInvitation invitation = invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired invitation token"));

        if (invitation.getStatus() != VolunteerInvitationStatus.PENDING) {
            throw new InvalidCredentialsException("Invitation is no longer active (status: " + invitation.getStatus() + ")");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(VolunteerInvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new InvalidCredentialsException("Invitation link has expired");
        }

        String email = invitation.getEmail().trim().toLowerCase();
        String name = invitation.getName() != null && !invitation.getName().isBlank()
                ? invitation.getName().trim()
                : email.split("@")[0];

        Set<String> perms = invitation.getPermissions() != null && !invitation.getPermissions().isEmpty()
                ? new HashSet<>(invitation.getPermissions())
                : new HashSet<>(List.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"));

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            user.addRole(Role.ROLE_VOLUNTEER);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setPermissions(perms);
            user.setEnabled(true);
        } else {
            String baseId = "vol_" + email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            String studentId = baseId;
            int count = 1;
            while (userRepository.existsByStudentId(studentId)) {
                studentId = baseId + count++;
            }

            user = User.builder()
                    .studentId(studentId)
                    .email(email)
                    .name(name)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(Role.ROLE_VOLUNTEER)
                    .roles(new HashSet<>(List.of(Role.ROLE_VOLUNTEER)))
                    .enabled(true)
                    .permissions(perms)
                    .build();
        }

        userRepository.save(user);

        invitation.setStatus(VolunteerInvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        log.info("Volunteer account activated for {} with permissions {}", email, perms);
        return "Volunteer account activated successfully! You can now log in with your email or Student ID.";
    }

    // --- EMAIL DISPATCH TEMPLATES ---

    private boolean sendNewVolunteerInvitationEmail(String email, String name, String activationLink) {
        try {
            String subject = "CBP 7.0 Volunteer Invitation";
            String body = String.format(
                    "Hello %s,\n\n" +
                    "You have been invited as a volunteer for the CBP 7.0 Soft Skills Development Program at MNIT Jaipur.\n\n" +
                    "Activate your account and set your password here:\n%s\n\n" +
                    "This invitation link expires in 7 days.\n\n" +
                    "Best regards,\nCBP 7.0 Organizing Team\nMNIT Jaipur",
                    name,
                    activationLink
            );

            emailSender.sendEmail(email, subject, body);
            log.info("Sent volunteer invitation email to {}", email);
            return true;
        } catch (Exception e) {
            log.warn("Failed to send volunteer invitation email to {}: {}", email, e.getMessage());
            return false;
        }
    }

    private void sendVolunteerAccessGrantedEmail(String email, String name, Set<String> permissions) {
        try {
            String subject = "CBP 7.0 Volunteer Access Granted";
            String permsList = permissions.stream().map(p -> " • " + p).collect(Collectors.joining("\n"));
            String body = String.format(
                    "Hello %s,\n\n" +
                    "Your CBP 7.0 account has been granted volunteer privileges for the Soft Skills Development Program at MNIT Jaipur.\n\n" +
                    "Assigned Permission Scopes:\n%s\n\n" +
                    "You can log in directly using your existing CBP 7.0 credentials at:\n%s/login\n\n" +
                    "Best regards,\nCBP 7.0 Organizing Team\nMNIT Jaipur",
                    name,
                    permsList,
                    frontendProperties.getUrl()
            );

            emailSender.sendEmail(email, subject, body);
            log.info("Sent volunteer access granted notification to {}", email);
        } catch (Exception e) {
            log.warn("Failed to send access granted email to {}: {}", email, e.getMessage());
        }
    }

    private void sendVolunteerPermissionsUpdatedEmail(String email, String name, Set<String> permissions) {
        try {
            String subject = "CBP 7.0 Volunteer Permissions Updated";
            String permsList = permissions.stream().map(p -> " • " + p).collect(Collectors.joining("\n"));
            String body = String.format(
                    "Hello %s,\n\n" +
                    "Your operational volunteer permissions for CBP 7.0 have been updated by the administrator.\n\n" +
                    "Updated Scopes:\n%s\n\n" +
                    "Log in to your portal to access your assigned modules: %s/login\n\n" +
                    "Best regards,\nCBP 7.0 Organizing Team\nMNIT Jaipur",
                    name,
                    permsList,
                    frontendProperties.getUrl()
            );

            emailSender.sendEmail(email, subject, body);
            log.info("Sent volunteer permission update email to {}", email);
        } catch (Exception e) {
            log.warn("Failed to send permission update email to {}: {}", email, e.getMessage());
        }
    }

    private void sendVolunteerAccessRevokedEmail(String email, String name) {
        try {
            String subject = "CBP 7.0 Volunteer Access Status";
            String body = String.format(
                    "Hello %s,\n\n" +
                    "Your volunteer access permissions for CBP 7.0 have been temporarily deactivated by the program administration.\n\n" +
                    "If you believe this is in error, please contact the CBP 7.0 organizing committee.\n\n" +
                    "Best regards,\nCBP 7.0 Organizing Team\nMNIT Jaipur",
                    name
            );

            emailSender.sendEmail(email, subject, body);
            log.info("Sent volunteer access revoked email to {}", email);
        } catch (Exception e) {
            log.warn("Failed to send access revoked email to {}: {}", email, e.getMessage());
        }
    }
}
