package com.cbp7.platform.admin.student.resolver;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.identity.profile.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class StudentIdentityResolver {

    public String resolveEffectiveStudentId(User user, CbpRegistration reg) {
        if (user != null && user.getStudentId() != null && !user.getStudentId().isBlank()) {
            return user.getStudentId();
        }
        if (reg != null && reg.getStudentId() != null && !reg.getStudentId().isBlank()) {
            return reg.getStudentId();
        }
        return "-";
    }

    public String resolveEffectiveName(User user, CbpRegistration reg, UserProfile profile) {
        if (user != null && user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        if (reg != null && reg.getFirstName() != null) {
            String last = reg.getLastName() != null ? " " + reg.getLastName() : "";
            return reg.getFirstName() + last;
        }
        if (profile != null && profile.getFirstName() != null) {
            String last = profile.getLastName() != null ? " " + profile.getLastName() : "";
            return profile.getFirstName() + last;
        }
        return "Student";
    }

    public String resolveEffectivePhone(User user, CbpRegistration reg, UserProfile profile) {
        if (user != null && user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            return user.getPhoneNumber();
        }
        if (reg != null && reg.getPhoneNumber() != null && !reg.getPhoneNumber().isBlank()) {
            return reg.getPhoneNumber();
        }
        if (profile != null && profile.getPhoneNumber() != null && !profile.getPhoneNumber().isBlank()) {
            return profile.getPhoneNumber();
        }
        return "-";
    }

    public String resolveEffectiveProgramLevel(CbpRegistration reg, UserProfile profile) {
        if (reg != null && reg.getProgramLevel() != null && !reg.getProgramLevel().isBlank()) {
            return reg.getProgramLevel();
        }
        if (profile != null && profile.getProgramLevel() != null) {
            return profile.getProgramLevel().name();
        }
        return "-";
    }

    public String resolveEffectiveDepartment(CbpRegistration reg, UserProfile profile) {
        if (reg != null && reg.getDepartment() != null && !reg.getDepartment().isBlank()) {
            return reg.getDepartment();
        }
        if (profile != null && profile.getDepartment() != null) {
            return profile.getDepartment();
        }
        return "-";
    }

    public String resolveEffectiveYear(CbpRegistration reg, UserProfile profile) {
        if (reg != null && reg.getYear() != null) {
            return reg.getYear().toString();
        }
        if (profile != null && profile.getYear() != null) {
            return profile.getYear().toString();
        }
        return "-";
    }

    public int calculateBasicProfileCompletion(String email, String phone, String department, String programLevel) {
        return (phone != null && !"-".equals(phone) ? 25 : 0)
                + (department != null && !"-".equals(department) ? 25 : 0)
                + (programLevel != null && !"-".equals(programLevel) ? 25 : 0)
                + (email != null && !email.isBlank() ? 25 : 0);
    }
}
