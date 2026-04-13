# Ayres Shop Project Documentation

## Ringkasan
Proyek ini adalah online shop dengan 2 area utama:

1. `Customer App`
2. `Admin Panel`

Sisi customer dipakai untuk browsing produk, login, checkout, pengelolaan alamat, dan pembayaran. Sisi admin dipakai untuk mengelola produk, promosi, pesanan, dan operasional toko.

Dokumen ini menyatukan `flow_admin.md` dan `flow_user.md` menjadi satu arsitektur data dan arsitektur sistem yang konsisten.

## Dokumen Referensi
- [flow_admin.md](D:\ayres_shop\flow_admin.md)
- [flow_user.md](D:\ayres_shop\flow_user.md)

---

## 1. Visi Produk

Membangun online shop milik sendiri dengan pengalaman yang familiar seperti Shopee:
- katalog produk yang mudah dibrowse
- detail produk dengan variasi dan promo
- checkout yang cepat
- alamat dan pengiriman yang jelas
- pembayaran via Midtrans atau Xendit
- panel admin yang kuat untuk produk, promosi, dan order fulfillment

---

## 2. Scope Sistem

## 2.1 Customer App
- login dan register
- katalog produk
- detail produk
- cart
- checkout
- alamat customer
- pembayaran
- pesanan saya

## 2.2 Admin Panel
- product management
- promotion center
- order management
- admin users dan audit log

---

## 3. Arsitektur Modul

Sistem dibagi menjadi beberapa domain inti:

1. `Identity`
2. `Catalog`
3. `Cart`
4. `Checkout`
5. `Order`
6. `Payment`
7. `Promotion`
8. `Shipping`
9. `Admin`
10. `Audit`

## 3.1 Identity
Menangani:
- customer account
- admin account
- login
- register
- session
- roles dan permissions

## 3.2 Catalog
Menangani:
- kategori produk
- produk
- variasi produk
- gambar produk
- atribut produk
- harga dasar
- stok

## 3.3 Cart
Menangani:
- keranjang user
- item keranjang
- snapshot harga saat item dimasukkan

## 3.4 Checkout
Menangani:
- draft checkout
- alamat aktif
- ongkir
- voucher / promo yang terpasang
- final total sebelum order dibuat

## 3.5 Order
Menangani:
- order header
- order item
- invoice
- status order
- status fulfillment

## 3.6 Payment
Menangani:
- payment transaction
- payment provider
- callback gateway
- sinkronisasi status payment

## 3.7 Promotion
Menangani:
- promo toko
- paket diskon
- kombo hemat
- rule promo per produk / variasi

## 3.8 Shipping
Menangani:
- alamat user
- kurir
- service level
- shipment
- tracking / resi

## 3.9 Admin
Menangani:
- admin action
- moderation data produk
- proses order
- pengiriman massal

## 3.10 Audit
Menangani:
- log perubahan data penting
- histori perubahan order, promo, produk, dan payment

---

## 4. Sinkronisasi Flow Admin dan Customer

## 4.1 Prinsip Sinkronisasi
`Admin` dan `Customer` tidak boleh punya model data terpisah untuk entitas inti. Keduanya harus membaca dan menulis ke domain yang sama, tetapi lewat rule dan permission yang berbeda.

Contoh:
- admin membuat dan mengubah `product`
- customer hanya membaca `product` yang berstatus `Live`
- customer membuat `order`
- admin memproses `order` yang dibuat customer
- admin membuat `promotion`
- customer melihat harga promo yang dihasilkan sistem promosi

## 4.2 Mapping Modul Admin ke Customer

### Product Admin -> Catalog Customer
- admin membuat produk
- admin mengisi spesifikasi, variasi, harga, stok, pengiriman
- jika status produk `Live`, produk tampil di katalog customer
- detail product customer membaca data dari `products`, `product_variants`, `product_images`, `product_attribute_values`

### Promotion Admin -> Pricing Customer
- admin membuat promo toko, paket diskon, atau kombo hemat
- engine pricing menghitung harga tampil dan diskon aktif di sisi customer
- customer melihat harga promo di katalog, detail produk, cart, dan checkout

### Order Customer -> Order Admin
- customer membuat order dari checkout
- payment sukses mengubah status order menjadi siap diproses
- admin melihat order di panel `Pesanan`
- admin mengatur shipment dan mengubah fulfillment status
- customer melihat update status pada `Pesanan Saya`

### Address Customer -> Shipping Admin
- customer menyimpan alamat
- checkout menggunakan alamat aktif untuk menghitung ongkir
- admin melihat snapshot alamat pengiriman pada order

### Payment Gateway -> Admin dan Customer
- customer memilih metode bayar
- backend membuat payment transaction ke Midtrans / Xendit
- callback gateway memperbarui status order
- customer melihat status pembayaran
- admin melihat status pembayaran dan status proses order

---

## 5. Arsitektur Data Bersama

## 5.1 Entitas Inti Tunggal
Berikut adalah entitas inti yang dipakai bersama oleh admin dan customer:

### Identity
- `users`
- `user_sessions`
- `admins`
- `admin_roles`

### Catalog
- `product_categories`
- `brands`
- `products`
- `product_images`
- `product_attributes`
- `product_attribute_values`
- `product_variants`
- `product_variant_images`
- `product_shipping_profiles`

### Customer Experience
- `user_addresses`
- `carts`
- `cart_items`
- `wishlists`
- `product_reviews`

### Promotion
- `promotions`
- `promotion_store_items`
- `promotion_package_tiers`
- `promotion_package_items`
- `promotion_combo_main_items`
- `promotion_combo_addon_items`

### Order and Payment
- `orders`
- `order_items`
- `order_status_histories`
- `invoices`
- `payments`
- `payment_callbacks`
- `shipments`
- `shipment_items`

### Reference and Audit
- `couriers`
- `payment_methods`
- `audit_logs`

## 5.2 Sumber Kebenaran per Domain

### Product
Source of truth:
- `products`
- `product_variants`
- `product_images`

### Promo
Source of truth:
- `promotions`
- tabel item promosi turunan

### Harga tampil customer
Source of truth:
- harga dasar dari `products` / `product_variants`
- rule promo aktif dari `promotions`

### Cart
Source of truth:
- `carts`
- `cart_items`

### Order
Source of truth:
- `orders`
- `order_items`
- `order_status_histories`

### Payment
Source of truth:
- `payments`
- `payment_callbacks`
- notifikasi resmi provider

### Shipment
Source of truth:
- `shipments`
- `shipment_items`

---

## 6. Relasi Data Tingkat Tinggi

```mermaid
erDiagram
    USERS ||--o{ USER_ADDRESSES : has
    USERS ||--|| CARTS : owns
    CARTS ||--o{ CART_ITEMS : contains
    USERS ||--o{ ORDERS : places

    PRODUCT_CATEGORIES ||--o{ PRODUCTS : groups
    BRANDS ||--o{ PRODUCTS : labels
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCTS ||--o{ PRODUCT_ATTRIBUTE_VALUES : stores
    PRODUCTS ||--|| PRODUCT_SHIPPING_PROFILES : ships_with

    PRODUCTS ||--o{ CART_ITEMS : selected
    PRODUCT_VARIANTS ||--o{ CART_ITEMS : selected_variant
    PRODUCTS ||--o{ ORDER_ITEMS : ordered
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : ordered_variant

    PROMOTIONS ||--o{ PROMOTION_STORE_ITEMS : includes
    PROMOTIONS ||--o{ PROMOTION_PACKAGE_TIERS : defines
    PROMOTIONS ||--o{ PROMOTION_PACKAGE_ITEMS : includes
    PROMOTIONS ||--o{ PROMOTION_COMBO_MAIN_ITEMS : includes
    PROMOTIONS ||--o{ PROMOTION_COMBO_ADDON_ITEMS : includes

    ORDERS ||--o{ ORDER_ITEMS : has
    ORDERS ||--o{ ORDER_STATUS_HISTORIES : tracks
    ORDERS ||--o{ INVOICES : billed_by
    INVOICES ||--|| PAYMENTS : paid_by
    PAYMENTS ||--o{ PAYMENT_CALLBACKS : receives
    ORDERS ||--o{ SHIPMENTS : fulfilled_by
    SHIPMENTS ||--o{ SHIPMENT_ITEMS : contains

    ADMIN_ROLES ||--o{ ADMINS : has
    ADMINS ||--o{ AUDIT_LOGS : writes
```

---

## 7. Lifecycle Status yang Harus Konsisten

## 7.1 Product Status
- `Draft`
- `Live`
- `Under Review`
- `Archived`
- `Rejected`

Rule:
- customer hanya bisa melihat produk `Live`
- `Archived` tidak tampil di customer
- promo hanya bisa aktif pada produk / variasi yang valid

## 7.2 Promotion Status
- `Draft`
- `Scheduled`
- `Active`
- `Paused`
- `Ended`
- `Cancelled`

Rule:
- hanya promo `Active` yang mempengaruhi harga customer
- promo `Scheduled` bisa dipreview admin tetapi belum aktif di frontend customer

## 7.3 Order Status
- `Unpaid`
- `Pending Payment`
- `Paid`
- `Processed`
- `Ready to Ship`
- `Shipped`
- `Completed`
- `Cancelled`
- `Refunded`

## 7.4 Fulfillment Status
- `Pending`
- `Packed`
- `Waiting Pickup`
- `In Delivery`
- `Delivered`
- `Returned`

## 7.5 Payment Status
- `Pending`
- `Paid`
- `Failed`
- `Expired`
- `Cancelled`
- `Refunded`

Rule:
- order status final tidak boleh ditentukan frontend
- payment status final hanya ditentukan backend setelah verifikasi gateway

---

## 8. Arsitektur Harga dan Promo

Harga yang dilihat customer tidak langsung diambil dari satu field final, tetapi dihitung dari beberapa komponen:

1. harga dasar produk / variasi
2. promo toko aktif
3. paket diskon aktif
4. kombo hemat aktif
5. voucher saat checkout

## 8.1 Prinsip Harga
- `base_price` berasal dari `products` atau `product_variants`
- `display_price` dihitung untuk katalog dan detail produk
- `checkout_price` dihitung ulang saat checkout
- `paid_price` disimpan di `order_items` sebagai snapshot final transaksi

## 8.2 Snapshot Penting
Simpan snapshot agar histori tidak berubah saat admin mengubah data setelah order dibuat:
- nama produk saat order
- nama variasi saat order
- harga saat order
- diskon saat order
- alamat pengiriman saat order
- ongkir saat order

---

## 9. Arsitektur Checkout dan Payment

## 9.1 Flow Teknis Singkat
1. Customer pilih item dari cart atau buy now.
2. Backend buat draft checkout.
3. Customer pilih alamat dan kurir.
4. Backend hitung ongkir dan total akhir.
5. Customer klik `Buat Pesanan`.
6. Backend buat:
   - `orders`
   - `order_items`
   - `invoices`
   - `payments`
7. Backend call Midtrans atau Xendit.
8. Gateway kirim callback.
9. Backend verifikasi callback.
10. Backend update payment status dan order status.
11. Admin memproses order.

## 9.2 Integrasi Payment

### Midtrans
- gunakan Snap atau Core API
- backend menyimpan `provider_reference`
- callback wajib diverifikasi server-side

### Xendit
- gunakan invoice atau payment request
- backend menyimpan `provider_reference`
- webhook wajib diverifikasi signature

## 9.3 Rule Payment
- satu order boleh punya lebih dari satu invoice historis, tapi hanya satu invoice aktif
- satu invoice punya satu payment utama
- payment retry harus tetap terhubung ke order yang sama

---

## 10. Boundary Frontend dan Backend

## 10.1 Frontend Customer
Tanggung jawab:
- render katalog
- render detail produk
- cart dan checkout UI
- halaman alamat
- halaman payment status

Tidak boleh menjadi sumber kebenaran untuk:
- harga final
- payment final status
- stok final
- order final status

## 10.2 Frontend Admin
Tanggung jawab:
- CRUD produk
- kelola promo
- proses pesanan
- proses pengiriman

## 10.3 Backend API
Tanggung jawab:
- autentikasi
- business rules
- pricing calculation
- order creation
- payment integration
- callback verification
- shipment orchestration
- audit logging

---

## 11. Struktur Route Tingkat Tinggi

## 11.1 Customer Frontend
- `/`
- `/collections`
- `/collections/:slug`
- `/products/:slug`
- `/login`
- `/register`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/:id`
- `/addresses`
- `/profile`
- `/payment/:invoiceNumber`

## 11.2 Admin Frontend
- `/admin`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/products`
- `/admin/products/create`
- `/admin/products/:id`
- `/admin/products/:id/edit`
- `/admin/promotions`
- `/admin/promotions/store/create`
- `/admin/promotions/package/create`
- `/admin/promotions/combo/create`
- `/admin/settings/users`
- `/admin/settings/roles`

## 11.3 Backend API
- `/api/auth/*`
- `/api/products/*`
- `/api/cart/*`
- `/api/addresses/*`
- `/api/checkout`
- `/api/orders/*`
- `/api/payments/*`
- `/api/admin/*`

---

## 12. MVP Prioritas Implementasi

## Tahap 1
- katalog customer
- detail produk
- login/register customer
- product management admin

## Tahap 2
- cart
- address management
- checkout
- order management admin

## Tahap 3
- payment Midtrans / Xendit
- status pesanan customer
- shipment admin

## Tahap 4
- promotion center admin
- promo tampil di customer
- voucher dan pricing engine lebih lengkap

---

## 13. Risiko Arsitektur yang Harus Dijaga

### Harga tidak sinkron
Solusi:
- hitung ulang harga saat checkout
- simpan snapshot harga pada order item

### Payment callback tidak sinkron
Solusi:
- backend wajib verifikasi callback
- jangan percaya redirect frontend

### Stok oversell
Solusi:
- validasi stok saat add to cart, checkout, dan create order
- lakukan stock reservation bila diperlukan pada tahap lanjut

### Promo bentrok
Solusi:
- definisikan priority rule promo
- batasi stacking promo pada MVP

### Data order berubah setelah admin edit produk
Solusi:
- simpan snapshot order item dan alamat pengiriman

---

## 14. Rekomendasi Aturan MVP

Untuk versi awal, gunakan aturan sederhana:

1. satu toko, bukan multi-vendor
2. satu mata uang
3. maksimal 2 level variasi produk
4. satu alamat pengiriman aktif per checkout
5. satu invoice aktif per order
6. promo aktif tidak ditumpuk bebas
7. admin memakai `archive`, bukan hard delete, untuk produk

---

## 15. Definisi Selesai Dokumentasi Tahap Ini

Tahap dokumentasi saat ini dianggap selesai bila:
- flow admin sudah terdokumentasi
- flow customer sudah terdokumentasi
- use case admin dan customer sudah ada
- workflow diagram sudah ada
- ERD awal admin dan customer sudah ada
- route admin dan customer sudah ada
- arsitektur data bersama sudah didefinisikan

---

## 16. Next Step

Dokumentasi berikutnya yang disarankan:

1. `db_schema.md`
   detail tabel, kolom, tipe data, enum, foreign key, index
2. `api_spec.md`
   request/response endpoint customer dan admin
3. `wireframe_customer.md`
   struktur halaman customer
4. `wireframe_admin.md`
   struktur halaman admin
5. `pricing_rules.md`
   aturan promo dan prioritas diskon
6. `payment_integration.md`
   flow teknis Midtrans dan Xendit secara detail
