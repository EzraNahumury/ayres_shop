import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface AdminRow extends RowDataPacket {
  id: number;
  role_id: number;
  name: string;
  email: string;
  password_hash: string;
  is_active: number;
  role_name: string | null;
}

export async function findAdminByEmail(email: string): Promise<AdminRow | null> {
  const [rows] = await db.query<AdminRow[]>(
    `SELECT a.id, a.role_id, a.name, a.email, a.password_hash, a.is_active,
            r.name AS role_name
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
      WHERE a.email = ?
      LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findAdminById(id: number): Promise<AdminRow | null> {
  const [rows] = await db.query<AdminRow[]>(
    `SELECT a.id, a.role_id, a.name, a.email, a.password_hash, a.is_active,
            r.name AS role_name
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
      WHERE a.id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function touchAdminLogin(id: number): Promise<void> {
  await db.query("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [id]);
}
