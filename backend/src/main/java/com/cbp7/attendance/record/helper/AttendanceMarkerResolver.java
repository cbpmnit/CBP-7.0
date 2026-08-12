package com.cbp7.attendance.record.helper;

import com.cbp7.attendance.record.dto.common.MarkedByInfo;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AttendanceMarkerResolver {

    private final UserRepository userRepository;

    public MarkedByInfo resolveMarker(UUID markedByUserId) {
        if (markedByUserId == null) {
            return new MarkedByInfo("system", "SYSTEM", "Automated / System Scanner");
        }

        Optional<User> markerUserOpt = userRepository.findById(markedByUserId);
        if (markerUserOpt.isPresent()) {
            User marker = markerUserOpt.get();
            String roleName = marker.getRole() != null ? marker.getRole().name() : "ROLE_VOLUNTEER";
            return new MarkedByInfo(
                    marker.getId().toString(),
                    marker.getName() != null ? marker.getName() : marker.getStudentId(),
                    roleName
            );
        }

        return new MarkedByInfo(markedByUserId.toString(), "Authorized Staff", "ROLE_VOLUNTEER");
    }
}
