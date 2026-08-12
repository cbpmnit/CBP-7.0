package com.cbp7.platform.volunteer.helper;

import com.cbp7.common.config.FrontendProperties;
import com.cbp7.platform.notification.email.EmailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class VolunteerEmailHelper {

    private final EmailSender emailSender;
    private final FrontendProperties frontendProperties;

    public boolean sendNewVolunteerInvitationEmail(String email, String name, String activationLink) {
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

    public void sendVolunteerAccessGrantedEmail(String email, String name, Set<String> permissions) {
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

    public void sendVolunteerPermissionsUpdatedEmail(String email, String name, Set<String> permissions) {
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

    public void sendVolunteerAccessRevokedEmail(String email, String name) {
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
