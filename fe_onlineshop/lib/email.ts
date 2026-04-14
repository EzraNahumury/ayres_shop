import nodemailer from "nodemailer";

let cached: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }
  cached = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cached;
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  name: string
): Promise<void> {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  const safeFrom = from.replace(/\.+$/, "");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#000;color:#fff;text-align:center;padding:28px;border-radius:16px 16px 0 0;">
      <div style="font-size:28px;font-weight:700;letter-spacing:0.3em;">AYRES</div>
    </div>
    <div style="background:#fff;padding:36px 32px;border-radius:0 0 16px 16px;border:1px solid #eee;border-top:none;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#000;font-weight:600;">Verifikasi Email Anda</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
        Hai ${escapeHtml(name)},<br/>
        Gunakan kode di bawah untuk menyelesaikan pendaftaran akun AYRES Anda.
      </p>
      <div style="background:#f7f7f7;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:36px;font-weight:700;letter-spacing:0.5em;color:#000;font-family:'Courier New',monospace;">
          ${otp}
        </div>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#999;">
        Kode berlaku selama 10 menit. Jangan bagikan kode ini ke siapapun.
      </p>
      <p style="margin:24px 0 0;font-size:12px;color:#999;">
        Jika Anda tidak mendaftar di AYRES, abaikan email ini.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#aaa;margin-top:20px;">
      &copy; ${new Date().getFullYear()} AYRES
    </p>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: `"AYRES" <${safeFrom}>`,
    to,
    subject: `Kode verifikasi AYRES: ${otp}`,
    text: `Halo ${name},\n\nKode verifikasi Anda: ${otp}\n\nBerlaku 10 menit. Jangan bagikan kode ini.\n\n— AYRES`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
