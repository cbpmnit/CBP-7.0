package com.cbp7.attendance.session.service;

import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.dto.CreateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.AttendanceSessionResponse;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceSessionService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;

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
                .createdBy(createdBy)
                .build();

        AttendanceSession saved = sessionRepository.save(session);
        return AttendanceSessionResponse.fromEntity(saved, 0);
    }

    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(s -> {
                    long count = recordRepository.countBySessionId(s.getId());
                    return AttendanceSessionResponse.fromEntity(s, count);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceSessionResponse getSessionById(UUID id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));
        long count = recordRepository.countBySessionId(session.getId());
        return AttendanceSessionResponse.fromEntity(session, count);
    }

    @Transactional
    public AttendanceSessionResponse updateSessionStatus(UUID id, SessionStatus status) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));

        session.setStatus(status);
        AttendanceSession updated = sessionRepository.save(session);
        long count = recordRepository.countBySessionId(updated.getId());
        return AttendanceSessionResponse.fromEntity(updated, count);
    }

    @Transactional
    public void deleteSession(UUID id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance session not found with ID: " + id));
        sessionRepository.delete(session);
    }
}
