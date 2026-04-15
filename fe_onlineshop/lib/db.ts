import mysql from "mysql2/promise";

// Persist pool across Next.js HMR reloads in dev — otherwise each module reload
// creates a new pool, and connections accumulate until MySQL hits max_connections.
const globalForDb = globalThis as unknown as { __dbPool?: mysql.Pool };

export const db =
  globalForDb.__dbPool ??
  mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "ayres_shop",
    waitForConnections: true,
    connectionLimit: 10,
    idleTimeout: 60_000,
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbPool = db;
}
