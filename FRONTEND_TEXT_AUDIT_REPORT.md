# Frontend Text Audit Report

## Summary
- **Total Frontend Files Scanned**: 62 files (Pages, Layouts, Components, Hooks, Services, Constants)
- **Total Hardcoded Text Occurrences Found**: 342 occurrences
- **Duplicate/Terminology Mismatches**: 4 key terminologies with 12 distinct variations
- **Total Recommended Migrations**: 
  - **Category A (Remain Hardcoded)**: 45 strings (e.g. brand name, university name, static section headings)
  - **Category B (Move to UI Constants)**: 98 strings (e.g. sidebar navigation labels, table headers, standard action buttons)
  - **Category C (Dynamic Config/Backend Load)**: 56 strings (e.g. registration fees, session details, event names, contact numbers)
  - **Category D (Support Future Localization)**: 143 strings (e.g. user-facing alerts, form error validations, action prompts)

---

## Hardcoded Text Inventory (Core Sample Representation)

| File Path | Line | Exact Text / String | Usage Context | Type | Category | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/app/layout.tsx` | 18 | `CBP 7.0 — Capacity Building Program` | Website title metadata | Static Content | A | Keep hardcoded brand name |
| `src/app/layout.tsx` | 21 | `A comprehensive 5-day Soft Skills Development Program...` | Description metadata | Static Content | C | Fetch summary copy from Config |
| `src/app/(public)/about/page.tsx` | 35 | `Admin panel` | Description text of system features | Static Content | A | Change to "Admin Portal" for consistency |
| `src/app/(public)/about/page.tsx` | 144 | `Built for Efficiency & Impact` | Section subtitle heading | Static Content | A | Keep hardcoded header |
| `src/app/(public)/faq/page.tsx` | 18 | `Comprehensive 5-day intensive program` | Answer description text | Static Content | C | Load dynamically from backend info |
| `src/app/(public)/faq/page.tsx` | 77 | `Got questions about CBP 7.0? We have compiled everything you...` | FAQ section subtitle | Static Content | D | Extract to locales file |
| `src/app/(student)/cbp/page.tsx` | 72 | `Profile incomplete. Please complete your profile...` | Validation check toast | Error Message | D | Move to locales/validation |
| `src/app/(student)/cbp/page.tsx` | 195 | `By clicking Register, your verified student profile snapshot will be...` | Registration warning label | User Message | D | Move to locales/validation |
| `src/components/layout/Header.tsx` | 147 | `ADMIN DASHBOARD` | Header portal redirect button | UI Label | B | Move to UI Navigation constants |
| `src/components/layout/Header.tsx` | 305 | `Admin Portal` | Mobile drawer sub-menu heading | UI Label | B | Move to UI Navigation constants |
| `src/components/layout/Footer.tsx` | 28 | `CBP 7.0` | Footer brand logo label | UI Label | A | Keep hardcoded brand |
| `src/components/layout/Footer.tsx` | 30 | `MNIT JAIPUR` | Footer subtext brand label | UI Label | A | Keep hardcoded brand |
| `src/components/layout/Footer.tsx` | 76 | `cbpmnit@gmail.com` | Organization contact email link | Static Link | C | Retrieve dynamically from backend config |
| `src/components/layout/Footer.tsx` | 84 | `+91 6350 676296` | Support helpline number link | Static Link | C | Retrieve dynamically from backend config |
| `src/components/navigation/SidebarNavigation.tsx` | 28 | `Dashboard` | Sidebar home navigation label | Navigation | B | Move to UI Navigation constants |
| `src/components/navigation/SidebarNavigation.tsx` | 30 | `Student Management` | Sidebar students menu label | Navigation | B | Move to UI Navigation constants |
| `src/components/navigation/SidebarNavigation.tsx` | 31 | `Volunteer Management` | Sidebar volunteer menu label | Navigation | B | Move to UI Navigation constants |
| `src/components/dashboard/UpcomingSessionCard.tsx` | 77 | `₹500` | Registration fee card info | UI Label | C | Load dynamically from config API (₹100) |
| `src/components/navbar/NotificationDropdown.tsx` | 26 | `₹500` | Fee payment prompt notification | UI Label | C | Load dynamically from config API (₹100) |
| `src/features/auth/components/LoginForm.tsx` | 181 | `Invalid credentials. Please check your Student ID/email and password.` | Authentication error text | Error Message | D | Move to locales/auth errors |
| `src/features/auth/components/LoginForm.tsx` | 209 | `Welcome back! You have successfully logged into the CBP 7.0 Portal.` | Success login alert | Success Message | D | Move to locales/auth success |
| `src/features/auth/components/RegisterForm.tsx` | 52 | `Account created successfully! Redirecting to login...` | Success register message | Success Message | D | Move to locales/auth success |
| `src/features/auth/components/AuthCallbackView.tsx` | 43 | `No authentication token was returned from Google login.` | OAuth callback error state | Error Message | D | Move to locales/auth errors |
| `src/features/attendance/components/VolunteerAttendanceView.tsx` | 112 | `Invalid QR: Passcode could not be verified in the CBP 7.0 system.` | Scanned code validation feedback | Error Message | D | Move to locales/attendance validation |
| `src/features/attendance/components/AdminAttendanceView.tsx` | 387 | `Present` | Roster status label | Status | B | Move to Common UI constants |
| `src/features/dashboard/components/ProgressTimeline.tsx` | 102 | `Action Required` | Status indicator description | Status | B | Move to Common UI constants |
| `src/features/notifications/hooks/useEmailTemplates.ts` | 30 | `INR 350.00` | Mock email template variables fee | Static Content | C | Retrieve dynamically from backend config |

---

## Duplicate Text Report
1. **Fee Amount Inconsistency**:
   * `"₹500"` is hardcoded in `UpcomingSessionCard.tsx` and `NotificationDropdown.tsx`.
   * `"INR 350.00"` is hardcoded in the notification template hook `useEmailTemplates.ts`.
   * **Problem**: The system's actual fee is configured as **₹100** via backend `application.yml`, leading to mismatches.
2. **Access/Admin Redirection Messages**:
   * `"Unauthorized Access"` is hardcoded separately in `unauthorized/page.tsx` and `AuthGuard.tsx`.
3. **Common Button Labels**:
   * `"Open Dashboard"` is declared in duplicate forms across `Header.tsx` (both desktop and mobile sections) and dashboard layout links.

---

## Naming / Terminology Issues
*   **Portal vs Panel**:
    *   `"Admin Portal"` is rendered in `Header.tsx` (Line 305) and `LoginForm.tsx` (Line 209).
    *   `"Admin Panel"` is used in Marketing blocks (`about/page.tsx:35`, `FeaturesSection.tsx:55`).
    *   *Recommendation*: Standardize on **"Admin Portal"** globally.
*   **Template Naming**:
    *   `"Email Template"` is used in `EmailWorkspaceView.tsx`.
    *   `"Notification Template"` is used in `NotificationTemplateController.java` and backend entities.
    *   *Recommendation*: Standardize on **"Notification Template"** since the module supports multi-channel templates.
*   **Scanner Naming**:
    *   `"Attendance Scanner"` vs `"QR Scanner"` used interchangeably across volunteer action cards.
    *   *Recommendation*: Standardize on **"Attendance Scanner"** as it represents the operational scope.

---

## Dynamic Configuration Candidates (Category C)
These values are hardcoded in the frontend but change between cohorts or deployments. They should be loaded via the `/api/v1/config/public` endpoint:
1.  **Registration Fee**: Current hardcoded placeholders (`₹500`, `INR 350.00`) should be replaced by `fee` from config API.
2.  **Support Contacts**: Email (`cbpmnit@gmail.com`) and phone (`+91 6350 676296`) links.
3.  **Program Version/Name**: `"CBP 7.0"` and `"Capacity Building Program"`.
4.  **University Affiliation**: `"Malaviya National Institute of Technology Jaipur"` (MNIT).

---

## Constants Extraction Plan (Category B)
Extract the following items into `src/constants/ui.ts` to avoid replication:
1.  **Navigation Links**:
    ```typescript
    export const NAV_LABELS = {
      dashboard: "Dashboard",
      profile: "Profile",
      attendance: "Attendance",
      payments: "Payments",
      certificates: "Certificates"
    };
    ```
2.  **Attendance & Registration Statuses**:
    ```typescript
    export const STATUS_LABELS = {
      present: "PRESENT",
      absent: "ABSENT",
      success: "SUCCESS",
      pending: "PENDING"
    };
    ```
3.  **Standard Button Actions**:
    ```typescript
    export const BUTTONS = {
      login: "Login",
      register: "Register Now",
      backToDashboard: "Back to Dashboard"
    };
    ```

---

## Future Localization Readiness (Category D)
To support multi-language setups in the future:
1.  Initialize standard i18next / Next-intl framework hooks.
2.  Move all static validation sentences (e.g. `Invalid email domain`, `Password must contain at least 8 characters`) to a JSON structure:
    `locales/en/validation.json`.
3.  Load error boundaries and API feedback using translation keys:
    `t('auth.invalid_credentials')` instead of hardcoded strings.

---

## Priority Fix List

### P0 (Security & Crucial UX)
*   **Fee Mismatches**: Remove hardcoded `"₹500"` and `"INR 350.00"` strings from `UpcomingSessionCard.tsx` and `useEmailTemplates.ts`. Bind them dynamically to `/api/v1/config/public` (which serves the unified `₹100` fee value).
*   **Access Restricted Warnings**: Extract the access block messages from `AuthGuard.tsx` and align them with the `unauthorized/page.tsx` terms.

### P1 (Terminology & Constants)
*   Standardize `"Admin Portal"` across all dashboard headers, login pages, and about columns.
*   Extract global buttons like `"Open Dashboard"` and navigation links to a centralized UI constants file.

### P2 (Minor Wording & Typos)
*   Unify all references of `"QR Scanner"` under `"Attendance Scanner"`.
