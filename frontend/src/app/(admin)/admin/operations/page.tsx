import AdminOnlyGuard from "@/components/auth/AdminOnlyGuard"
import OperationsDashboard from "@/features/operations/components/OperationsDashboard"

export default function AdminOperationsPage() {
  return (
    <AdminOnlyGuard>
      <OperationsDashboard />
    </AdminOnlyGuard>
  )
}
