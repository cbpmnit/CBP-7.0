package com.cbp7.platform.volunteer.service.impl;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.common.config.FrontendProperties;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.volunteer.dto.request.*;
import com.cbp7.platform.volunteer.dto.response.*;
import com.cbp7.platform.volunteer.entity.VolunteerInvitation;
import com.cbp7.platform.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.platform.volunteer.helper.VolunteerAccountProvisioner;
import com.cbp7.platform.volunteer.helper.VolunteerCsvExporter;
import com.cbp7.platform.volunteer.helper.VolunteerEmailHelper;
import com.cbp7.platform.volunteer.mapper.VolunteerMapper;
import com.cbp7.platform.volunteer.repository.VolunteerInvitationRepository;
import com.cbp7.platform.volunteer.resolver.VolunteerIdentityResolver;
import com.cbp7.platform.volunteer.service.VolunteerInvitationService;
import com.cbp7.platform.volunteer.validation.VolunteerValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VolunteerInvitationServiceImpl implements VolunteerInvitationService {

    private final VolunteerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final FrontendProperties frontendProperties;
    private final VolunteerEmailHelper volunteerEmailHelper;
    private final VolunteerValidator volunteerValidator;
    private final VolunteerMapper volunteerMapper;
    private final VolunteerIdentityResolver identityResolver;
    private final VolunteerAccountProvisioner accountProvisioner;
    private final VolunteerCsvExporter csvExporter;

    private static final Set<String> DEFAULT_VOLUNTEER_PERMS = Set.of(
            "ATTENDANCE_VIEW",
            "SESSION_VIEW",
            "ATTENDANCE_SCAN",
            "STUDENT_VIEW",
            "PAYMENT_VIEW",
            "EMAIL_SEND"
    );

    @Override
    @Transactional
    public VolunteerInviteCheckResponse inviteVolunteer(InviteVolunteerRequest request, String adminId) {
        String email = request.email().trim().toLowerCase();
        String name = request.name() != null && !request.name().isBlank() ? request.name().trim() : email.split("@")[0];
        Set<String> perms = resolvePermissions(request.permissions());

        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);
        if (existingUserOpt.isPresent()) {
            return processExistingUserInvite(existingUserOpt.get(), email, request.name(), perms, adminId);
        }

        return processNewUserInvite(email, name, perms, adminId);
    }

    @Override
    @Transactional
    public VolunteerDetailResponse grantVolunteerAccess(GrantVolunteerAccessRequest request, String adminId) {
        String identifier = request.userIdOrEmail().trim().toLowerCase();
        User user = identityResolver.findUserByIdentifier(identifier);

        accountProvisioner.upgradeUserToVolunteer(user, request.name(), resolvePermissions(request.permissions()));
        markPendingInvitationAccepted(user.getEmail(), user.getPermissions());

        log.info("Admin {} granted ROLE_VOLUNTEER to existing user {} with permissions {}", adminId, user.getEmail(), user.getPermissions());
        volunteerEmailHelper.sendVolunteerAccessGrantedEmail(user.getEmail(), user.getName(), user.getPermissions());

        Set<String> assignedSessions = request.assignedSessions() != null && !request.assignedSessions().isEmpty()
                ? request.assignedSessions()
                : Set.of("All Workshop Sessions");

        return volunteerMapper.toVolunteerDetailResponse(user, DEFAULT_VOLUNTEER_PERMS, assignedSessions);
    }

    @Override
    @Transactional
    public AcceptVolunteerInvitationResponse acceptInvitation(AcceptVolunteerInvitationRequest request) {
        String token = request.token() != null ? request.token().trim() : "";
        if (token.isEmpty()) {
            throw new IllegalArgumentException("Invitation token is required");
        }

        VolunteerInvitation invitation = invitationRepository.findByInvitationToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired invitation token"));

        String email = invitation.getEmail().trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(email);

        try {
            volunteerValidator.validateAcceptance(invitation, request.password(), existingUserOpt.isPresent());
        } catch (InvalidCredentialsException e) {
            if (invitation.getStatus() == VolunteerInvitationStatus.EXPIRED) {
                invitationRepository.save(invitation);
            }
            throw e;
        }

        Set<String> perms = invitation.getPermissions() != null && !invitation.getPermissions().isEmpty()
                ? new HashSet<>(invitation.getPermissions())
                : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);

        User user = existingUserOpt.isPresent()
                ? accountProvisioner.activateExistingUser(existingUserOpt.get(), perms, request.password())
                : accountProvisioner.createNewVolunteerUser(email, invitation.getName(), perms, request.password());

        invitation.setStatus(VolunteerInvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        log.info("Volunteer invitation accepted for {} with role {} and permissions {}", email, user.getRole(), perms);
        return volunteerMapper.toAcceptInvitationResponse(user);
    }

    @Override
    @Transactional
    public String setupPassword(VolunteerPasswordSetupRequest request) {
        AcceptVolunteerInvitationResponse res = acceptInvitation(new AcceptVolunteerInvitationRequest(
                request.token(),
                request.password()
        ));
        return res.message();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerInvitationResponse> getPendingInvitations() {
        List<VolunteerInvitation> all = invitationRepository.findAllByOrderByCreatedAtDesc();
        List<VolunteerInvitationResponse> result = new ArrayList<>();

        for (VolunteerInvitation inv : all) {
            if (inv.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
                continue;
            }
            result.add(volunteerMapper.toVolunteerInvitationResponse(inv, DEFAULT_VOLUNTEER_PERMS));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerInvitationResponse getInvitationById(UUID invitationId) {
        VolunteerInvitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        return volunteerMapper.toVolunteerInvitationResponse(inv, DEFAULT_VOLUNTEER_PERMS);
    }

    @Override
    @Transactional
    public VolunteerInvitationResponse resendInvitation(UUID invitationId, String adminId) {
        VolunteerInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        if (invitation.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
            throw new IllegalStateException("Volunteer invitation has already been accepted.");
        }

        String token = generateToken();
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
        boolean emailSent = volunteerEmailHelper.sendNewVolunteerInvitationEmail(invitation.getEmail(), invitation.getName(), activationLink);
        if (!emailSent) {
            invitation.setStatus(VolunteerInvitationStatus.EMAIL_FAILED);
            invitation.setEmailDeliveryStatus("FAILED");
            invitation.setEmailFailureReason("SMTP server delivery failed during resend attempt");
            invitation = invitationRepository.save(invitation);
        }

        return volunteerMapper.toVolunteerInvitationResponse(invitation, DEFAULT_VOLUNTEER_PERMS);
    }

    @Override
    @Transactional
    public void revokeInvitation(UUID invitationId, String adminId) {
        VolunteerInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer invitation not found with ID: " + invitationId));

        invitation.setStatus(VolunteerInvitationStatus.REVOKED);
        invitation.setInvitationToken("revoked_" + UUID.randomUUID().toString().replace("-", ""));
        invitationRepository.save(invitation);
        log.info("Admin {} revoked volunteer invitation for {}", adminId, invitation.getEmail());
    }

    @Override
    @Transactional
    public void disableVolunteer(String idOrEmail, String adminId) {
        String clean = idOrEmail.trim().toLowerCase();
        Optional<User> userOpt = identityResolver.findOptionalUser(clean);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
            userRepository.save(user);
            log.info("Admin {} toggled volunteer enabled status to {} for {}", adminId, user.getEnabled(), user.getEmail());
            if (!Boolean.TRUE.equals(user.getEnabled())) {
                volunteerEmailHelper.sendVolunteerAccessRevokedEmail(user.getEmail(), user.getName());
            }
            return;
        }

        try {
            UUID id = UUID.fromString(idOrEmail);
            revokeInvitation(id, adminId);
            return;
        } catch (Exception ignored) {}

        invitationRepository.findByEmailIgnoreCase(clean).ifPresent(inv -> revokeInvitation(inv.getId(), adminId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VolunteerListItemResponse> getAllVolunteers() {
        return userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_VOLUNTEER))
                .map(u -> volunteerMapper.toVolunteerListItemResponse(u, DEFAULT_VOLUNTEER_PERMS))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerDetailResponse getVolunteerById(String idOrEmail) {
        String clean = idOrEmail.trim().toLowerCase();

        Optional<User> userOpt = identityResolver.findOptionalUser(clean);
        if (userOpt.isPresent()) {
            return volunteerMapper.toVolunteerDetailResponse(userOpt.get(), DEFAULT_VOLUNTEER_PERMS, Set.of("All Active Workshop Sessions"));
        }

        Optional<VolunteerInvitation> invOpt = identityResolver.findOptionalInvitation(clean);
        if (invOpt.isPresent()) {
            return volunteerMapper.toVolunteerDetailResponse(invOpt.get(), DEFAULT_VOLUNTEER_PERMS);
        }

        throw new ResourceNotFoundException("Volunteer record not found for: " + idOrEmail);
    }

    @Override
    @Transactional
    public VolunteerDetailResponse updateVolunteerPermissions(String idOrEmail, UpdateVolunteerPermissionsRequest request) {
        String clean = idOrEmail.trim().toLowerCase();
        Set<String> newPerms = request.permissions() != null ? request.permissions() : Set.of();

        Optional<User> userOpt = identityResolver.findOptionalUser(clean);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            u.setPermissions(new HashSet<>(newPerms));
            if (!u.hasRole(Role.ROLE_ADMIN)) {
                u.setRole(Role.ROLE_VOLUNTEER);
            }
            u.addRole(Role.ROLE_VOLUNTEER);
            userRepository.save(u);
            log.info("Updated permission scopes for volunteer user {}", u.getEmail());
            volunteerEmailHelper.sendVolunteerPermissionsUpdatedEmail(u.getEmail(), u.getName(), newPerms);
            return getVolunteerById(clean);
        }

        Optional<VolunteerInvitation> invOpt = identityResolver.findOptionalInvitation(clean);
        if (invOpt.isPresent()) {
            VolunteerInvitation inv = invOpt.get();
            inv.setPermissions(new HashSet<>(newPerms));
            invitationRepository.save(inv);
            log.info("Updated permission scopes for volunteer invitation {}", inv.getEmail());
            return getVolunteerById(clean);
        }

        throw new ResourceNotFoundException("Volunteer record not found for: " + idOrEmail);
    }

    @Override
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

    @Override
    @Transactional(readOnly = true)
    public byte[] exportVolunteersCsv(String search, String statusFilter) {
        List<VolunteerListItemResponse> list = getAllVolunteers();
        return csvExporter.exportVolunteersCsv(list, search, statusFilter);
    }

    // --- Private Helper Methods ---

    private Set<String> resolvePermissions(Set<String> requested) {
        return requested != null && !requested.isEmpty()
                ? new HashSet<>(requested)
                : new HashSet<>(DEFAULT_VOLUNTEER_PERMS);
    }

    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private VolunteerInviteCheckResponse processExistingUserInvite(User existingUser, String email, String reqName, Set<String> perms, String adminId) {
        log.info("Existing user account found for volunteer invite: email={}, upgrading to ROLE_VOLUNTEER", email);

        accountProvisioner.upgradeUserToVolunteer(existingUser, reqName, perms);

        VolunteerInvitation invitation = saveOrUpdateAcceptedInvitation(email, existingUser.getName(), perms, adminId);
        volunteerEmailHelper.sendVolunteerAccessGrantedEmail(existingUser.getEmail(), existingUser.getName(), perms);

        return volunteerMapper.toExistingUserInviteResponse(existingUser, invitation, perms);
    }

    private VolunteerInviteCheckResponse processNewUserInvite(String email, String name, Set<String> perms, String adminId) {
        String token = generateToken();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusDays(7);

        VolunteerInvitation invitation = invitationRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> VolunteerInvitation.builder().email(email).build());

        invitation.setName(name);
        invitation.setInvitationToken(token);
        invitation.setStatus(VolunteerInvitationStatus.PENDING);
        invitation.setExpiresAt(expiresAt);
        invitation.setEmailSentAt(now);
        invitation.setEmailDeliveryStatus("SENT");
        invitation.setEmailFailureReason(null);
        invitation.setPermissions(perms);
        invitation.setCreatedBy(adminId != null ? adminId : "admin");

        invitation = invitationRepository.save(invitation);
        String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + token);

        boolean emailSent = volunteerEmailHelper.sendNewVolunteerInvitationEmail(email, name, activationLink);
        if (!emailSent) {
            invitation.setStatus(VolunteerInvitationStatus.EMAIL_FAILED);
            invitation.setEmailDeliveryStatus("FAILED");
            invitation.setEmailFailureReason("SMTP server unreachable or invalid recipient mailbox");
            invitation = invitationRepository.save(invitation);
        }

        return volunteerMapper.toNewUserInviteResponse(invitation, activationLink, emailSent);
    }

    private void markPendingInvitationAccepted(String email, Set<String> perms) {
        invitationRepository.findByEmailIgnoreCase(email).ifPresent(inv -> {
            inv.setStatus(VolunteerInvitationStatus.ACCEPTED);
            inv.setAcceptedAt(LocalDateTime.now());
            inv.setPermissions(perms);
            invitationRepository.save(inv);
        });
    }

    private VolunteerInvitation saveOrUpdateAcceptedInvitation(String email, String name, Set<String> perms, String adminId) {
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
                    .name(name)
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
        return invitationRepository.save(invitation);
    }
}
