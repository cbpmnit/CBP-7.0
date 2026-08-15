export interface PermissionScopeItem {
  id: string
  label: string
  category: string
}

export const ALL_PERMISSION_SCOPES: PermissionScopeItem[] = [
  { id: "ATTENDANCE_SCAN", label: "Scan Attendance QR", category: "Attendance" },
  { id: "ATTENDANCE_VIEW", label: "View Attendance Records", category: "Attendance" },
  { id: "STUDENT_VIEW", label: "View Student List", category: "Students" },
  { id: "OPERATIONS_VIEW", label: "View Operations Panel", category: "Operations" },
]
