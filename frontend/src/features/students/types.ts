import { AdminStudentListItem, AdminFullStudentDetail, StudentFilterParams, AdminDashboardStats as AdminDashboardStatsService } from "./services/studentApi"

export type {
  AdminStudentListItem,
  AdminFullStudentDetail,
  StudentFilterParams,
} from "./services/studentApi"

export interface StudentFilterState {
  search: string
  registrationStatus: string
  paymentStatus: string
  attendanceStatus: string
  profileStatus: string
  course: string
  branch: string
  year: string
}

export interface UpdateStudentProfilePayload {
  firstName?: string
  lastName?: string
  course?: string
  branch?: string
  year?: string
  section?: string
  hosteller?: boolean
  roomNumber?: string
  city?: string
  state?: string
  [key: string]: any
}

export interface AdminDashboardStats {
  totalStudents: number
  registeredStudents: number
  paidStudents: number
  paymentCompleted?: number
  paymentPending?: number
  certificateEligible?: number
  [key: string]: any
}

export interface ColumnPreferences {
  [key: string]: boolean
}
export type GetStudentsParams = StudentFilterParams
