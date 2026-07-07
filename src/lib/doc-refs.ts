// Client-safe document constants (no server imports).

// Sentinel criterion_ref used for the auditor's final audit report (so it never
// collides with a real criterion like "1.1").
export const AUDIT_REPORT_REF = '__audit_report__'
