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

    private static final Set<String> DEFAULT_VOLUNTEER_PERMS = Set.of(
            "ATTENDANCE_VIEW",
            "SESSION_VIEW",
            "ATTENDANCE_SCAN",
            "STUDENT_VIEW",
            "PAYMENT_VIEW",
            "EMAIL_SEND"
    );

    /**
     * Case 1 & 2: Check or Invite Volunteer.
     * Case 1: If user already exists in DB -> automatically upgrades role to ROLE_VOLUNTEER,
     * assigns permission scopes into identity.user_permissions, marks invitation ACCEPTED,
     * and sends access confirmation email.
     * Case 2: If user does NOT exist -> creates invitation with token and sends setup email.
     */
    @Transactional
    public VolunteerInviteCheckResponse inviteVolunteer(InviteVolunteerRequest request, String adminId) {
        String email = request.email().trim().toLowerCase();
        String name = request.name() != null && !request.name().isBlank() ? request.name().trim() : email.split("@")[0];

        Set<String> perms = request.permissions() != null && !request.permissions().isEmpty()
                ? new HashSet<>(request.permissions())
                : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);

        // 1. Case 1: Check if user already exists in identity.users
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            log.info("Existing user account found for volunteer invite: email={}, upgrading to ROLE_VOLUNTEER", email);

            // Upgrade role: ROLE_STUDENT to ROLE_VOLUNTEER
            if (!existingUser.hasRole(Role.ROLE_ADMIN)) {
                existingUser.setRole(Role.ROLE_VOLUNTEER);
            }
            existingUser.addRole(Role.ROLE_VOLUNTEER);

            // Store assigned permission scopes in identity.user_permissions
            existingUser.setPermissions(new HashSet<>(perms));
            existingUser.setEnabled(true);
            if (request.name() != null && !request.name().isBlank() && (existingUser.getName() == null || existingUser.getName().isBlank())) {
                existingUser.setName(request.name().trim());
            }
            existingUser = userRepository.save(existingUser);

            // Mark or create invitation as ACCEPTED
            Optional<VolunteerInvitation> existingInv = invitationRepository.findByEmailIgnoreCase(email);
            VolunteerInvitation invitation;
            if (existingInv.isPresent()) {
                invitation = existingInv.get();
                invitation.setStatus(VolunteerInvitationStatus.ACCEPTED);
                invitation.setAcceptedAt(LocalDateTime.now());
                invitation.setPermissions(perms);
            } else {
                invitation = VolunteerInvitation.builder()
                        .email(email)
                        .name(existingUser.getName())
                        .invitationToken("accepted_" + UUID.randomUUID().toString().replace("-", ""))
                        .status(VolunteerInvitationStatus.ACCEPTED)
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .emailSentAt(LocalDateTime.now())
                        .emailDeliveryStatus("SENT")
                        .acceptedAt(LocalDateTime.now())
                        .permissions(perms)
                        .createdBy(adminId != null ? adminId : "admin")
                        .build();
            }
            invitationRepository.save(invitation);

            // Send notification email
            sendVolunteerAccessGrantedEmail(existingUser.getEmail(), existingUser.getName(), perms);

            Set<String> currentRoles = existingUser.getRoles() != null
                    ? existingUser.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
                    : Set.of("ROLE_VOLUNTEER");

            return new VolunteerInviteCheckResponse(
                    true,
                    existingUser.getId() != null ? existingUser.getId().toString() : existingUser.getStudentId(),
                    existingUser.getName(),
                    existingUser.getEmail(),
                    currentRoles,
                    existingUser.getPermissions() != null ? existingUser.getPermissions() : perms,
                    invitation.getId(),
                    invitation.getInvitationToken(),
                    invitation.getStatus(),
                    invitation.getExpiresAt(),
                    null,
                    "Existing user account upgraded to ROLE_VOLUNTEER with assigned permissions."
            );
        }

        // 2. Case 2: New User: Create or update VolunteerInvitation
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

        // 1. Upgrade role: Set primary role to ROLE_VOLUNTEER (unless admin) and add to roles set
        if (!user.hasRole(Role.ROLE_ADMIN)) {
            user.setRole(Role.ROLE_VOLUNTEER);
        }
        user.addRole(Role.ROLE_VOLUNTEER);

        // 2. Set permissions in identity.user_permissions
        Set<String> perms = request.permissions() != null && !request.permissions().isEmpty()
                ? new HashSet<>(request.permissions())
                : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);
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
            inv.setPermissions(perms);
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
                user.getRole().name(),
                Boolean.TRUE.equals(user.getEnabled()) ? "ACTIVE" : "DISABLED",
                user.getPermissions(),
                assignedSessions,
                user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now(),
                user.getUpdatedAt(),
                null
        );
    }

    /**
     * Accept volunteer invitation and assign volunteer role & permission scopes.
     */
    @Transactional
    public AcceptVolunteerInvitationResponse acceptInvitation(AcceptVolunteerInvitationRequest request) {
        String token = request.token() != null ? request.token().trim() : "";
        String rawPassword = request.password() != null ? request.password().trim() : "";

        if (token.isEmpty()) {
            throw new IllegalArgumentException("Invitation token is required");
        }

        VolunteerInvitation invitation = invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired invitation token"));

        if (invitation.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
            throw new InvalidCredentialsException("This invitation has already been accepted and activated");
        }

        if (invitation.getStatus() == VolunteerInvitationStatus.REVOKED) {
            throw new InvalidCredentialsException("This volunteer invitation was revoked by the administrator");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(VolunteerInvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new InvalidCredentialsException("Invitation link has expired. Please request a new invitation from admin");
        }

        String email = invitation.getEmail().trim().toLowerCase();
        String name = invitation.getName() != null && !invitation.getName().isBlank()
                ? invitation.getName().trim()
                : email.split("@")[0];

        Set<String> perms = invitation.getPermissions() != null && !invitation.getPermissions().isEmpty()
                ? new HashSet<>(invitation.getPermissions())
                : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);
        User user;

        if (existingUserOpt.isPresent()) {
            // Case 1: Existing CBP User -> Upgrade role and persist permissions
            user = existingUserOpt.get();
            if (!user.hasRole(Role.ROLE_ADMIN)) {
                user.setRole(Role.ROLE_VOLUNTEER);
            }
            user.addRole(Role.ROLE_VOLUNTEER);
            user.setPermissions(perms);
            if (!rawPassword.isEmpty()) {
                user.setPassword(passwordEncoder.encode(rawPassword));
            }
            user.setEnabled(true);
        } else {
            // Case 2: New User -> Require password and create volunteer account
            if (rawPassword.isEmpty()) {
                throw new IllegalArgumentException("Password is required for new volunteer account activation");
            }

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

        user = userRepository.save(user);

        invitation.setStatus(VolunteerInvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        log.info("Volunteer invitation accepted for {} with role {} and permissions {}", email, user.getRole(), perms);

        return new AcceptVolunteerInvitationResponse(
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getPermissions(),
                "Volunteer account activated successfully! You can now log in."
        );
    }

    /**
     * Backward-compatible setup password method delegating to acceptInvitation.
     */
    @Transactional
    public String setupPassword(VolunteerPasswordSetupRequest request) {
        AcceptVolunteerInvitationResponse res = acceptInvitation(new AcceptVolunteerInvitationRequest(
                request.token(),
                request.password()
        ));
        return res.message();
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
                continue;
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
                    inv.getPermissions() != null ? inv.getPermissions() : DEFAULT_VOLUNTEER_PERMS,
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
                inv.getPermissions() != null ? inv.getPermissions() : DEFAULT_VOLUNTEER_PERMS,
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

        List<User> activeVolunteers = userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_VOLUNTEER))
                .toList();

        for (User u : activeVolunteers) {
            String status = Boolean.TRUE.equals(u.getEnabled()) ? "ACTIVE" : "DISABLED";
            Set<String> perms = u.getPermissions() != null && !u.getPermissions().isEmpty()
                    ? u.getPermissions()
                    : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);

            list.add(new VolunteerListItemResponse(
                    u.getId() != null ? u.getId().toString() : u.getStudentId(),
                    u.getName(),
                    u.getEmail(),
                    u.getRole().name(),
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
                    : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);

            return new VolunteerDetailResponse(
                    u.getId() != null ? u.getId().toString() : u.getStudentId(),
                    u.getName(),
                    u.getEmail(),
                    u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                    u.getRole().name(),
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
                        inv.getPermissions() != null && !inv.getPermissions().isEmpty() ? inv.getPermissions() : DEFAULT_VOLUNTEER_PERMS,
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
                    inv.getPermissions() != null && !inv.getPermissions().isEmpty() ? inv.getPermissions() : DEFAULT_VOLUNTEER_PERMS,
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
            if (!u.hasRole(Role.ROLE_ADMIN)) {
                u.setRole(Role.ROLE_VOLUNTEER);
            }
            u.addRole(Role.ROLE_VOLUNTEER);
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

    @Transactional(readOnly = true)
    public byte[] exportVolunteersCsv(String search, String statusFilter) {
        List<VolunteerListItemResponse> list = getAllVolunteers();

        String q = search != null ? search.trim().toLowerCase() : "";
        String sFilter = statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)
                ? statusFilter.trim().toUpperCase() : null;

        List<String> headers = List.of(
                "Volunteer ID / Student ID", "Name", "Email", "Role",
                "Status", "Assigned Permissions", "Registered / Invited Date"
        );

        List<List<String>> rows = new ArrayList<>();
        for (VolunteerListItemResponse v : list) {
            if (!q.isEmpty()) {
                boolean match = (v.name() != null && v.name().toLowerCase().contains(q))
                        || (v.email() != null && v.email().toLowerCase().contains(q))
                        || (v.id() != null && v.id().toLowerCase().contains(q));
                if (!match) continue;
            }

            if (sFilter != null && !sFilter.equalsIgnoreCase(v.status())) {
                continue;
            }

            String permsStr = v.permissions() != null ? String.join("; ", v.permissions()) : "NONE";

            rows.add(List.of(
                    v.id() != null ? v.id() : "",
                    v.name() != null ? v.name() : "",
                    v.email() != null ? v.email() : "",
                    v.role() != null ? v.role() : "ROLE_VOLUNTEER",
                    v.status() != null ? v.status() : "ACTIVE",
                    permsStr,
                    v.createdAt() != null ? v.createdAt().toString() : ""
            ));
        }

        return com.cbp7.common.util.CsvExportUtil.generateCsv(headers, rows);
    }
}
