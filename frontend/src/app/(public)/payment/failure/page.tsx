"use client"

import React, { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { publicRegistrationApi } from "@/features/public-registration/services/publicRegistrationApi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { FiXCircle, FiRefreshCw, FiArrowLeft } from "react-icons/fi"

function PaymentFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const registrationId = searchParams.get("registrationId") || searchParams.get("id")
  const [retrying, setRetrying] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleRetryPayment = async () => {
    if (!registrationId) {
      router.push("/register")
      return
    }

    setRetrying(true)
    setErrorMsg(null)

    try {
      const order = await publicRegistrationApi.initiatePayment(registrationId)
      if (order && order.redirectUrl) {
        if (order.redirectUrl.startsWith("http")) {
          window.location.href = order.redirectUrl
        } else {
          router.push(order.redirectUrl)
        }
      } else {
        router.push(`/register`)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create new payment order. Please try again.")
      setRetrying(false)
    }
  }

  return (
    <Card className="shadow-xl rounded-3xl border border-slate-200 overflow-hidden bg-white p-6 sm:p-10 max-w-lg mx-auto text-center space-y-6">
      <div className="inline-flex items-center justify-center p-4 bg-rose-100 text-rose-800 rounded-full">
        <FiXCircle className="h-14 w-14" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Payment Failed</h1>
        <p className="text-sm text-slate-600">
          Your payment attempt could not be processed. Your registration details remain saved.
        </p>
      </div>

      {errorMsg && (
        <Alert type="error" title="Payment Error" message={errorMsg} />
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          type="button"
          onClick={() => router.push("/register")}
          variant="outline"
          className="font-bold w-full sm:w-auto"
        >
          <FiArrowLeft className="mr-2" /> Return to Form
        </Button>

        <Button
          type="button"
          onClick={handleRetryPayment}
          loading={retrying}
          className="bg-gradient-to-r from-cyan-800 to-blue-900 hover:from-cyan-900 hover:to-blue-950 text-white font-bold w-full sm:w-auto"
        >
          <FiRefreshCw className="mr-2" /> Retry Payment
        </Button>
      </div>
    </Card>
  )
}

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-slate-100 py-16 px-4">
      <Suspense fallback={<div className="text-center py-12 text-slate-600">Loading...</div>}>
        <PaymentFailureContent />
      </Suspense>
    </div>
  )
}
