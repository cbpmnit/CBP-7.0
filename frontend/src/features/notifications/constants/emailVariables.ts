import { EmailVariable } from "../types"

export const EMAIL_VARIABLES: EmailVariable[] = [
  // Student Variables
  {
    key: "studentName",
    label: "Student Name",
    category: "STUDENT",
    description: "Full registered name of the participant",
    exampleValue: "Parv Agrawal",
    dataType: "TEXT",
  },
  {
    key: "studentId",
    label: "Student ID",
    category: "STUDENT",
    description: "Official institutional roll number / student ID",
    exampleValue: "2024UCH1198",
    dataType: "TEXT",
  },
  {
    key: "email",
    label: "Email Address",
    category: "STUDENT",
    description: "Registered email address",
    exampleValue: "parvagrawal@mnit.ac.in",
    dataType: "TEXT",
  },
  {
    key: "phoneNumber",
    label: "Phone Number",
    category: "STUDENT",
    description: "Contact phone number",
    exampleValue: "+91 98765 43210",
    dataType: "TEXT",
  },

  // Payment Variables
  {
    key: "amount",
    label: "Fee Amount",
    category: "PAYMENT",
    description: "Registration fee paid in INR",
    exampleValue: "500.00",
    dataType: "NUMBER",
  },
  {
    key: "transactionId",
    label: "PhonePe Transaction ID",
    category: "PAYMENT",
    description: "Gateway payment reference transaction ID",
    exampleValue: "TXN_CBP_982410492",
    dataType: "TEXT",
  },
  {
    key: "paidAt",
    label: "Payment Date",
    category: "PAYMENT",
    description: "Date and time of payment verification",
    exampleValue: "09 August 2026, 14:30 IST",
    dataType: "DATE",
  },
  {
    key: "paymentStatus",
    label: "Payment Status",
    category: "PAYMENT",
    description: "Verification status (e.g. SUCCESS / PAID)",
    exampleValue: "SUCCESS",
    dataType: "TEXT",
  },

  // Attendance Variables
  {
    key: "sessionName",
    label: "Session Name",
    category: "ATTENDANCE",
    description: "Title of workshop session",
    exampleValue: "Day 1: Leadership & Communication Skills",
    dataType: "TEXT",
  },
  {
    key: "sessionDate",
    label: "Session Date",
    category: "ATTENDANCE",
    description: "Scheduled date of workshop session",
    exampleValue: "Monday, 10 August 2026",
    dataType: "DATE",
  },
  {
    key: "venue",
    label: "Venue Location",
    category: "ATTENDANCE",
    description: "Auditorium or hall venue",
    exampleValue: "VLTC Main Auditorium, MNIT Jaipur",
    dataType: "TEXT",
  },
  {
    key: "qrCode",
    label: "Dynamic Gate QR Pass",
    category: "ATTENDANCE",
    description: "Encrypted HMAC QR pass image for entry gate scanning",
    exampleValue: "https://cbp.mnit.ac.in/api/v1/qr/sample-pass.png",
    dataType: "IMAGE",
  },

  // Certificate Variables
  {
    key: "certificateUrl",
    label: "Certificate Download Link",
    category: "CERTIFICATE",
    description: "Direct URL to download verified PDF credential",
    exampleValue: "https://cbp.mnit.ac.in/certificate/download/CBP-2026-8841",
    dataType: "URL",
  },
  {
    key: "certificateNumber",
    label: "Certificate Credential ID",
    category: "CERTIFICATE",
    description: "Unique SHA-256 verified credential serial number",
    exampleValue: "CBP-2026-8841-MNIT",
    dataType: "TEXT",
  },
  {
    key: "issueDate",
    label: "Issue Date",
    category: "CERTIFICATE",
    description: "Official credential issuance date",
    exampleValue: "15 August 2026",
    dataType: "DATE",
  },
]

export const EVENT_TYPE_OPTIONS = [
  { value: "ATTENDANCE_QR_GENERATED", label: "Attendance QR Gate Pass Issued" },
  { value: "PAYMENT_SUCCESS", label: "Payment Confirmation Receipt" },
  { value: "REGISTRATION_SUCCESS", label: "Registration Welcome" },
  { value: "CERTIFICATE_ISSUED", label: "Official Certificate Issuance" },
  { value: "SESSION_REMINDER", label: "Upcoming Session Alert" },
]
