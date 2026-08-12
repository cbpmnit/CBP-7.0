package com.cbp7.attendance.session.service;

import com.cbp7.attendance.session.dto.request.CreateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.request.UpdateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.response.AttendanceSessionResponse;

import java.util.List;
import java.util.UUID;

public interface AttendanceSessionService {
    AttendanceSessionResponse createSession(CreateAttendanceSessionRequest request, String createdBy);
    List<AttendanceSessionResponse> getAllSessions();
    List<AttendanceSessionResponse> getVisibleSessions();
    AttendanceSessionResponse getSessionById(UUID id);
    AttendanceSessionResponse updateSession(UUID id, UpdateAttendanceSessionRequest request);
    AttendanceSessionResponse setSessionVisibility(UUID id, boolean visibility);
    AttendanceSessionResponse activateSession(UUID id);
    AttendanceSessionResponse closeSession(UUID id);
    void deleteSession(UUID id);
}
