"use client"

import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import AdminCertificateOverview from "@/components/admin/AdminCertificateOverview"
import { FiAward } from "react-icons/fi"

export default function AdminCertificatesPage() {
  return (
    <PageTransition>
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        <PermissionGuard requiredPermission="CERTIFICATE_VIEW">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                <FiAward /> Credentials & Certification
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Certificate <span className="gradient-text-cyan">Management</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Batch issue, verify cryptographic hashes, and manage completion certificates for eligible attendees.
            </p>
          </div>

          <AdminCertificateOverview />
        </PermissionGuard>
      </main>
    </PageTransition>
  )
}
