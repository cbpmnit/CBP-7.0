/**
 * Safe formatting utilities to ensure UI never displays undefined or null.
 */

export function formatTxnId(id?: string | null): string {
  if (!id || id.trim() === "") return "N/A"
  return id
}

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0"
  return `₹${amount.toLocaleString("en-IN")}`
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A"
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

export function formatTime(dateTimeString?: string | null): string {
  if (!dateTimeString) return "N/A"
  try {
    const d = new Date(dateTimeString)
    if (isNaN(d.getTime())) return dateTimeString
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateTimeString
  }
}

export function formatPercentage(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0%"
  return `${val.toFixed(1)}%`
}

export function safeText(val?: string | null, fallback = "N/A"): string {
  if (!val || val.trim() === "") return fallback
  return val
}
