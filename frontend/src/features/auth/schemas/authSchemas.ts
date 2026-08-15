export interface AuthValidationResult {
  isValid: boolean
  error: string | null
}

export function validateLogin(identifier: string, password: string): AuthValidationResult {
  const cleanId = identifier.trim()
  if (!cleanId) {
    return { isValid: false, error: "Student ID or Email Address is required" }
  }
  if (!password) {
    return { isValid: false, error: "Password is required" }
  }
  return { isValid: true, error: null }
}

export function validateAccountSetup(studentId: string, password: string): AuthValidationResult {
  const cleanStudentId = studentId.trim()
  if (!cleanStudentId) {
    return { isValid: false, error: "Student ID is required." }
  }
  if (!password) {
    return { isValid: false, error: "Password is required." }
  }
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long." }
  }
  return { isValid: true, error: null }
}
