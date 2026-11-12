import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "unipay_app",
  password: process.env.DB_PASSWORD ?? "change-this-local-password",
  database: process.env.DB_NAME ?? "uniPay",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  decimalNumbers: true,
  dateStrings: true,
});

export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
