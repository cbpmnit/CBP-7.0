"use client"

import { useState, useEffect } from "react"
import { adminService, AdminPaymentOverviewDto } from "@/services/adminService"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi"

export default function AdminPaymentOverview() {
  const [overview, setOverview] = useState<AdminPaymentOverviewDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

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

  const transactions = (overview?.transactions || []).filter((tx) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (tx.studentName && tx.studentName.toLowerCase().includes(q)) ||
      (tx.studentId && tx.studentId.toLowerCase().includes(q)) ||
      (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
      (tx.registrationId && tx.registrationId.toLowerCase().includes(q))
    )
  })

  // Mobile Cards View
  const mobileCards = transactions.map((tx, idx) => (
    <MobileRecordCard
      key={tx.transactionId || idx}
      title={tx.studentName}
      subtitle={`${tx.studentId} • Ref: ${tx.registrationId || "—"}`}
      status={tx.paymentStatus}
      fields={[
        { label: "Amount", value: `₹${tx.amount}`, highlight: true },
        { label: "Txn ID", value: tx.transactionId, mono: true },
        { label: "Status", value: tx.paymentStatus },
      ]}
    />
  ))

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Payment Management"
        count={overview?.totalRegistrations ?? transactions.length}
        countLabel="total"
        subtitle="PhonePe fee reconciliation, transaction verification, and ledger records"
        actions={
          <button
            onClick={fetchPaymentOverview}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FiRefreshCw className={loading ? "animate-spin text-cyan-600" : "text-slate-500"} />
            <span>Refresh</span>
          </button>
        }
      />

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-base text-amber-700" />
            <span>{error}</span>
          </div>
          <button onClick={fetchPaymentOverview} className="font-bold underline hover:text-amber-950">
            Retry
          </button>
        </div>
      )}

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
          <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{overview?.totalRegistrations ?? 0}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid Students</p>
          <h3 className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{overview?.successfulPayments ?? 0}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Payments</p>
          <h3 className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">{overview?.pendingPayments ?? 0}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed Payments</p>
          <h3 className="text-xl font-extrabold text-rose-700 font-mono mt-0.5">{overview?.failedPayments ?? 0}</h3>
        </div>
      </div>

      {/* Transactions Data Table */}
      <DataTable
        title="Transaction Ledger"
        totalCount={transactions.length}
        loading={loading}
        data={transactions}
        emptyMessage="No fee payment records found"
        emptySubtext="No transaction log entries available."
        mobileView={mobileCards.length > 0 ? <>{mobileCards}</> : null}
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
            <tr>
              <th className="px-4 py-2.5">Student Name</th>
              <th className="px-4 py-2.5">Student ID</th>
              <th className="px-4 py-2.5">Registration ID</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {transactions.map((tx, idx) => (
              <tr key={tx.transactionId || idx} className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2.5 font-bold text-slate-900">{tx.studentName}</td>
                <td className="px-4 py-2.5 font-mono text-slate-700">{tx.studentId}</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">{tx.registrationId}</td>
                <td className="px-4 py-2.5 font-bold font-mono text-slate-900">₹{tx.amount}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={tx.paymentStatus} />
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-500 text-[11px]">{tx.transactionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  )
}
