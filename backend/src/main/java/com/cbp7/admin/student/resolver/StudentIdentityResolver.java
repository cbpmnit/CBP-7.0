package com.cbp7.admin.student.resolver;

import com.cbp7.auth.entity.User;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.profile.entity.UserProfile;
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

    public String resolveEffectiveCourse(CbpRegistration reg, UserProfile profile) {
        if (reg != null && reg.getCourse() != null && !reg.getCourse().isBlank()) {
            return reg.getCourse();
        }
        if (profile != null && profile.getCourse() != null) {
            return profile.getCourse().name();
        }
        return "-";
    }

    public String resolveEffectiveBranch(CbpRegistration reg, UserProfile profile) {
        if (reg != null && reg.getBranch() != null && !reg.getBranch().isBlank()) {
            return reg.getBranch();
        }
        if (profile != null && profile.getBranch() != null) {
            return profile.getBranch().name();
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

    public int calculateBasicProfileCompletion(String email, String phone, String branch, String course) {
        return (phone != null && !"-".equals(phone) ? 25 : 0)
                + (branch != null && !"-".equals(branch) ? 25 : 0)
                + (course != null && !"-".equals(course) ? 25 : 0)
                + (email != null && !email.isBlank() ? 25 : 0);
    }
}
