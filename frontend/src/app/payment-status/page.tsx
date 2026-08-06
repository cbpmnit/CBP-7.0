"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FiRefreshCw } from "react-icons/fi"

function PaymentStatusFallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams?.get("transactionId")

  useEffect(() => {
    if (transactionId) {
      router.replace(`/payment-status/${transactionId}`)
    } else {
      router.replace("/dashboard")
    }
  }, [transactionId, router])

  return (
    <div className="glass-card rounded-3xl p-8 border-cyan-500/30 text-center">
      <FiRefreshCw className="animate-spin text-cyan-400 h-8 w-8 mx-auto mb-4" />
      <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
        Redirecting to Verification Status...
      </span>
    </div>
  )
}

export default function PaymentStatusPage() {
  return (
    <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber py-24 flex items-center justify-center">
      <Suspense fallback={
        <div className="glass-card rounded-3xl p-8 border-cyan-500/30 text-center">
          <FiRefreshCw className="animate-spin text-cyan-400 h-8 w-8 mx-auto mb-4" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">Loading...</span>
        </div>
      }>
        <PaymentStatusFallbackContent />
      </Suspense>
    </main>
  )
}
