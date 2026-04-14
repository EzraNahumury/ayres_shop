import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

export async function getActiveCategories(): Promise<CategoryRow[]> {
  const [rows] = await db.query<CategoryRow[]>(
    `SELECT id, name, slug, parent_id FROM product_categories
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC`
  );
  return rows;
}
