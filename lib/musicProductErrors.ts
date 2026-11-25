// Return actionable admin messages without exposing SQL, private URLs or credentials.
export function musicProductError(error: unknown) {
  const value = error && typeof error === "object" ? error as { code?: unknown; errorCode?: unknown; name?: unknown } : {};
  const rawCode = typeof value.code === "string" ? value.code : value.errorCode;
  const code = typeof rawCode === "string" && /^P\d{4}$/.test(rawCode) ? rawCode : null;
  let message = "The release could not be saved. Your changes are still in this form. Check the server log before submitting again.";
  let status = 500;
  if (code === "P2021" || code === "P2022") {
    message = "The website database is missing a required music table or field. Apply the website database update to the database used by this deployment, then save again.";
    status = 503;
  } else if (code === "P2028") {
    message = "The database transaction could not complete. Your changes are still in this form. Check the saved release before trying again.";
    status = 503;
  } else if (["P1000", "P1001", "P1002", "P1008", "P1017", "P2024", "P2037"].includes(code || "")) {
    message = "The website could not complete its database connection. Your changes are still in this form. Check the saved release and database connection before trying again.";
    status = 503;
  } else if (code === "P2002") {
    message = "A value conflicts with an existing record. Your changes are still in this form. Check the server log for the affected field.";
    status = 409;
  } else if (code === "P2025" || code === "P2018") {
    message = "A release, track or artist needed for this save no longer exists. Refresh the release list and reopen the saved release.";
    status = 409;
  } else if (["P2003", "P2014", "P2034"].includes(code || "")) {
    message = "The release conflicts with related records or another edit. Your changes are still in this form. Check the server log before changing or removing tracks.";
    status = 409;
  } else if (error instanceof SyntaxError || value.name === "PrismaClientValidationError") {
    message = "The save request could not be validated. Your changes are still in this form. Check the server log for the invalid field.";
    status = 400;
  }
  return { status, body: { error: code ? `${message} (${code})` : message, ...(code ? { code } : {}) } };
}
