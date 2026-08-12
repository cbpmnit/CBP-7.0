package com.cbp7.platform.volunteer.helper;

import com.cbp7.common.config.FrontendProperties;
import com.cbp7.platform.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class VolunteerEmailHelper {

    private final EmailNotificationService emailNotificationService;
    private final FrontendProperties frontendProperties;

    public boolean sendNewVolunteerInvitationEmail(String email, String name, String activationLink) {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("studentName", name != null ? name : "Volunteer");
            variables.put("email", email);
            variables.put("activationLink", activationLink != null ? activationLink : "");

            emailNotificationService.sendEventEmail("VOLUNTEER_INVITATION", email, variables);
            log.info("Triggered volunteer invitation email dispatch for {}", email);
            return true;
        } catch (Exception e) {
            log.warn("Failed to dispatch volunteer invitation email to {}: {}", email, e.getMessage());
            return false;
        }
    }

    public void sendVolunteerAccessGrantedEmail(String email, String name, Set<String> permissions) {
        try {
            String permsList = permissions != null
                    ? permissions.stream().map(p -> " • " + p).collect(Collectors.joining("\n"))
                    : "";

            Map<String, String> variables = new HashMap<>();
            variables.put("studentName", name != null ? name : "Volunteer");
            variables.put("email", email);
            variables.put("permissionsList", permsList);
            variables.put("portalUrl", frontendProperties.getUrl());

            emailNotificationService.sendEventEmail("VOLUNTEER_ASSIGNED", email, variables);
            log.info("Triggered volunteer access granted email dispatch for {}", email);
        } catch (Exception e) {
            log.warn("Failed to dispatch access granted email to {}: {}", email, e.getMessage());
        }
    }

    public void sendVolunteerPermissionsUpdatedEmail(String email, String name, Set<String> permissions) {
        try {
            String permsList = permissions != null
                    ? permissions.stream().map(p -> " • " + p).collect(Collectors.joining("\n"))
                    : "";

            Map<String, String> variables = new HashMap<>();
            variables.put("studentName", name != null ? name : "Volunteer");
            variables.put("email", email);
            variables.put("permissionsList", permsList);
            variables.put("portalUrl", frontendProperties.getUrl());

            emailNotificationService.sendEventEmail("VOLUNTEER_PERMISSIONS_UPDATED", email, variables);
            log.info("Triggered volunteer permission update email dispatch for {}", email);
        } catch (Exception e) {
            log.warn("Failed to dispatch permission update email to {}: {}", email, e.getMessage());
        }
    }

    public void sendVolunteerAccessRevokedEmail(String email, String name) {
        try {
            Map<String, String> variables = new HashMap<>();
            variables.put("studentName", name != null ? name : "Volunteer");
            variables.put("email", email);

            emailNotificationService.sendEventEmail("VOLUNTEER_ACCESS_REVOKED", email, variables);
            log.info("Triggered volunteer access revoked email dispatch for {}", email);
        } catch (Exception e) {
            log.warn("Failed to dispatch access revoked email to {}: {}", email, e.getMessage());
        }
    }
}
