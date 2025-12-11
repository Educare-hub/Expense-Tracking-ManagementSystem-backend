// /src/utils/db.ts
import dotenv from "dotenv";
dotenv.config();

const {
  DB_TYPE, 
  DB_SERVER,
  DB_USER,
  DB_PASS,
  DB_NAME,
  AZURE_MYSQL_CONNECTIONSTRING,
  PORT,
} = process.env;

export const config = {
  port: PORT || 3000,
  dbType: DB_TYPE || "mssql",
};

let mssqlPool: any = null;
let mysqlPool: any = null;

export const getDbPool = async () => {
  if (config.dbType === "mssql") {
    if (!mssqlPool) {
      if (!DB_SERVER || !DB_USER || !DB_PASS || !DB_NAME) {
        throw new Error("MSSQL env vars are required: DB_SERVER, DB_USER, DB_PASS, DB_NAME");
      }

      // dynamic import and ensureing default fallback
      const sqlModule = await import("mssql");
      const sql = sqlModule?.default || sqlModule; 

      mssqlPool = await sql.connect({
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        server: DB_SERVER,
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
        options: { encrypt: true, trustServerCertificate: true },
      });
    }
    return mssqlPool;
  } else if (config.dbType === "mysql") {
    if (!mysqlPool) {
      if (!AZURE_MYSQL_CONNECTIONSTRING) {
        throw new Error("AZURE_MYSQL_CONNECTIONSTRING is required for MySQL");
      }
      const mysqlModule = await import("mysql2/promise");
      const mysql = mysqlModule?.default || mysqlModule;
      mysqlPool = mysql.createPool(AZURE_MYSQL_CONNECTIONSTRING);
    }
    return mysqlPool;
  } else {
    throw new Error(`Unsupported DB_TYPE: ${config.dbType}`);
  }
};
