import { db } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, passwordHash]
  );

  const token = signToken({
    userId: result.insertId,
    email,
    role: "customer",
  });

  const response = NextResponse.json({
    user: { id: result.insertId, name, email },
    token,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
