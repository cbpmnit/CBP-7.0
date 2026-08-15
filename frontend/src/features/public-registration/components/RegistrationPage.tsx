"use client"

import React from "react"
import { usePublicRegistration } from "../hooks/usePublicRegistration"
import { RegistrationForm } from "./RegistrationForm"
import { PaymentSection } from "./PaymentSection"
import { Card } from "@/components/ui/Card"
import { FiAward } from "react-icons/fi"

export function RegistrationPage() {
  const {
    loading,
    step,
    formData,
    errors,
    errorMessage,
    orderData,
    paymentAmount,
    paymentCurrency,
    handleChange,
    handleCreateOrder,
    handleProceedToPayment,
    setStep,
  } = usePublicRegistration()

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <FiAward className="h-4 w-4" /> Official Public Participant Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            CBP 7.0 Event Registration
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Complete your registration details below to participate in the flagship CBP 7.0 Program. No prior login or account creation required.
          </p>
        </div>

        {/* Card Container */}
        <Card className="shadow-xl rounded-3xl border border-slate-200 overflow-hidden bg-white p-6 sm:p-8">
          {step === "FORM" && (
            <RegistrationForm
              formData={formData}
              errors={errors}
              errorMessage={errorMessage}
              loading={loading}
              paymentAmount={paymentAmount}
              onChange={handleChange}
              onSubmit={handleCreateOrder}
            />
          )}

          {step === "PAYMENT" && orderData && (
            <PaymentSection
              orderData={orderData}
              loading={loading}
              paymentAmount={paymentAmount}
              paymentCurrency={paymentCurrency}
              onProceedToPayment={handleProceedToPayment}
              onBack={() => setStep("FORM")}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default RegistrationPage
