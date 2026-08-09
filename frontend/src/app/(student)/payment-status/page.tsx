"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function PaymentStatusRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams?.get("transactionId")

  useEffect(() => {
    if (transactionId) {
      router.replace(`/payment/status/${transactionId}`)
    } else {
      router.replace("/payment/status")
    }
  }, [transactionId, router])

  return null
}

export default function PaymentStatusRedirectPage() {
  return (
    <Suspense fallback={null}>
      <PaymentStatusRedirectContent />
    </Suspense>
  )
}
