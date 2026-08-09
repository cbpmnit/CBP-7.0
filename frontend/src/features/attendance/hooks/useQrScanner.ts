"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { attendanceApi } from "../services/attendanceApi"
import { AttendanceSessionDto, ScanAttendanceResponse } from "../types"
import { Html5Qrcode } from "html5-qrcode"

export function useQrScanner() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Scanner state
  const [qrTokenInput, setQrTokenInput] = useState("")
  const [validating, setValidating] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lastScanResult, setLastScanResult] = useState<ScanAttendanceResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanAttendanceResponse[]>([])

  const qrScannerRef = useRef<Html5Qrcode | null>(null)

  const fetchActiveSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      let data: AttendanceSessionDto[] = []
      try {
        data = await attendanceApi.getVolunteerSessions()
      } catch {
        data = await attendanceApi.getAllSessions()
      }
      const list = data || []
      setSessions(list)
      const active = list.find((s) => s.status === "ACTIVE")
      if (active) {
        setSelectedSessionId(active.id)
      } else if (list.length > 0) {
        setSelectedSessionId(list[0].id)
      } else {
        setSelectedSessionId("")
      }
    } catch (err) {
      console.error("API authorization failure: Failed to load volunteer attendance sessions", err)
      setSessions([])
      setSelectedSessionId("")
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  const stopCamera = useCallback(async () => {
    if (qrScannerRef.current && cameraActive) {
      try {
        await qrScannerRef.current.stop()
      } catch (err) {
        console.warn("Camera stop issue", err)
      } finally {
        setCameraActive(false)
      }
    }
  }, [cameraActive])

  useEffect(() => {
    fetchActiveSessions()
    return () => {
      stopCamera()
    }
  }, [fetchActiveSessions, stopCamera])

  const processToken = useCallback(async (token: string) => {
    setValidating(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const res = await attendanceApi.scanAttendanceQr(token)
      setLastScanResult(res)
      setSuccessMessage("Attendance recorded successfully ✓")
      setScanHistory((prev) => [res, ...prev.slice(0, 9)])
      setQrTokenInput("")
    } catch (err: any) {
      const msg = err?.message || "Scan failed"
      if (msg.toLowerCase().includes("already")) {
        setErrorMessage("Already marked attendance for this student.")
      } else if (msg.toLowerCase().includes("expired")) {
        setErrorMessage("Expired QR pass. Please ask student to refresh their gate pass.")
      } else if (msg.toLowerCase().includes("wrong") || msg.toLowerCase().includes("session")) {
        setErrorMessage("Wrong session: This QR pass belongs to a different day session.")
      } else {
        setErrorMessage(msg)
      }
    } finally {
      setValidating(false)
    }
  }, [])

  const startCamera = async () => {
    if (!selectedSessionId) {
      setErrorMessage("Please select an active session before starting the camera scanner.")
      return
    }

    setCameraError(null)
    setErrorMessage(null)
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode("volunteer-qr-reader")
      }

      await qrScannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          processToken(decodedText.trim())
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err: any) {
      console.warn("Camera start warning/fallback", err)
      setCameraError(
        err?.message || "Unable to access video camera. You can scan or type QR tokens manually below."
      )
      setCameraActive(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrTokenInput.trim()) return
    if (!selectedSessionId) {
      setErrorMessage("Please select an active session before submitting a token.")
      return
    }
    processToken(qrTokenInput.trim())
  }

  return {
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    loadingSessions,
    qrTokenInput,
    setQrTokenInput,
    validating,
    cameraActive,
    cameraError,
    lastScanResult,
    errorMessage,
    successMessage,
    scanHistory,
    startCamera,
    stopCamera,
    handleManualSubmit,
    processToken,
  }
}
