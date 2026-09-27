export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.MANDRILL_API_KEY) {
    console.log("📭 Email skipped (Mandrill not enabled yet)");
    console.log({ to, subject });
    return;
  }

  // Mandrill code goes here later
}
