"use client"

import { useState, useEffect } from "react"
import { adminService, AdminPaymentOverviewDto } from "@/services/adminService"
import { FiCheckCircle, FiClock, FiXCircle, FiRefreshCw, FiAlertCircle } from "react-icons/fi"

export default function AdminPaymentOverview() {
  const [overview, setOverview] = useState<AdminPaymentOverviewDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentOverview()
  }, [])

  const fetchPaymentOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getPaymentOverview()
      setOverview(data)
    } catch (err: any) {
      setError("Unable to load payment overview data.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="shrink-0 text-base text-amber-700" />
          <span>{error}</span>
        </div>
        <button onClick={fetchPaymentOverview} className="font-bold underline hover:text-amber-950">
          Retry
        </button>
      </div>
    )
  }

  const transactions = overview?.transactions || []

  return (
    <div className="space-y-6">
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Registrations</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{overview?.totalRegistrations ?? 0}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Successful Payments</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{overview?.successfulPayments ?? 0}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Payments</p>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{overview?.pendingPayments ?? 0}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Failed Transactions</p>
          <h3 className="text-2xl font-extrabold text-rose-700 mt-1">{overview?.failedPayments ?? 0}</h3>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Payment Transactions Log ({transactions.length})
          </h3>
          <button onClick={fetchPaymentOverview} className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold hover:text-slate-900">
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Registration ID</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx, idx) => (
                  <tr key={tx.transactionId || idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{tx.studentName}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-700">{tx.studentId}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{tx.registrationId}</td>
                    <td className="px-6 py-3.5 font-bold font-mono text-slate-900">₹{tx.amount}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.paymentStatus === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : tx.paymentStatus === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {tx.paymentStatus === "SUCCESS" ? <FiCheckCircle /> : tx.paymentStatus === "PENDING" ? <FiClock /> : <FiXCircle />}
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{tx.transactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No fee payment transaction records found.
          </div>
        )}
      </div>
    </div>
  )
}
