import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface PendingRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  password_hash: string;
  otp_hash: string;
  attempts: number;
  expires_at: Date;
  last_sent_at: Date | null;
  created_at: Date;
}

export async function upsertPending(input: {
  email: string;
  name: string;
  phone: string | null;
  passwordHash: string;
  otpHash: string;
  expiresAt: Date;
}): Promise<void> {
  await db.query<ResultSetHeader>(
    `INSERT INTO pending_registrations
       (email, name, phone, password_hash, otp_hash, attempts, expires_at, last_sent_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, NOW())
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       phone = VALUES(phone),
       password_hash = VALUES(password_hash),
       otp_hash = VALUES(otp_hash),
       attempts = 0,
       expires_at = VALUES(expires_at),
       last_sent_at = NOW()`,
    [
      input.email,
      input.name,
      input.phone,
      input.passwordHash,
      input.otpHash,
      input.expiresAt,
    ]
  );
}

export async function findPendingByEmail(email: string): Promise<PendingRow | null> {
  const [rows] = await db.query<PendingRow[]>(
    `SELECT id, email, name, phone, password_hash, otp_hash, attempts, expires_at, last_sent_at, created_at
       FROM pending_registrations
      WHERE email = ?
      LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function incrementPendingAttempts(email: string): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE pending_registrations SET attempts = attempts + 1 WHERE email = ?`,
    [email]
  );
}

export async function refreshPendingOtp(input: {
  email: string;
  otpHash: string;
  expiresAt: Date;
}): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE pending_registrations
        SET otp_hash = ?, attempts = 0, expires_at = ?, last_sent_at = NOW()
      WHERE email = ?`,
    [input.otpHash, input.expiresAt, input.email]
  );
}

export async function deletePending(email: string): Promise<void> {
  await db.query<ResultSetHeader>(
    `DELETE FROM pending_registrations WHERE email = ?`,
    [email]
  );
}
