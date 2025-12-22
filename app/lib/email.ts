type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  // placeholder — swap with Resend, SendGrid, etc later
  console.log("EMAIL SENT");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML:", html);
}
