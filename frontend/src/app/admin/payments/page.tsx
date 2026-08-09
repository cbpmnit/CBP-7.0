"use client"

import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import AdminPaymentOverview from "@/components/admin/AdminPaymentOverview"
import { FiCreditCard } from "react-icons/fi"

export default function AdminPaymentsPage() {
  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
          <PermissionGuard requiredPermission="PAYMENT_VIEW">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FiCreditCard /> Finance & Reconciliation
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Payment <span className="gradient-text-cyan">Management</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Monitor transaction logs, verify student registration fees, and review reconciliation statuses.
              </p>
            </div>

            <AdminPaymentOverview />
          </PermissionGuard>
        </main>
      </div>
    </PageTransition>
  )
}
