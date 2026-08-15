"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { publicRegistrationApi } from "@/features/public-registration/services/publicRegistrationApi"
import { PublicRegistrationStatusResponse } from "@/features/public-registration/types"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FiCheckCircle, FiArrowLeft } from "react-icons/fi"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const registrationId = searchParams.get("id") || searchParams.get("registrationId")
  const merchantOrderId = searchParams.get("orderId") || searchParams.get("merchantOrderId") || searchParams.get("transactionId")
  const [data, setData] = useState<PublicRegistrationStatusResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!registrationId && !merchantOrderId) {
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      try {
        let response: PublicRegistrationStatusResponse
        if (merchantOrderId) {
          response = await publicRegistrationApi.getPaymentStatus(merchantOrderId)
        } else {
          response = await publicRegistrationApi.getStatus(registrationId!)
        }
        setData(response)
      } catch (err) {
        console.warn("Could not load registration confirmation", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [registrationId, merchantOrderId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="text-xs font-mono font-semibold uppercase text-slate-600">
          Confirming Payment &amp; Registration Status...
        </p>
      </div>
    )
  }

  return (
    <Card className="shadow-xl rounded-3xl border border-slate-200 overflow-hidden bg-white p-6 sm:p-10 max-w-lg mx-auto text-center space-y-6">
      <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-800 rounded-full">
        <FiCheckCircle className="h-14 w-14" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Payment Successful!</h1>
        <p className="text-sm text-slate-600">
          Thank you{data?.fullName ? `, ${data.fullName}` : ""}. Your registration for CBP 7.0 has been confirmed.
        </p>
      </div>

      {data && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2.5 font-mono text-slate-700">
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-sans font-semibold">Registration ID:</span>
            <span className="font-bold text-slate-900">{data.registrationId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-sans font-semibold">Student ID / Roll:</span>
            <span className="font-bold text-slate-900">{data.studentId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-sans font-semibold">Department:</span>
            <span className="font-bold text-slate-900">{data.department}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 font-sans font-semibold">Payment Status:</span>
            <span className="font-bold text-emerald-700">{data.paymentStatus}</span>
          </div>
          {data.paymentTransactionId && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">Transaction Ref:</span>
              <span className="font-bold text-slate-900">{data.paymentTransactionId}</span>
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="button"
          onClick={() => router.push("/registration")}
          variant="outline"
          className="font-bold w-full"
        >
          <FiArrowLeft className="mr-2" /> Return to Registration Portal
        </Button>
      </div>
    </Card>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-16 px-4">
      <Suspense fallback={<div className="text-center py-12 text-slate-600">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
}
