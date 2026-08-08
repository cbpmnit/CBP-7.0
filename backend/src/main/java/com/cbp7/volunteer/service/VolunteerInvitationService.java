package com.cbp7.volunteer.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.volunteer.dto.*;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.volunteer.repository.VolunteerInvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VolunteerInvitationService {

    private final VolunteerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public VolunteerInvitationResponse inviteVolunteer(InviteVolunteerRequest request, String adminId) {
        String email = request.email().trim().toLowerCase();
        String name = request.name() != null && !request.name().isBlank() ? request.name().trim() : email.split("@")[0];

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A registered user account already exists with email: " + email);
        }

        // Clean up or revoke previous pending invitations for this email
        Optional<VolunteerInvitation> existing = invitationRepository.findByEmailIgnoreCase(email);
        VolunteerInvitation invitation;

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusHours(24);

        if (existing.isPresent()) {
            invitation = existing.get();
            invitation.setName(name);
            invitation.setInvitationToken(token);
            invitation.setStatus(VolunteerInvitationStatus.PENDING);
            invitation.setExpiresAt(expiresAt);
            invitation.setCreatedBy(adminId != null ? adminId : "admin");
        } else {
            invitation = VolunteerInvitation.builder()
                    .email(email)
                    .name(name)
                    .invitationToken(token)
                    .status(VolunteerInvitationStatus.PENDING)
                    .expiresAt(expiresAt)
                    .createdBy(adminId != null ? adminId : "admin")
                    .build();
        }

        invitation = invitationRepository.save(invitation);
        String activationLink = frontendUrl + "/volunteer/setup-password?token=" + token;

        // Dispatch invitation email
        sendInvitationEmail(email, name, activationLink);

        return new VolunteerInvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getName(),
                invitation.getInvitationToken(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                activationLink
        );
    }

    @Transactional
    public VolunteerInvitationResponse resendInvitation(UUID invitationId, String adminId) {
        VolunteerInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        if (invitation.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
            throw new IllegalStateException("Volunteer invitation has already been accepted.");
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        invitation.setInvitationToken(token);
        invitation.setStatus(VolunteerInvitationStatus.PENDING);
        invitation.setExpiresAt(LocalDateTime.now().plusHours(24));
        invitation.setCreatedBy(adminId != null ? adminId : "admin");
        invitation = invitationRepository.save(invitation);

        String activationLink = frontendUrl + "/volunteer/setup-password?token=" + token;
        sendInvitationEmail(invitation.getEmail(), invitation.getName(), activationLink);

        return new VolunteerInvitationResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getName(),
                invitation.getInvitationToken(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                activationLink
        );
    }

    @Transactional
    public void disableVolunteer(String idOrEmail, String adminId) {
        // Check in users table
        Optional<User> userOpt = userRepository.findByEmail(idOrEmail.trim().toLowerCase());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(false);
            userRepository.save(user);
            log.info("Admin {} disabled volunteer account {}", adminId, user.getEmail());
            return;
        }

        // Check in invitations
        try {
            UUID id = UUID.fromString(idOrEmail);
            Optional<VolunteerInvitation> invOpt = invitationRepository.findById(id);
            if (invOpt.isPresent()) {
                VolunteerInvitation inv = invOpt.get();
                inv.setStatus(VolunteerInvitationStatus.REVOKED);
                invitationRepository.save(inv);
                return;
            }
        } catch (Exception ignored) {}

        Optional<VolunteerInvitation> invByEmail = invitationRepository.findByEmailIgnoreCase(idOrEmail.trim().toLowerCase());
        invByEmail.ifPresent(inv -> {
            inv.setStatus(VolunteerInvitationStatus.REVOKED);
            invitationRepository.save(inv);
        });
    }

    @Transactional(readOnly = true)
    public List<VolunteerListItemResponse> getAllVolunteers() {
        List<VolunteerListItemResponse> list = new ArrayList<>();
        Set<String> processedEmails = new HashSet<>();

        // 1. Registered Volunteer Users
        List<User> activeVolunteers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_VOLUNTEER)
                .toList();

        for (User u : activeVolunteers) {
            String status = Boolean.TRUE.equals(u.getEnabled()) ? "ACTIVE" : "DISABLED";
            list.add(new VolunteerListItemResponse(
                    u.getId() != null ? u.getId().toString() : u.getStudentId(),
                    u.getName(),
                    u.getEmail(),
                    "ROLE_VOLUNTEER",
                    status,
                    u.getCreatedAt() != null ? u.getCreatedAt() : LocalDateTime.now()
            ));
            processedEmails.add(u.getEmail().toLowerCase());
        }

        // 2. Pending / Inviting Volunteers
        List<VolunteerInvitation> invitations = invitationRepository.findAllByOrderByCreatedAtDesc();
        for (VolunteerInvitation inv : invitations) {
            if (!processedEmails.contains(inv.getEmail().toLowerCase())) {
                String status = inv.getStatus().name();
                if (inv.getStatus() == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
                    status = "EXPIRED";
                }
                list.add(new VolunteerListItemResponse(
                        inv.getId().toString(),
                        inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                        inv.getEmail(),
                        "ROLE_VOLUNTEER",
                        status,
                        inv.getCreatedAt() != null ? inv.getCreatedAt() : LocalDateTime.now()
                ));
            }
        }

        return list;
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

        // Unique studentId/identifier for login
        String baseId = "vol_" + email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String studentId = baseId;
        int count = 1;
        while (userRepository.existsByStudentId(studentId)) {
            studentId = baseId + count++;
        }

        User user = User.builder()
                .studentId(studentId)
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.ROLE_VOLUNTEER)
                .enabled(true)
                .build();

        userRepository.save(user);

        invitation.setStatus(VolunteerInvitationStatus.ACCEPTED);
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        log.info("Volunteer account activated for {} (ID: {})", email, studentId);
        return "Volunteer account activated successfully! You can now log in with your email or Student ID: " + studentId;
    }

    private void sendInvitationEmail(String email, String name, String activationLink) {
        try {
            String subject = "CBP 7.0 Volunteer Invitation";
            String body = String.format(
                    "Hello %s,\n\n" +
                    "You have been invited as a volunteer for the CBP 7.0 Soft Skills Development Program at MNIT Jaipur.\n\n" +
                    "Activate your account and set your password here:\n%s\n\n" +
                    "This invitation link expires in 24 hours.\n\n" +
                    "Best regards,\nCBP 7.0 Organizing Team\nMNIT Jaipur",
                    name,
                    activationLink
            );

            emailSender.sendEmail(email, subject, body);
            log.info("Sent volunteer invitation email to {}", email);
        } catch (Exception e) {
            log.warn("Failed to send volunteer invitation email to {}: {}", email, e.getMessage());
        }
    }
}
