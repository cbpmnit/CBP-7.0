const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9900"

export interface CsvExportOptions {
  endpoint: string
  filenamePrefix: string
  params?: Record<string, string | number | boolean | undefined | null>
}

/**
 * Downloads a CSV export from the backend with current active filters.
 */
export async function downloadCsvExport({
  endpoint,
  filenamePrefix,
  params = {},
}: CsvExportOptions): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null

  // Build query string from non-empty params
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
      query.append(key, String(val))
    }
  })

  const queryString = query.toString()
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}${queryString ? `?${queryString}` : ""}`

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No records available for export.")
    }
    throw new Error("Unable to export data. Please try again.")
  }

  const blob = await response.blob()
  if (blob.size === 0) {
    throw new Error("No records available for export.")
  }

  // Dynamic date YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]
  const filename = `${filenamePrefix}-${today}.csv`

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
