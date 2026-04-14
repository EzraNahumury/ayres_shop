import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendOtpEmail, generateOtp } from "@/lib/email";
import {
  findPendingByEmail,
  refreshPendingOtp,
} from "@/lib/queries/pending-registrations";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
  }

  const pending = await findPendingByEmail(email);
  if (!pending) {
    return NextResponse.json(
      { error: "Pendaftaran tidak ditemukan. Silakan daftar ulang." },
      { status: 404 }
    );
  }

  if (pending.last_sent_at) {
    const elapsed = Date.now() - new Date(pending.last_sent_at).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `Tunggu ${wait} detik sebelum minta kode baru.` },
        { status: 429 }
      );
    }
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await refreshPendingOtp({ email, otpHash, expiresAt });

  try {
    await sendOtpEmail(email, otp, pending.name);
  } catch (err) {
    console.error("Resend OTP email failed:", err);
    return NextResponse.json(
      { error: "Gagal mengirim email OTP. Coba lagi sebentar." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    expiresAt: expiresAt.toISOString(),
  });
}
