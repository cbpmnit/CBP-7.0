export function formatToIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "N/A"
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return "N/A"
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d) + " IST"
    )
  } catch {
    return "N/A"
  }
}
