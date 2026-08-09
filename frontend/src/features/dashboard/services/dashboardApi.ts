import { apiClient } from "@/lib/apiClient"

export interface AdminDashboardSummaryDto {
  totalStudents: number
  registeredStudents: number
  paidStudents: number
  todayAttendance: number
  certificatesIssued: number
}

export const dashboardApi = {
  getDashboardSummary: () =>
    apiClient.get<AdminDashboardSummaryDto>("/api/v1/admin/dashboard/summary"),
}

export default dashboardApi
