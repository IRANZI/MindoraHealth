import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config.js';

let transporter: Transporter | null = null;

export function getMailTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const mailer = getMailTransporter();
    await mailer.verify();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[email] SMTP verify failed: ${message}`);
    return { success: false, error: message };
  }
}

export interface SendPasswordResetOptions {
  to: string;
  resetUrl: string;
  userName?: string;
}

export function buildPasswordResetHtml(options: SendPasswordResetOptions): string {
  const greeting = options.userName ? `Hello ${options.userName},` : 'Hello,';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #1e3a8a;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .message {
      font-size: 15px;
      color: #334155;
      margin-bottom: 28px;
    }
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .reset-btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    .security-notice {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      border-radius: 4px;
      margin-top: 28px;
      font-size: 13px;
      color: #1e40af;
      line-height: 1.5;
    }
    .alt-link {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
    }
    .footer {
      padding: 24px 32px;
      background-color: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mindora</h1>
    </div>
    <div class="content">
      <p class="greeting">${greeting}</p>
      <p class="message">
        We received a request to reset the password for your Mindora account.
        Click the button below to choose a new password:
      </p>
      <div class="button-wrapper">
        <a href="${options.resetUrl}" target="_blank" class="reset-btn">Reset Password</a>
      </div>
      <div class="security-notice">
        <strong>Important:</strong> This password reset link is valid for <strong>15 minutes</strong>.
        If you did not request a password reset, please ignore this email or contact support if you have concerns.
      </div>
      <div class="alt-link">
        If the button above does not work, copy and paste this URL into your browser:<br>
        <a href="${options.resetUrl}" style="color: #2563eb;">${options.resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Mindora. Mental Health Platform. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

export function buildPasswordResetText(options: SendPasswordResetOptions): string {
  const greeting = options.userName ? `Hello ${options.userName},` : 'Hello,';
  return `${greeting}

We received a request to reset the password for your Mindora account.
Use the following link to choose a new password:

${options.resetUrl}

This link is valid for 15 minutes.
If you did not request a password reset, please ignore this email.

— Mindora Team`;
}

export async function sendPasswordResetEmail(options: SendPasswordResetOptions): Promise<boolean> {
  const mailer = getMailTransporter();
  const html = buildPasswordResetHtml(options);
  const text = buildPasswordResetText(options);

  try {
    const info = await mailer.sendMail({
      from: config.smtp.from,
      to: options.to,
      subject: 'Reset your Mindora password',
      text,
      html,
    });
    console.log(`[email] Password reset email sent to ${options.to} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[email] Failed to send password reset email to ${options.to}:`, error);
    return false;
  }
}

export interface SendPasswordResetSuccessOptions {
  to: string;
  userName?: string;
}

export function buildPasswordResetSuccessHtml(options: SendPasswordResetSuccessOptions): string {
  const greeting = options.userName ? `Hello ${options.userName},` : 'Hello,';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .container {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #166534;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .notice {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      border-radius: 4px;
      margin-top: 24px;
      font-size: 13px;
      color: #991b1b;
    }
    .footer {
      padding: 24px 32px;
      background-color: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mindora</h1>
    </div>
    <div class="content">
      <p class="greeting">${greeting}</p>
      <p>Your password for Mindora has been successfully updated.</p>
      <p>All active sessions on your other devices have been logged out for your security.</p>
      <div class="notice">
        <strong>Did not make this change?</strong>
        If you did not perform this password reset, please contact Mindora support immediately.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Mindora. Mental Health Platform. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

export async function sendPasswordResetSuccessEmail(
  options: SendPasswordResetSuccessOptions
): Promise<boolean> {
  const mailer = getMailTransporter();
  const html = buildPasswordResetSuccessHtml(options);
  const text = `Hello,

Your password for Mindora has been successfully updated.
All other active sessions have been logged out for your security.

If you did not perform this change, please contact Mindora support immediately.

— Mindora Team`;

  try {
    const info = await mailer.sendMail({
      from: config.smtp.from,
      to: options.to,
      subject: 'Your Mindora password was updated',
      text,
      html,
    });
    console.log(`[email] Password reset confirmation email sent to ${options.to} (messageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[email] Failed to send password reset confirmation email to ${options.to}:`, error);
    return false;
  }
}

