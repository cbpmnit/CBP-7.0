export const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]

export const PROGRAM_LEVELS = ["UNDERGRADUATE", "POSTGRADUATE", "RESEARCH"]

export const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Artificial Intelligence and Data Science",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Metallurgical and Materials Engineering",
  "Architecture",
  "Management Studies",
  "Other",
]

export const STUDENT_TYPES = ["DAY_SCHOLAR", "HOSTELLER"]

export const YEARS = [1, 2, 3, 4, 5]

export const STUDENT_TYPE_OPTIONS = [
  { label: "Day Scholar", value: "DAY_SCHOLAR" },
  { label: "Hosteller", value: "HOSTELLER" },
]

export const YEAR_OPTIONS = [
  { label: "1st Year", value: "1" },
  { label: "2nd Year", value: "2" },
  { label: "3rd Year", value: "3" },
  { label: "4th Year", value: "4" },
  { label: "5th Year", value: "5" },
]

export const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
  { label: "Prefer Not To Say", value: "PREFER_NOT_TO_SAY" },
]

export const PROGRAM_LEVEL_OPTIONS = [
  { label: "Undergraduate", value: "UNDERGRADUATE" },
  { label: "Postgraduate", value: "POSTGRADUATE" },
  { label: "Research", value: "RESEARCH" },
]

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  label: dept,
  value: dept,
}))

// Legacy exports retained for smooth backward compatibility where needed
export const COURSES = PROGRAM_LEVELS
export const COURSE_OPTIONS = PROGRAM_LEVEL_OPTIONS
export const BRANCHES = DEPARTMENTS
export const BRANCH_OPTIONS = DEPARTMENT_OPTIONS
