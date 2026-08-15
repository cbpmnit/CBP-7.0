"use client"

import React from "react"
import { Button } from "@/components/ui/Button"
import { PublicOrderResponse } from "../types"
import { FiCreditCard, FiLock, FiArrowRight } from "react-icons/fi"

interface PaymentSectionProps {
  orderData: PublicOrderResponse
  loading: boolean
  paymentAmount: number
  paymentCurrency: string
  onProceedToPayment: () => void
  onBack: () => void
}

export function PaymentSection({
  orderData,
  loading,
  paymentAmount,
  paymentCurrency,
  onProceedToPayment,
  onBack,
}: PaymentSectionProps) {
  const formattedAmount = `₹${(paymentAmount || orderData.amount || 100).toFixed(2)}`

  return (
    <div className="space-y-6 text-center">
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-100 text-cyan-800 rounded-full">
          <FiCreditCard className="h-8 w-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">CBP 7.0 Registration Fee</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Order #{orderData.merchantOrderId}</p>
        </div>

        <div className="py-3 border-y border-slate-200 flex justify-between items-center text-sm">
          <span className="text-slate-600 font-semibold">Total Payable Amount:</span>
          <span className="text-2xl font-black text-cyan-800">{formattedAmount}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <FiLock className="text-emerald-800" />
          <span>Encrypted Payment Processing Gateway</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Edit Details
        </Button>

        <Button
          type="button"
          onClick={onProceedToPayment}
          loading={loading}
          className="w-full sm:w-auto bg-gradient-to-r from-cyan-800 to-blue-900 hover:from-cyan-900 hover:to-blue-950 text-white font-bold"
        >
          Proceed to Payment <FiArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
