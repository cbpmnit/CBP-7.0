package com.cbp7.attendance.session.service.impl;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.dto.request.CreateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.request.UpdateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.response.AttendanceSessionResponse;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.attendance.session.service.AttendanceSessionService;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceSessionServiceImpl implements AttendanceSessionService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceQrService qrService;
    private final AttendanceQrRepository attendanceQrRepository;

    @Override
    @Transactional
    public AttendanceSessionResponse createSession(CreateAttendanceSessionRequest request, String createdBy) {
        if (sessionRepository.findByDayNumber(request.dayNumber()).isPresent()) {
            throw new DuplicateResourceException("Session already exists for Day " + request.dayNumber());
        }

        AttendanceSession session = AttendanceSession.builder()
                .dayNumber(request.dayNumber())
                .title(request.title().trim())
                .description(request.description() != null ? request.description().trim() : null)
                .sessionDate(request.sessionDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .venue(request.venue() != null ? request.venue().trim() : null)
                .status(SessionStatus.UPCOMING)
                .visibility(true)
                .createdBy(createdBy)
                .build();

        AttendanceSession saved = sessionRepository.save(session);
        return AttendanceSessionResponse.fromEntity(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> getAllSessions() {
        return sessionRepository.findAllByOrderByDayNumberAsc().stream()
                .map(s -> {
                    long count = recordRepository.countBySessionId(s.getId());
                    return AttendanceSessionResponse.fromEntity(s, count);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> getVisibleSessions() {
        return sessionRepository.findByVisibilityTrueOrderByDayNumberAsc().stream()
                .map(s -> {
                    long count = recordRepository.countBySessionId(s.getId());
                    return AttendanceSessionResponse.fromEntity(s, count);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSessionResponse getSessionById(UUID id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));
        long count = recordRepository.countBySessionId(session.getId());
        return AttendanceSessionResponse.fromEntity(session, count);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse updateSession(UUID id, UpdateAttendanceSessionRequest request) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));

        if (request.dayNumber() != null && !request.dayNumber().equals(session.getDayNumber())) {
            sessionRepository.findByDayNumber(request.dayNumber()).ifPresent(existing -> {
                throw new DuplicateResourceException("Session already exists for Day " + request.dayNumber());
            });
            session.setDayNumber(request.dayNumber());
        }

        if (request.title() != null && !request.title().isBlank()) {
            session.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            session.setDescription(request.description().trim());
        }
        if (request.sessionDate() != null) {
            session.setSessionDate(request.sessionDate());
        }
        if (request.startTime() != null) {
            session.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            session.setEndTime(request.endTime());
        }
        if (request.venue() != null) {
            session.setVenue(request.venue().trim());
        }
        if (request.status() != null) {
            session.setStatus(request.status());
        }
        if (request.visibility() != null) {
            session.setVisibility(request.visibility());
        }

        AttendanceSession updated = sessionRepository.save(session);

        // Update QR validity if timing has changed
        if (request.endTime() != null || request.sessionDate() != null) {
            LocalDateTime newExpiresAt = updated.getEndTime() != null
                    ? LocalDateTime.of(updated.getSessionDate(), updated.getEndTime())
                    : updated.getSessionDate().atTime(23, 59, 59);

            List<AttendanceQrCode> qrs = attendanceQrRepository.findAllBySessionId(updated.getId());
            for (AttendanceQrCode qr : qrs) {
                if (qr.isActive()) {
                    qr.setExpiresAt(newExpiresAt);
                    attendanceQrRepository.save(qr);
                }
            }
        }

        long count = recordRepository.countBySessionId(updated.getId());
        return AttendanceSessionResponse.fromEntity(updated, count);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse setSessionVisibility(UUID id, boolean visibility) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));

        session.setVisibility(visibility);
        AttendanceSession updated = sessionRepository.save(session);
        long count = recordRepository.countBySessionId(updated.getId());
        return AttendanceSessionResponse.fromEntity(updated, count);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse activateSession(UUID id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));

        session.setStatus(SessionStatus.ACTIVE);
        AttendanceSession updated = sessionRepository.save(session);
        long count = recordRepository.countBySessionId(updated.getId());
        return AttendanceSessionResponse.fromEntity(updated, count);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse closeSession(UUID id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));

        session.setStatus(SessionStatus.CLOSED);
        AttendanceSession updated = sessionRepository.save(session);

        qrService.deactivateSessionQr(id);

        long count = recordRepository.countBySessionId(updated.getId());
        return AttendanceSessionResponse.fromEntity(updated, count);
    }

    @Override
    @Transactional
    public void deleteSession(UUID id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));
        sessionRepository.delete(session);
    }
}
