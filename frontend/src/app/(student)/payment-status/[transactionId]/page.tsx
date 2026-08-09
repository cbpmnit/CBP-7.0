"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function PaymentStatusIdRedirect() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params?.transactionId as string

  useEffect(() => {
    if (transactionId) {
      router.replace(`/payment/status/${transactionId}`)
    } else {
      router.replace("/payment/status")
    }
  }, [transactionId, router])

  return null
}
