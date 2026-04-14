import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendOtpEmail, generateOtp } from "@/lib/email";
import { upsertPending } from "@/lib/queries/pending-registrations";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { error: "Nama, email, no. HP, dan password wajib diisi" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  const phoneClean = phone.replace(/\s|-/g, "");
  if (!/^(\+62|62|0)8\d{7,13}$/.test(phoneClean)) {
    return NextResponse.json(
      { error: "Format no. HP tidak valid (contoh: 08xxxxxxxxxx)" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter" },
      { status: 400 }
    );
  }

  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 }
    );
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const passwordHash = await hashPassword(password);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await upsertPending({
    email,
    name,
    phone: phoneClean,
    passwordHash,
    otpHash,
    expiresAt,
  });

  try {
    await sendOtpEmail(email, otp, name);
  } catch (err) {
    console.error("OTP email failed:", err);
    return NextResponse.json(
      {
        error:
          "Gagal mengirim email OTP. Cek konfigurasi SMTP atau coba lagi sebentar.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    needsOtp: true,
    email,
    expiresAt: expiresAt.toISOString(),
    message: "Kode OTP sudah dikirim ke email Anda.",
  });
}
