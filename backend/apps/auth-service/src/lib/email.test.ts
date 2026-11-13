import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildPasswordResetHtml,
  buildPasswordResetText,
  buildPasswordResetSuccessHtml,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  verifySmtpConnection,
  getMailTransporter,
} from './email.js';

describe('email templates', () => {
  it('renders password reset html with resetUrl and recipient name', () => {
    const html = buildPasswordResetHtml({
      to: 'test@example.com',
      resetUrl: 'https://mindora.rw/reset-password?token=abc-123',
      userName: 'Alice',
    });

    expect(html).toContain('Hello Alice,');
    expect(html).toContain('https://mindora.rw/reset-password?token=abc-123');
    expect(html).toContain('15 minutes');
    expect(html).toContain('Mindora');
  });

  it('renders password reset html without recipient name fallback', () => {
    const html = buildPasswordResetHtml({
      to: 'test@example.com',
      resetUrl: 'https://mindora.rw/reset-password?token=abc-123',
    });

    expect(html).toContain('Hello,');
    expect(html).toContain('https://mindora.rw/reset-password?token=abc-123');
  });

  it('renders password reset text fallback', () => {
    const text = buildPasswordResetText({
      to: 'test@example.com',
      resetUrl: 'https://mindora.rw/reset-password?token=abc-123',
      userName: 'Bob',
    });

    expect(text).toContain('Hello Bob,');
    expect(text).toContain('https://mindora.rw/reset-password?token=abc-123');
    expect(text).toContain('15 minutes');
  });

  it('renders password reset success html', () => {
    const html = buildPasswordResetSuccessHtml({
      to: 'test@example.com',
      userName: 'Alice',
    });

    expect(html).toContain('Hello Alice,');
    expect(html).toContain('successfully updated');
    expect(html).toContain('logged out');
  });
});

describe('sendPasswordResetEmail & sendPasswordResetSuccessEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true on successful email send', async () => {
    const transporter = getMailTransporter();
    const sendMailSpy = vi.spyOn(transporter, 'sendMail').mockResolvedValue({
      messageId: 'msg-123',
    } as any);

    const result = await sendPasswordResetEmail({
      to: 'test@example.com',
      resetUrl: 'https://mindora.rw/reset-password?token=abc',
    });

    expect(result).toBe(true);
    expect(sendMailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Reset your Mindora password',
      })
    );
  });

  it('gracefully catches errors and returns false if SMTP send fails', async () => {
    const transporter = getMailTransporter();
    vi.spyOn(transporter, 'sendMail').mockRejectedValue(new Error('SMTP connection failed'));

    const result = await sendPasswordResetEmail({
      to: 'test@example.com',
      resetUrl: 'https://mindora.rw/reset-password?token=abc',
    });

    expect(result).toBe(false);
  });

  it('returns true on successful confirmation email send', async () => {
    const transporter = getMailTransporter();
    const sendMailSpy = vi.spyOn(transporter, 'sendMail').mockResolvedValue({
      messageId: 'msg-456',
    } as any);

    const result = await sendPasswordResetSuccessEmail({
      to: 'test@example.com',
    });

    expect(result).toBe(true);
    expect(sendMailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Your Mindora password was updated',
      })
    );
  });

  it('verifies SMTP connection status correctly', async () => {
    const transporter = getMailTransporter();
    vi.spyOn(transporter, 'verify').mockResolvedValue(true as any);

    const res = await verifySmtpConnection();
    expect(res.success).toBe(true);
  });
});

