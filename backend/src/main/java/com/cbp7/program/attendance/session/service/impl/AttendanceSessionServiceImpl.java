package com.cbp7.program.attendance.session.service.impl;

import com.cbp7.program.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.program.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.dto.request.CreateAttendanceSessionRequest;
import com.cbp7.program.attendance.session.dto.request.UpdateAttendanceSessionRequest;
import com.cbp7.program.attendance.session.dto.response.AttendanceSessionResponse;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.program.attendance.session.mapper.AttendanceSessionMapper;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.program.attendance.session.service.AttendanceSessionService;
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
    private final AttendanceSessionMapper sessionMapper;

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
        return sessionMapper.toResponse(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> getAllSessions() {
        return sessionRepository.findAllByOrderByDayNumberAsc().stream()
                .map(this::mapSessionWithAttendanceCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> getVisibleSessions() {
        return sessionRepository.findByVisibilityTrueOrderByDayNumberAsc().stream()
                .map(this::mapSessionWithAttendanceCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSessionResponse getSessionById(UUID id) {
        AttendanceSession session = fetchSession(id);
        return mapSessionWithAttendanceCount(session);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse updateSession(UUID id, UpdateAttendanceSessionRequest request) {
        AttendanceSession session = fetchSession(id);

        validateDayNumberUniqueness(session, request.dayNumber());
        applySessionUpdates(session, request);

        AttendanceSession updated = sessionRepository.save(session);

        if (request.endTime() != null || request.sessionDate() != null) {
            updateQrCodeExpiry(updated);
        }

        return mapSessionWithAttendanceCount(updated);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse setSessionVisibility(UUID id, boolean visibility) {
        AttendanceSession session = fetchSession(id);
        session.setVisibility(visibility);
        AttendanceSession updated = sessionRepository.save(session);
        return mapSessionWithAttendanceCount(updated);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse activateSession(UUID id) {
        AttendanceSession session = fetchSession(id);
        session.setStatus(SessionStatus.ACTIVE);
        AttendanceSession updated = sessionRepository.save(session);
        return mapSessionWithAttendanceCount(updated);
    }

    @Override
    @Transactional
    public AttendanceSessionResponse closeSession(UUID id) {
        AttendanceSession session = fetchSession(id);
        session.setStatus(SessionStatus.CLOSED);
        AttendanceSession updated = sessionRepository.save(session);

        qrService.deactivateSessionQr(id);
        return mapSessionWithAttendanceCount(updated);
    }

    @Override
    @Transactional
    public void deleteSession(UUID id) {
        AttendanceSession session = fetchSession(id);
        sessionRepository.delete(session);
    }

    // --- Private Story Helper Methods ---

    private AttendanceSession fetchSession(UUID id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));
    }

    private AttendanceSessionResponse mapSessionWithAttendanceCount(AttendanceSession session) {
        long count = recordRepository.countBySessionId(session.getId());
        return sessionMapper.toResponse(session, count);
    }

    private void validateDayNumberUniqueness(AttendanceSession session, Integer requestedDayNumber) {
        if (requestedDayNumber != null && !requestedDayNumber.equals(session.getDayNumber())) {
            sessionRepository.findByDayNumber(requestedDayNumber).ifPresent(existing -> {
                throw new DuplicateResourceException("Session already exists for Day " + requestedDayNumber);
            });
            session.setDayNumber(requestedDayNumber);
        }
    }

    private void applySessionUpdates(AttendanceSession session, UpdateAttendanceSessionRequest request) {
        if (request.title() != null && !request.title().isBlank()) session.setTitle(request.title().trim());
        if (request.description() != null) session.setDescription(request.description().trim());
        if (request.sessionDate() != null) session.setSessionDate(request.sessionDate());
        if (request.startTime() != null) session.setStartTime(request.startTime());
        if (request.endTime() != null) session.setEndTime(request.endTime());
        if (request.venue() != null) session.setVenue(request.venue().trim());
        if (request.status() != null) session.setStatus(request.status());
        if (request.visibility() != null) session.setVisibility(request.visibility());
    }

    private void updateQrCodeExpiry(AttendanceSession session) {
        LocalDateTime newExpiresAt = session.getEndTime() != null
                ? LocalDateTime.of(session.getSessionDate(), session.getEndTime())
                : session.getSessionDate().atTime(23, 59, 59);

        List<AttendanceQrCode> qrs = attendanceQrRepository.findAllBySessionId(session.getId());
        for (AttendanceQrCode qr : qrs) {
            if (qr.isActive()) {
                qr.setExpiresAt(newExpiresAt);
                attendanceQrRepository.save(qr);
            }
        }
    }
}
