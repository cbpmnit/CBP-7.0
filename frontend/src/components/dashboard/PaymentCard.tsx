"use client"

import Link from "next/link"
import { PaymentDetailResponse } from "@/types/payment"
import { formatCurrency, formatTxnId, formatDate } from "@/utils/formatters"
import { FiCreditCard } from "react-icons/fi"

interface PaymentCardProps {
  payment: PaymentDetailResponse | null
  loading?: boolean
}

export default function PaymentCard({ payment, loading }: PaymentCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse shadow-sm">
        <div className="h-5 w-28 bg-slate-100 rounded mb-2" />
        <div className="h-7 w-20 bg-slate-100 rounded mb-2" />
        <div className="h-8 w-full bg-slate-100 rounded" />
      </div>
    )
  }

  const isSuccess = payment?.paymentStatus === "SUCCESS"
  const isPending = payment?.paymentStatus === "PENDING" || payment?.paymentStatus === "UNDER_VERIFICATION"

  const statusBadgeClass = isSuccess
    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : isPending
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : "bg-rose-50 border-rose-200 text-rose-800"

  const statusText = payment?.paymentStatus || "UNPAID"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiCreditCard /></span>
          <span>Registration Fee</span>
        </h3>
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusBadgeClass}`}>
          {statusText}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-extrabold text-slate-900 font-mono">
          {formatCurrency(payment?.amount)}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Mode: {payment?.paymentMode || "ONLINE"}
        </span>
      </div>

      <div className="space-y-1 text-xs border-t border-slate-100 pt-2.5 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Transaction ID:</span>
          <span className="font-bold text-cyan-800 font-mono">{formatTxnId(payment?.transactionId)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Payment Date:</span>
          <span className="font-mono text-slate-700">{formatDate(payment?.createdAt)}</span>
        </div>
      </div>

      <Link
        href="/payment"
        className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
      >
        {isSuccess ? "View Payment Receipt" : "Manage Fee Payment"}
      </Link>
    </div>
  )
}
