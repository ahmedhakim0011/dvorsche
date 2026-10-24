/** Consistent, server-independent date formatting for admin tables (always UTC, labelled as such). */
export const fmtDateTime = (d: string | number | Date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(d)) + " UTC";

export const fmtDate = (d: string | number | Date) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(d));
