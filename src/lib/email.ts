import nodemailer from "nodemailer";
import { formatPeso } from "@/lib/money";

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

interface ReceiptEmailData {
  customerEmail: string;
  customerName: string;
  paymentId: string;
  paymentDate: string;
  amount: string;
  principal: string;
  interestRate: string;
  termDays: number;
  dailyInstallment: string;
  remainingBalance: string;
  notes: string | null;
  collector: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildReceiptHtml(data: ReceiptEmailData): string {
  const receiptNo = data.paymentId.slice(0, 8).toUpperCase();
  const isFullyPaid = Number(data.remainingBalance) === 0;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fef2f2; padding: 24px; margin: 0;">
  <div style="max-width: 420px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #fecaca;">
    <div style="text-align: center; border-bottom: 2px solid #991b1b; padding-bottom: 20px; margin-bottom: 20px;">
      <h1 style="font-size: 20px; font-weight: 700; color: #991b1b; margin: 0;">JBV Credit Collection Services</h1>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Cash Lending System</p>
      <p style="font-size: 15px; font-weight: 600; color: #991b1b; margin: 16px 0 0;">Payment Receipt</p>
    </div>

    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Receipt No.</td>
        <td style="font-weight: 600; color: #1e293b; text-align: right;">${receiptNo}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Date Paid</td>
        <td style="font-weight: 600; color: #1e293b; text-align: right;">${data.paymentDate}</td>
      </tr>
    </table>

    <div style="margin-top: 16px; border-top: 1px solid #fecaca; padding-top: 16px;">
      <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #991b1b; margin: 0 0 8px;">Customer</p>
      <p style="font-weight: 500; color: #1e293b; margin: 0;">${escapeHtml(data.customerName)}</p>
    </div>

    <div style="margin-top: 16px; border-top: 1px solid #fecaca; padding-top: 16px;">
      <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #991b1b; margin: 0 0 8px;">Loan Details</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="color: #64748b; padding: 2px 0;">Principal</td><td style="font-weight: 500; text-align: right;">${formatPeso(data.principal)}</td></tr>
        <tr><td style="color: #64748b; padding: 2px 0;">Interest Rate</td><td style="font-weight: 500; text-align: right;">${data.interestRate}%</td></tr>
        <tr><td style="color: #64748b; padding: 2px 0;">Term</td><td style="font-weight: 500; text-align: right;">${data.termDays} days</td></tr>
        <tr><td style="color: #64748b; padding: 2px 0;">Daily Installment</td><td style="font-weight: 500; text-align: right;">${formatPeso(data.dailyInstallment)}</td></tr>
      </table>
    </div>

    <div style="margin-top: 20px; border: 2px solid #991b1b; border-radius: 8px; padding: 16px; background: #fef2f2;">
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 13px; color: #64748b;">Amount Paid</td>
          <td style="font-size: 22px; font-weight: 700; color: #991b1b; text-align: right;">${formatPeso(data.amount)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 12px; padding: 12px 16px; background: #f8fafc; border-radius: 8px;">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="color: #64748b;">Remaining Balance</td>
          <td style="font-weight: 600; color: #1e293b; text-align: right;">${formatPeso(data.remainingBalance)}</td>
        </tr>
      </table>
    </div>

    ${isFullyPaid ? `
    <div style="margin-top: 16px; padding: 12px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; text-align: center;">
      <p style="font-size: 14px; font-weight: 600; color: #166534; margin: 0;">Loan Fully Paid! �</p>
    </div>` : ""}

    ${data.notes ? `
    <div style="margin-top: 16px; border-top: 1px solid #fecaca; padding-top: 12px;">
      <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #991b1b; margin: 0 0 6px;">Notes</p>
      <p style="font-size: 12px; color: #475569; margin: 0;">${escapeHtml(data.notes!)}</p>
    </div>` : ""}

    <div style="margin-top: 24px; border-top: 1px solid #fecaca; padding-top: 16px; text-align: center;">
      <p style="font-size: 12px; color: #64748b; margin: 0;">Thank you for your payment!</p>
      ${data.collector ? `<p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0;">Collected by: ${escapeHtml(data.collector)}</p>` : ""}
    </div>
  </div>
</body>
</html>`;
}

export async function sendPaymentReceipt(data: ReceiptEmailData): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("EMAIL_USER / EMAIL_PASS not configured — skipping receipt email");
      return false;
    }

    const receiptNo = data.paymentId.slice(0, 8).toUpperCase();
    const info = await transporter.sendMail({
      from: `JBV Credit Collection Services <${process.env.EMAIL_USER}>`,
      to: data.customerEmail,
      subject: `Payment Receipt — ${receiptNo}`,
      html: buildReceiptHtml(data),
    });

    console.log(`Receipt email sent: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("Failed to send payment receipt:", err);
    return false;
  }
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) return false;

    const info = await transporter.sendMail({
      from: `JBV Credit Collection Services <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}
