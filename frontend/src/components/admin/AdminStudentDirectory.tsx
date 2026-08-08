"use client"

import { useState, useEffect } from "react"
import { adminService, AdminStudentDetailDto } from "@/services/adminService"
import { FiSearch, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi"

export default function AdminStudentDirectory() {
  const [students, setStudents] = useState<AdminStudentDetailDto[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async (query = searchQuery) => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getStudents(query)
      setStudents(data)
    } catch (err: any) {
      setError("Unable to retrieve student directory records.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStudents(searchQuery)
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Student Directory & Lookup
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Search student profile, payment, and attendance records</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, ID, or Email..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none w-64"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-base text-amber-700" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchStudents()} className="font-bold underline hover:text-amber-950">
            Retry
          </button>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Directory Records ({students.length})
          </span>
          <button
            onClick={() => fetchStudents()}
            className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold hover:text-slate-900"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <div className="h-6 w-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading student records...
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Student ID</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Branch & Course</th>
                  <th className="px-6 py-3">Payment Status</th>
                  <th className="px-6 py-3">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-mono font-extrabold text-slate-900">{student.studentId}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono">{student.email}</td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      {student.branch} ({student.course})
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          student.paymentCompleted
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {student.paymentCompleted ? <FiCheckCircle /> : <FiXCircle />}
                        {student.paymentCompleted ? "Paid ✓" : "Pending Fee"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold font-mono text-cyan-700">
                      {student.attendancePercentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No matching student records found.
          </div>
        )}
      </div>
    </div>
  )
}
