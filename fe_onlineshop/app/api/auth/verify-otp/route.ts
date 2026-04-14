import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import {
  findPendingByEmail,
  deletePending,
  incrementPendingAttempts,
} from "@/lib/queries/pending-registrations";
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const otp = typeof body.otp === "string" ? body.otp.trim() : "";

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email dan kode OTP wajib diisi" },
      { status: 400 }
    );
  }

  const pending = await findPendingByEmail(email);
  if (!pending) {
    return NextResponse.json(
      { error: "Pendaftaran tidak ditemukan. Silakan daftar ulang." },
      { status: 404 }
    );
  }

  if (new Date(pending.expires_at).getTime() < Date.now()) {
    await deletePending(email);
    return NextResponse.json(
      { error: "Kode OTP sudah kadaluarsa. Silakan minta kode baru." },
      { status: 410 }
    );
  }

  if (pending.attempts >= MAX_ATTEMPTS) {
    await deletePending(email);
    return NextResponse.json(
      {
        error:
          "Terlalu banyak percobaan salah. Silakan daftar ulang untuk dapat kode baru.",
      },
      { status: 429 }
    );
  }

  const valid = await bcrypt.compare(otp, pending.otp_hash);
  if (!valid) {
    await incrementPendingAttempts(email);
    const remaining = MAX_ATTEMPTS - pending.attempts - 1;
    return NextResponse.json(
      {
        error: `Kode OTP salah. Sisa percobaan: ${Math.max(0, remaining)}.`,
      },
      { status: 401 }
    );
  }

  // Race-safety: re-check email not taken before insert
  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existing.length > 0) {
    await deletePending(email);
    return NextResponse.json(
      { error: "Email sudah terdaftar di akun lain." },
      { status: 409 }
    );
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO users (name, email, phone, password_hash, email_verified_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [pending.name, email, pending.phone, pending.password_hash]
  );
  const userId = result.insertId;

  await deletePending(email);

  const token = signToken({
    userId,
    email,
    role: "customer",
  });

  const response = NextResponse.json({
    user: { id: userId, name: pending.name, email },
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
