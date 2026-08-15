"use client"

import React from "react"
import Link from "next/link"
import { usePublicRegistration } from "../hooks/usePublicRegistration"
import { RegistrationForm } from "./RegistrationForm"
import { PaymentSection } from "./PaymentSection"
import { Card } from "@/components/ui/Card"
import { FiAward, FiSearch } from "react-icons/fi"

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

          {/* Already Registered CTA */}
          <div className="pt-2">
            <div className="inline-flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xs max-w-2xl mx-auto text-left">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">Already registered?</span> Verify your registration and payment status using Student ID or Mobile Number.
              </div>
              <Link
                href="/registration/status"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-cyan-900 font-bold text-xs rounded-xl border border-slate-200 transition-colors shrink-0"
              >
                <FiSearch className="h-3.5 w-3.5" /> Check Registration Status
              </Link>
            </div>
          </div>
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
