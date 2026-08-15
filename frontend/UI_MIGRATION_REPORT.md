# CBP 7.0 UI Design System Migration Report

This document records the creation of the Single Source of Truth (SSOT) UI architecture and the migration of feature components to generic presentation primitives.

---

## 1. Centralized UI Primitives (`src/components/ui/`)

| Primitive Component | Responsibility | Props / Variants |
| :--- | :--- | :--- |
| **[`Spinner.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Spinner.tsx)** | Standardized loading spinner indicator | Sizes: `sm`, `md`, `lg`<br/>Colors: `cyan`, `white`, `dark` |
| **[`LoadingScreen.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/LoadingScreen.tsx)** | Full-page and container loading state overlay | `message`, `fullScreen`, `className` |
| **[`Alert.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Alert.tsx)** | Feedback alert banners | Types: `success`, `error`, `warning`, `info` |
| **[`Button.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Button.tsx)** | Action button with loading & icon support | Variants: `primary`, `outline`, `secondary`, `ghost`, `danger` |
| **[`Input.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Input.tsx)** | Form input control | Labels, icons, error messages, mandatory asterisks |
| **[`Select.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Select.tsx)** | Form select dropdown | Label, options list, icons, error handling |
| **[`Textarea.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Textarea.tsx)** | Multi-line text field | Label, icon, character helper text, error messages |
| **[`Card.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Card.tsx)** | Surface container with subtle border & shadow | `.cbp-card-interactive` hover state support |
| **[`Badge.tsx`](file:///c:/Users/parva/Documents/GitHub/cbp/CBP-7.0/frontend/src/components/ui/Badge.tsx)** | Chip status indicator | Variants: `success`, `warning`, `error`, `info`, `purple`, `neutral` |

---

## 2. Feature Component Migration Progress

- **`src/features/auth/`**:
  - `LoginFormFields.tsx` migrated to use `<Button>`, `<Input>`, and `<Alert>` primitives.
  - Replaced inline `animate-spin` logic with generic UI primitive buttons.
- **`src/features/account/`**:
  - `AccountIdentityCard.tsx` & `PasswordManagementCard.tsx` standardized on card and button tokens.
- **`src/features/profile/`**:
  - `ProfileHeaderCard.tsx` & `VolunteerProfileView.tsx` standardized on status badges and cards.

---

## 3. Design Token Single Point of Change Guarantee

- **Primary Button Colors**: Update `variantClass` inside `src/components/ui/Button.tsx`.
- **Loading Animations**: Update `src/components/ui/Spinner.tsx` or `src/components/ui/LoadingScreen.tsx`.
- **Feedback Banner Styles**: Update `src/components/ui/Alert.tsx`.
- **Global Theme & Typography**: Update `src/app/globals.css`.
