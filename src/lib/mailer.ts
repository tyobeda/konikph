import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Primary Email Provider: Resend
  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      const resend = new Resend(resendApiKey);
      const fromAddress = process.env.RESEND_FROM || 'PKSart Official <no-reply@pksart.site>';

      const data = await resend.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
        text,
      });

      if (data.error) {
        console.error('❌ Resend API Error:', data.error);
        return { success: false, error: data.error.message };
      }

      console.log('✅ Email successfully sent via Resend API:', data.data?.id);
      return { success: true, messageId: data.data?.id };
    } catch (err: any) {
      console.error('❌ Exception sending via Resend:', err);
    }
  }

  // 2. Fallback Email Provider: Nodemailer / Sumopod SMTP
  const host = process.env.SMTP_HOST || 'smtp.sumopod.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"PKSart Official" <${user}>`,
        to,
        subject,
        text,
        html,
      });
      console.log('✅ Email successfully sent via SMTP Fallback:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Error sending email via SMTP Fallback:', error);
      return { success: false, error: error?.message || 'Gagal mengirim email' };
    }
  }

  console.warn('⚠️ No email provider configured (neither RESEND_API_KEY nor SMTP credentials).');
  return { success: false, error: 'Email service belum dikonfigurasi di .env' };
}
