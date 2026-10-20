import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via Resend or log to console in dev mode
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  // Dev mode: log to console
  if (!resend) {
    console.log('📧 Email (dev mode):', { to, subject, html: html.substring(0, 100) + '...' });
    return;
  }

  // Production: send via Resend
  try {
    const from = process.env.EMAIL_FROM || 'noreply@example.com';
    await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
