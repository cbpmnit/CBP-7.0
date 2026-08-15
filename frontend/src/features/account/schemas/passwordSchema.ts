export interface PasswordValidationResult {
  isValid: boolean
  error: string | null
}

export function validatePasswordSetup(password: string, confirmPassword: string): PasswordValidationResult {
  const p = password.trim()
  const cp = confirmPassword.trim()

  if (!p) {
    return { isValid: false, error: "Please enter a new password." }
  }
  if (p.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long." }
  }
  if (p !== cp) {
    return { isValid: false, error: "Passwords do not match." }
  }
  return { isValid: true, error: null }
}

export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordValidationResult {
  const curr = currentPassword.trim()
  if (!curr) {
    return { isValid: false, error: "Current password is required." }
  }
  return validatePasswordSetup(newPassword, confirmPassword)
}
