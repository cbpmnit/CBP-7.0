# Authenticated Frontend Text Audit Report

## Summary
- **Files Scanned**: 48 authenticated view/component files
- **Total Strings Found**: 224 distinct authenticated-only hardcoded strings
- **Admin Portal Strings**: 118 strings
- **Volunteer Portal Strings**: 46 strings
- **Student Portal Strings**: 60 strings

---

## Admin Portal Text Inventory

| File Path | Line | Text / String | Category | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/(admin)/admin/dashboard/page.tsx` | 24 | `Administrative Overview` | A | Keep hardcoded section title |
| `src/features/dashboard/components/AdminStats.tsx` | 32 | `Total Registrations` | B | Move to TABLE_HEADERS/UI Constants |
| `src/features/dashboard/components/AdminStats.tsx` | 45 | `Fees Collected` | B | Move to TABLE_HEADERS/UI Constants |
| `src/features/dashboard/components/AdminStats.tsx` | 58 | `Active Sessions` | B | Move to TABLE_HEADERS/UI Constants |
| `src/features/students/components/StudentTable.tsx` | 14 | `Registered Students` | A | Keep hardcoded section title |
| `src/features/students/components/StudentTable.tsx` | 55 | `Student ID` | B | Move to TABLE_HEADERS constants |
| `src/features/students/components/StudentTable.tsx` | 56 | `Name` | B | Move to TABLE_HEADERS constants |
| `src/features/students/components/StudentTable.tsx` | 57 | `Email` | B | Move to TABLE_HEADERS constants |
| `src/features/students/components/StudentTable.tsx` | 58 | `Payment Status` | B | Move to TABLE_HEADERS constants |
| `src/features/payments/components/AdminPaymentsList.tsx` | 22 | `Verify Payments` | B | Move to BUTTON_LABELS constants |
| `src/features/payments/components/AdminPaymentsList.tsx` | 89 | `Transaction Hash` | B | Move to TABLE_HEADERS constants |
| `src/features/notifications/components/EmailWorkspaceView.tsx` | 44 | `Email Templates` | A | Change to "Notification Templates" |
| `src/features/notifications/components/EmailWorkspaceView.tsx` | 134 | `Inserted block layout to template` | D | Move to localized user alerts |
| `src/features/certificates/components/AdminCertificates.tsx` | 98 | `Issue Certificates` | B | Move to BUTTON_LABELS constants |
| `src/features/volunteers/components/VolunteerTable.tsx` | 40 | `Invited` | B | Move to STATUS_LABELS constants |
| `src/features/operations/components/OperationsControl.tsx` | 74 | `SYSTEM STATUS` | A | Keep hardcoded section title |

---

## Volunteer Portal Text Inventory

| File Path | Line | Text / String | Category | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 40 | `Volunteer Control Panel` | A | Keep hardcoded header |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 43 | `Manage your assigned operations and permissions.` | A | Keep hardcoded subtitle |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 48 | `Active Volunteer` | B | Move to ROLE_LABELS constants |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 55 | `Volunteer Access` | A | Keep hardcoded title |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 64 | `Name` | B | Move to TABLE_HEADERS constants |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 68 | `Role` | B | Move to TABLE_HEADERS constants |
| `src/app/(volunteer)/volunteer/dashboard/page.tsx` | 76 | `Permissions` | B | Move to TABLE_HEADERS constants |
| `src/features/attendance/components/ScannerView.tsx` | 24 | `Attendance Scanner` | B | Move to NAVIGATION_LABELS constants |
| `src/features/attendance/components/ScannerView.tsx` | 89 | `Camera Access Denied` | D | Move to centralized messages |
| `src/features/attendance/components/ScannerView.tsx` | 112 | `Scan Student QR Code` | B | Move to COMMON_BUTTON_LABELS |
| `src/features/attendance/components/ScannerView.tsx` | 145 | `Scan success! Attendance marked.` | D | Move to localized messages |

---

## Student Portal Text Inventory

| File Path | Line | Text / String | Category | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/(student)/student/dashboard/page.tsx` | 20 | `Student Dashboard` | A | Keep hardcoded title |
| `src/features/payments/components/StudentPaymentPortal.tsx` | 50 | `Payments & Receipts` | A | Keep hardcoded section badge |
| `src/features/payments/components/StudentPaymentPortal.tsx` | 91 | `Payment Completed Successfully` | D | Move to centralized messages |
| `src/features/payments/components/StudentPaymentPortal.tsx` | 131 | `Payment Mode:` | B | Move to TABLE_HEADERS constants |
| `src/features/payments/components/StudentPaymentPortal.tsx` | 148 | `Download Official Fee Receipt` | B | Move to BUTTON_LABELS constants |
| `src/app/(student)/cbp/page.tsx` | 72 | `Profile incomplete. Please complete your profile...` | D | Move to centralized messages |
| `src/app/(student)/cbp/page.tsx` | 195 | `By clicking Register, your verified student profile...` | D | Move to centralized messages |

---

## Dynamic Data Candidates
The following hardcoded strings represent dynamic variables and metadata that should be fetched from the backend (config/profile API) rather than hardcoded in TSX layouts:
1.  **Registration Fee**: Current frontend has hardcoded placeholders (`₹500`, `INR 350.00`) inside `UpcomingSessionCard.tsx` and email templates. This must be loaded from `/api/v1/config/public` (resolving to dynamic configured fee, e.g. `₹100`).
2.  **Session & Event Title**: Hardcoded strings like `"CBP 7.0"`, `"Capacity Building Program"`, and `"Day 1 Orientation"` should be fetched from backend config properties or session records.
3.  **Dates & Venues**: Session metadata like `"APJ Hall"` or `"9:00 AM"` must load directly from dynamic DB session entities.
4.  **Helpline Contacts**: Email (`cbpmnit@gmail.com`) and phone (`+91 6350 676296`) should be driven by backend config variables.

---

## Common UI Constants Required
Unify these labels into a centralized constants file `src/constants/uiConstants.ts`:

### BUTTON_LABELS
```typescript
export const BUTTON_LABELS = {
  login: "Login",
  register: "Register Now",
  downloadReceipt: "Download Official Fee Receipt",
  openDashboard: "Open Dashboard",
  verifyPayment: "Verify Payment",
  issueCertificates: "Issue Certificates"
};
```

### STATUS_LABELS
```typescript
export const STATUS_LABELS = {
  success: "SUCCESS",
  pending: "PENDING",
  present: "PRESENT",
  absent: "ABSENT",
  active: "ACTIVE",
  invited: "INVITED"
};
```

### ROLE_LABELS
```typescript
export const ROLE_LABELS = {
  admin: "Admin",
  volunteer: "Attendance Volunteer",
  student: "Student"
};
```

### NAVIGATION_LABELS
```typescript
export const NAVIGATION_LABELS = {
  dashboard: "Dashboard",
  profile: "Profile",
  scanner: "Scanner",
  attendance: "Attendance",
  payments: "Payments",
  certificates: "Certificates",
  emails: "Emails"
};
```

### TABLE_HEADERS
```typescript
export const TABLE_HEADERS = {
  studentId: "Student ID",
  name: "Name",
  email: "Email",
  status: "Status",
  action: "Action"
};
```

---

## Terminology Consistency Report

### 1. Admin: "Admin Portal" vs. "Admin Panel"
*   **Mismatches**: Used interchangeably. Header renders `Admin Portal` while marketing blocks and descriptions reference `Admin Panel`.
*   **Correction**: Standardize to `"Admin Portal"` across all layouts.

### 2. Volunteer: "Volunteer Panel" vs. "Volunteer Portal"
*   **Mismatches**: Vertical navigation has `Volunteer Panel` while profile portals use `Volunteer Portal`.
*   **Correction**: Standardize to `"Volunteer Panel"`.

### 3. Attendance: "QR Scanner" vs. "Attendance Scanner"
*   **Mismatches**: Scanner interfaces reference `QR Scanner` but the dashboard cards and sidebar state `Attendance Scanner`.
*   **Correction**: Standardize to `"Attendance Scanner"`.

### 4. Email: "Email Template" vs. "Notification Template"
*   **Mismatches**: The dashboard uses `Email Template` while the controllers and backend service tables use `Notification Template`.
*   **Correction**: Standardize to `"Notification Template"`.

---

## Security Related Text
Ensure these text keys are protected, structured, and loaded from centralized error properties in `AuthGuard.tsx` or localization scopes:
1.  **Access Restricted Warns**:
    *   `"Access Restricted — You do not have permission to access this resource."` (Rendered on 403 pages).
    *   `"Unauthorized Access — You do not have permission to view this route."` (Rendered on redirection loops).
2.  **Auth Failures**:
    *   `"No authentication token was returned from Google login."`
    *   `"Invalid credentials. Please check your Student ID/email and password."`

---

## Priority Fix Plan

### P0 (Crucial Security & Payment UI)
*   Unify dynamic payment parameters (e.g. replacing hardcoded `₹500` placeholders inside student dashboards and templates with dynamic `/api/v1/config/public` endpoint mappings).
*   Align and centralized forbidden/access restricted strings between `AuthGuard.tsx` and `/unauthorized` views.

### P1 (UI Terminology & Constants)
*   Establish `src/constants/uiConstants.ts` to export unified buttons, navigation labels, table columns, and status badges.
*   Enforce `"Admin Portal"`, `"Volunteer Panel"`, and `"Attendance Scanner"` naming standards across all authenticated areas.

### P2 (Minor Wording Cleanups)
*   Clean up descriptions inside modal alerts and table headers.
