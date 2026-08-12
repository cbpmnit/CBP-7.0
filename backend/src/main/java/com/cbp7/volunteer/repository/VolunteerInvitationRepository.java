package com.cbp7.volunteer.repository;

import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VolunteerInvitationRepository extends JpaRepository<VolunteerInvitation, UUID> {

    Optional<VolunteerInvitation> findByInvitationToken(String invitationToken);

    Optional<VolunteerInvitation> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndStatus(String email, VolunteerInvitationStatus status);

    List<VolunteerInvitation> findAllByOrderByCreatedAtDesc();

    List<VolunteerInvitation> findByStatusOrderByCreatedAtDesc(VolunteerInvitationStatus status);
}
