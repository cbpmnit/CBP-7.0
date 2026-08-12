package com.cbp7.platform.volunteer.service;

import com.cbp7.platform.volunteer.dto.request.*;
import com.cbp7.platform.volunteer.dto.response.*;

import java.util.List;
import java.util.UUID;

public interface VolunteerInvitationService {
    VolunteerInviteCheckResponse inviteVolunteer(InviteVolunteerRequest request, String adminId);
    VolunteerDetailResponse grantVolunteerAccess(GrantVolunteerAccessRequest request, String adminId);
    AcceptVolunteerInvitationResponse acceptInvitation(AcceptVolunteerInvitationRequest request);
    String setupPassword(VolunteerPasswordSetupRequest request);
    List<VolunteerInvitationResponse> getPendingInvitations();
    VolunteerInvitationResponse getInvitationById(UUID invitationId);
    VolunteerInvitationResponse resendInvitation(UUID invitationId, String adminId);
    void revokeInvitation(UUID invitationId, String adminId);
    void disableVolunteer(String idOrEmail, String adminId);
    List<VolunteerListItemResponse> getAllVolunteers();
    VolunteerDetailResponse getVolunteerById(String idOrEmail);
    VolunteerDetailResponse updateVolunteerPermissions(String idOrEmail, UpdateVolunteerPermissionsRequest request);
    VerifyInvitationResponse verifyInvitation(String token);
    byte[] exportVolunteersCsv(String search, String statusFilter);
}
