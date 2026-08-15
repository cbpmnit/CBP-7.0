"use client"

import React from "react"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useSessions } from "../hooks/useSessions"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { SessionCard } from "./SessionCard"
import { CreateSessionModal } from "./CreateSessionModal"
import { EditSessionModal } from "./EditSessionModal"
import { DeleteSessionModal } from "./DeleteSessionModal"
import { FiUsers, FiPlus, FiRefreshCw, FiCalendar } from "react-icons/fi"

export default function SessionManagement() {
  const {
    sessions,
    loadingSessions,
    actionLoadingSessionId,
    actionType,
    message,
    error,
    showEditModal,
    editingSession,
    showCreateModal,
    setShowCreateModal,
    showDeleteModal,
    deletingSession,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleActivateSession,
    handleCloseSession,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    reload,
  } = useSessions()

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="SESSION_VIEW">
        <div className="space-y-4">
          <PageHeader
            title="Session Management"
            count={sessions.length}
            countLabel="sessions"
            subtitle="Workshop day schedules, venues, timings, and lifecycle management"
            actions={
              <div className="flex items-center gap-2">
                <Link href="/admin/attendance">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FiUsers className="text-xs text-cyan-600" />}
                  >
                    Live Attendance &rarr;
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  icon={<FiPlus className="text-xs" />}
                >
                  Create Session
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={reload}
                  disabled={loadingSessions || actionLoadingSessionId !== null}
                  icon={
                    <FiRefreshCw
                      className={loadingSessions ? "animate-spin text-xs" : "text-xs"}
                    />
                  }
                  title="Refresh sessions"
                />
              </div>
            }
          />

          {message && <Alert type="success" message={message} />}
          {error && <Alert type="error" message={error} />}

          {loadingSessions ? (
            <LoadingScreen message="Loading sessions..." inline />
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  actionLoadingSessionId={actionLoadingSessionId}
                  actionType={actionType}
                  onOpenEdit={openEditModal}
                  onOpenDelete={openDeleteModal}
                  onActivate={handleActivateSession}
                  onClose={handleCloseSession}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FiCalendar className="w-7 h-7" />}
              title="No Workshop Sessions Configured"
              description="Click 'Create Session' above to schedule your first CBP workshop day."
              actionLabel="Create Session"
              onAction={() => setShowCreateModal(true)}
            />
          )}

          <CreateSessionModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            defaultDayNumber={sessions.length + 1}
            onCreateSession={handleCreateSession}
          />

          <EditSessionModal
            isOpen={showEditModal}
            onClose={closeEditModal}
            session={editingSession}
            onUpdateSession={handleUpdateSession}
          />

          <DeleteSessionModal
            isOpen={showDeleteModal}
            onClose={closeDeleteModal}
            session={deletingSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
