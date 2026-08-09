import { studentApi } from "@/features/students/services/studentApi"
export type { AdminStudentListItem, AdminFullStudentDetail, StudentFilterParams } from "@/features/students/services/studentApi"

export const adminStudentService = studentApi
export default adminStudentService
