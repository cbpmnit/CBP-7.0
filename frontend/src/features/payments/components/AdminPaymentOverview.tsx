"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/apiClient"

export interface AdminPaymentTransactionItem {
  id?: string
  studentName?: string
  studentId?: string
  registrationId?: string
  transactionId?: string
  amount?: number
  paymentStatus?: string
  paymentMethod?: string
  paidAt?: string
  createdAt?: string
  [key: string]: unknown
}

export interface AdminPaymentOverviewDto {
  totalRegistrations: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  transactions: AdminPaymentTransactionItem[]
}
import { PageHeader } from "@/components/ui/PageHeader"
import { MetricCard } from "@/components/ui/MetricCard"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { FiRefreshCw, FiUsers, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi"

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
      const data = await apiClient.get<AdminPaymentOverviewDto>("/api/v1/admin/payments")
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
      <PageHeader
        title="Payment Management"
        count={overview?.totalRegistrations ?? transactions.length}
        countLabel="total"
        subtitle="PhonePe fee reconciliation, transaction verification, and ledger records"
        actions={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              endpoint="/api/v1/admin/payments/export"
              filenamePrefix="cbp-payments"
              params={{ search }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentOverview}
              disabled={loading}
              icon={
                <FiRefreshCw
                  className={loading ? "animate-spin text-cyan-600 text-xs" : "text-slate-500 text-xs"}
                />
              }
            >
              Refresh
            </Button>
          </div>
        }
      />

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <MetricCard
          title="Total Students"
          value={overview?.totalRegistrations ?? 0}
          icon={<FiUsers className="w-5 h-5 text-cyan-600" />}
        />
        <MetricCard
          title="Paid Students"
          value={overview?.successfulPayments ?? 0}
          icon={<FiCheckCircle className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Pending Payments"
          value={overview?.pendingPayments ?? 0}
          icon={<FiClock className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Failed Payments"
          value={overview?.failedPayments ?? 0}
          icon={<FiXCircle className="w-5 h-5 text-rose-600" />}
        />
      </div>

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
                  <StatusBadge status={tx.paymentStatus || "PENDING"} />
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
