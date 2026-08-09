import React from "react"
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi"

export interface Column<T = any> {
  key: string
  header: string
  align?: "left" | "center" | "right"
  width?: string
  render?: (item: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = any> {
  title?: string
  totalCount?: number
  selectedCount?: number
  columns?: Column<T>[]
  data?: T[]
  loading?: boolean
  emptyMessage?: string
  emptySubtext?: string
  onRowClick?: (item: T) => void
  keyExtractor?: (item: T, index: number) => string
  // Pagination
  currentPage?: number
  totalPages?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  // Custom slots
  headerActions?: React.ReactNode
  children?: React.ReactNode
  mobileView?: React.ReactNode
  className?: string
}

export function DataTable<T = any>({
  title,
  totalCount,
  selectedCount,
  columns,
  data = [],
  loading = false,
  emptyMessage = "No records found",
  emptySubtext = "No matching items for current search or filters.",
  onRowClick,
  keyExtractor = (_, idx) => idx.toString(),
  currentPage = 0,
  totalPages = 1,
  pageSize = 20,
  onPageChange,
  headerActions,
  children,
  mobileView,
  className = "",
}: DataTableProps<T>) {
  const hasPagination = totalPages > 1 || totalCount !== undefined
  const startItem = totalCount ? currentPage * pageSize + 1 : 0
  const endItem = totalCount ? Math.min((currentPage + 1) * pageSize, totalCount) : data.length

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden ${className}`}>
      {/* Table Section Header */}
      {(title || headerActions || selectedCount) && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {title && (
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {title}
              </h2>
            )}
            {totalCount !== undefined && (
              <span className="text-[10px] font-mono font-bold text-slate-400">
                ({totalCount} Total)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedCount ? (
              <span className="font-bold text-[11px] text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                {selectedCount} Selected
              </span>
            ) : null}
            {headerActions}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100/80 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 && !children ? (
        /* Empty State */
        <div className="p-10 text-center text-slate-500 space-y-1.5">
          <FiInbox className="text-2xl mx-auto text-slate-300" />
          <h3 className="text-xs font-bold text-slate-700">{emptyMessage}</h3>
          <p className="text-[11px] text-slate-400">{emptySubtext}</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View (Rendered on mobile screens when mobileView is provided) */}
          {mobileView && <div className="block md:hidden p-3 space-y-2.5">{mobileView}</div>}

          {/* Desktop Table View */}
          <div className={`overflow-x-auto ${mobileView ? "hidden md:block" : "block"}`}>
            {children ? (
              children
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
                  <tr>
                    {columns?.map((col) => (
                      <th
                        key={col.key}
                        style={{ width: col.width }}
                        className={`px-4 py-2.5 ${
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {data.map((item, index) => (
                    <tr
                      key={keyExtractor(item, index)}
                      onClick={() => onRowClick?.(item)}
                      className={`hover:bg-cyan-50/20 transition ${
                        onRowClick ? "cursor-pointer" : ""
                      }`}
                    >
                      {columns?.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-2.5 ${
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {col.render ? col.render(item, index) : (item as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Pagination Footer */}
      {hasPagination && (
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
          <span>
            {totalCount !== undefined ? (
              <>
                Showing <strong className="text-slate-900 font-mono">{startItem}</strong> to{" "}
                <strong className="text-slate-900 font-mono">{endItem}</strong> of{" "}
                <strong className="text-slate-900 font-mono">{totalCount}</strong> entries
              </>
            ) : (
              <>
                Page <strong className="text-slate-900 font-mono">{currentPage + 1}</strong> of{" "}
                <strong className="text-slate-900 font-mono">{Math.max(totalPages, 1)}</strong>
              </>
            )}
          </span>

          {onPageChange && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
                disabled={currentPage === 0}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs shadow-2xs inline-flex items-center gap-1"
                aria-label="Previous Page"
              >
                <FiChevronLeft /> Prev
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs shadow-2xs inline-flex items-center gap-1"
                aria-label="Next Page"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DataTable
