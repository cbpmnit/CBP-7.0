# CBP 7.0 Frontend Architecture & Developer Navigation Guide

Welcome to the **CBP 7.0 Frontend Architecture Guide**. This document outlines the Feature-Sliced Design architecture, data flow patterns, reusable component guidelines, and developer navigation map for maintaining and extending the application.

---

## 1. Feature Architecture Audit & Category Classification

| Feature | Components | Largest File | Category | Audit Notes & Refactoring Status |
| :--- | :--- | :--- | :--- | :--- |
| **`auth`** | 7 | `LoginForm.tsx` (~420 lines) | **Category B / C** | **Refactored**: Extracted `useLoginForm.ts`, `useAccountSetup.ts`, `authSchemas.ts`, `LoginFormSuccess.tsx`, `LoginFormFields.tsx`. |
| **`account`** | 4 | `AccountSettingsView.tsx` (~310 lines) | **Category B / C** | **Refactored**: Extracted `usePasswordManagement.ts`, `passwordSchema.ts`, `AccountIdentityCard.tsx`, `PasswordManagementCard.tsx`. |
| **`profile`** | 3 | `StudentProfileView.tsx` (~597 lines) | **Category B / C** | **Refactored**: Extracted `useVolunteerProfile.ts`, `profileSchema.ts`, `ProfileHeaderCard.tsx`, `VolunteerProfileView.tsx`. |
| **`dashboard`** | 6 | `StudentDashboard.tsx` (~290 lines) | **Category B** | Clean structure using `useStudentProfile` & dashboard widgets. |
| **`payments`** | 4 | `PaymentHistoryTable.tsx` (~240 lines) | **Category B** | Uses `apiClient` & `paymentService`. |
| **`attendance`** | 6 | `VolunteerScannerView.tsx` (~250 lines) | **Category B** | Uses `useQrScanner` custom hook. |
| **`notifications`** | 9 | `EmailManagement.tsx` (~380 lines) | **Category B** | Divided into focused tab modules. |
| **`operations`** | 5 | `StudentSelectionTable.tsx` (~230 lines) | **Category B** | Tabular selection & campaign operation components. |
| **`volunteers`** | 4 | `VolunteerAttendanceView.tsx` (~210 lines) | **Category A** | Pure layout components. |
| **`certificates`** | 4 | `StudentCertificatePortal.tsx` (~200 lines) | **Category A** | Lightweight preview & download portal. |

---

## 2. Standardized Feature Blueprint (`src/features/[feature-name]/`)

Every feature follows this standardized blueprint:

```
src/features/[feature-name]/
├── components/         # Pure UI presentation components (No direct API calls)
├── hooks/              # Custom React hooks managing state, async operations, and queries
├── services/           # Feature-specific API requests utilizing apiClient.ts
├── schemas/            # Validation logic and schema definitions
├── types.ts            # Feature-specific DTOs and type interfaces
└── index.ts            # Public feature export interface
```

---

## 3. Data Flow Pipeline

HTTP communication follows a strict unidirectional pipeline:

$$\text{UI Component} \longrightarrow \text{Custom Hook} \longrightarrow \text{Feature Service} \longrightarrow \text{apiClient.ts} \longrightarrow \text{Backend REST API}$$

---

## 4. Developer Navigation Index

| Feature | Main UI Components | Business Hooks | API Services & Schemas |
| :--- | :--- | :--- | :--- |
| **Authentication** | `LoginForm.tsx`, `CompleteAccountView.tsx`, `AuthCallbackView.tsx` | `useLoginForm.ts`, `useAccountSetup.ts` | `authApi.ts`, `authSchemas.ts` |
| **Account Settings** | `AccountSettingsView.tsx`, `AccountIdentityCard.tsx`, `PasswordManagementCard.tsx` | `usePasswordManagement.ts` | `authApi.ts`, `passwordSchema.ts` |
| **Profile Management** | `StudentProfileView.tsx`, `VolunteerProfileView.tsx`, `ProfileHeaderCard.tsx` | `useStudentProfile.ts`, `useVolunteerProfile.ts` | `profileApi.ts`, `profileSchema.ts` |
| **Student Dashboard** | `StudentDashboard.tsx`, `AdminDashboard.tsx`, `DashboardMetrics.tsx` | `useDashboard.ts` | `dashboardApi.ts` |
| **Payment Gateway** | `PaymentHistoryTable.tsx`, `PhonePeCheckoutModal.tsx` | `usePaymentCheckout.ts` | `paymentService.ts` |
| **Attendance & QR** | `StudentAttendanceView.tsx`, `VolunteerScannerView.tsx` | `useQrScanner.ts` | `attendanceApi.ts` |
