import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface AddressSnapshot {
  receiver_name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  address_line?: string;
  address_detail?: string;
  label?: string;
}

export interface OrderDetailRow {
  id: number;
  order_number: string;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  address_snapshot: AddressSnapshot | string;
  subtotal: string;
  discount_amount: string;
  shipping_amount: string;
  service_fee: string;
  grand_total: string;
  order_status: string;
  fulfillment_status: string;
  customer_note: string | null;
  admin_note: string | null;
  shipping_deadline_at: Date | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function getOrderDetail(id: number): Promise<OrderDetailRow | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT o.*,
            u.name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = ? LIMIT 1`,
    [id]
  );
  return (rows[0] as OrderDetailRow) || null;
}

export interface OrderItemRow extends RowDataPacket {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: string;
  discount_per_item: string;
  subtotal: string;
}

export async function getOrderItems(orderId: number): Promise<OrderItemRow[]> {
  const [rows] = await db.query<OrderItemRow[]>(
    `SELECT id, product_id, variant_id, product_name, variant_name, image_url,
            quantity, unit_price, discount_per_item, subtotal
       FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC`,
    [orderId]
  );
  return rows;
}

export interface StatusHistoryRow extends RowDataPacket {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string | null;
  created_at: Date;
}

export async function getStatusHistory(orderId: number): Promise<StatusHistoryRow[]> {
  const [rows] = await db.query<StatusHistoryRow[]>(
    `SELECT id, from_status, to_status, note, changed_by, created_at
       FROM order_status_histories
      WHERE order_id = ?
      ORDER BY created_at DESC, id DESC`,
    [orderId]
  );
  return rows;
}

export interface InvoiceWithPaymentRow extends RowDataPacket {
  invoice_id: number;
  invoice_number: string;
  invoice_amount: string;
  invoice_status: string;
  expired_at: Date | null;
  paid_at: Date | null;
  invoice_created_at: Date;
  payment_id: number | null;
  payment_provider: string | null;
  payment_method: string | null;
  payment_channel: string | null;
  payment_status: string | null;
  payment_paid_at: Date | null;
  payment_reference: string | null;
}

export async function getOrderInvoiceWithPayment(
  orderId: number
): Promise<InvoiceWithPaymentRow | null> {
  const [rows] = await db.query<InvoiceWithPaymentRow[]>(
    `SELECT i.id AS invoice_id, i.invoice_number, i.amount AS invoice_amount,
            i.status AS invoice_status, i.expired_at, i.paid_at,
            i.created_at AS invoice_created_at,
            p.id AS payment_id, p.provider AS payment_provider,
            p.payment_method, p.payment_channel,
            p.status AS payment_status, p.paid_at AS payment_paid_at,
            p.provider_reference AS payment_reference
       FROM invoices i
       LEFT JOIN payments p ON p.invoice_id = i.id
      WHERE i.order_id = ?
      ORDER BY i.created_at DESC, p.created_at DESC
      LIMIT 1`,
    [orderId]
  );
  return rows[0] || null;
}

export interface ShipmentRow extends RowDataPacket {
  id: number;
  courier_id: number | null;
  courier_name: string | null;
  shipping_method: "pickup" | "drop_off" | "manual";
  tracking_number: string | null;
  delivery_status: string;
  shipped_at: Date | null;
  delivered_at: Date | null;
  created_at: Date;
}

export async function getOrderShipments(orderId: number): Promise<ShipmentRow[]> {
  const [rows] = await db.query<ShipmentRow[]>(
    `SELECT s.id, s.courier_id, c.name AS courier_name,
            s.shipping_method, s.tracking_number, s.delivery_status,
            s.shipped_at, s.delivered_at, s.created_at
       FROM shipments s
       LEFT JOIN couriers c ON c.id = s.courier_id
      WHERE s.order_id = ?
      ORDER BY s.created_at DESC`,
    [orderId]
  );
  return rows;
}

export interface CreateShipmentInput {
  orderId: number;
  courierId: number | null;
  method: "pickup" | "drop_off" | "manual";
  trackingNumber: string | null;
  changedBy: string;
  changedByName?: string | null;
}

export async function createShipmentForOrder(input: CreateShipmentInput): Promise<number> {
  const items = await getOrderItems(input.orderId);
  if (items.length === 0) {
    throw new Error("Order tidak punya item");
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shipments
       (order_id, courier_id, shipping_method, tracking_number, delivery_status, shipped_at)
     VALUES (?, ?, ?, ?, 'pending', NOW())`,
    [input.orderId, input.courierId, input.method, input.trackingNumber]
  );
  const shipmentId = result.insertId;

  const values = items.map(() => `(?, ?, ?)`).join(", ");
  const params: unknown[] = [];
  for (const it of items) {
    params.push(shipmentId, it.id, it.quantity);
  }
  await db.query<ResultSetHeader>(
    `INSERT INTO shipment_items (shipment_id, order_item_id, quantity) VALUES ${values}`,
    params
  );

  const fulfillment = input.method === "pickup" ? "waiting_pickup" : "in_delivery";
  await db.query<ResultSetHeader>(
    `UPDATE orders
        SET order_status = 'shipped',
            fulfillment_status = ?
      WHERE id = ?`,
    [fulfillment, input.orderId]
  );

  await db.query<ResultSetHeader>(
    `INSERT INTO order_status_histories (order_id, from_status, to_status, note, changed_by)
     VALUES (?, NULL, 'shipped', ?, ?)`,
    [
      input.orderId,
      `Pengiriman dibuat (${input.method}${input.trackingNumber ? `, resi: ${input.trackingNumber}` : ""})`,
      input.changedByName || input.changedBy,
    ]
  );

  return shipmentId;
}

export async function updateOrderAdminNote(
  orderId: number,
  note: string | null
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE orders SET admin_note = ? WHERE id = ?`,
    [note, orderId]
  );
}

export async function transitionOrderStatus(
  orderId: number,
  fromStatus: string,
  toStatus: "completed" | "cancelled",
  changedBy: string,
  note?: string
): Promise<void> {
  const extraSql =
    toStatus === "completed"
      ? `, completed_at = NOW(), fulfillment_status = 'delivered'`
      : `, cancelled_at = NOW()`;

  await db.query<ResultSetHeader>(
    `UPDATE orders SET order_status = ?${extraSql} WHERE id = ?`,
    [toStatus, orderId]
  );

  await db.query<ResultSetHeader>(
    `INSERT INTO order_status_histories (order_id, from_status, to_status, note, changed_by)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, fromStatus, toStatus, note || null, changedBy]
  );
}

export async function getOrderStatusOnly(
  orderId: number
): Promise<{ id: number; order_status: string } | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, order_status FROM orders WHERE id = ? LIMIT 1`,
    [orderId]
  );
  return (rows[0] as { id: number; order_status: string }) || null;
}
