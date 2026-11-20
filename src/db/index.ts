import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5s timeout pro získání spojení z poolu
  idleTimeoutMillis: 30000,      // 30s timeout pro neaktivní klienty
  query_timeout: 10000,          // 10s timeout pro provedení dotazu
  statement_timeout: 10000,      // 10s PostgreSQL statement_timeout
  max: 10,                       // Maximální počet souběžných spojení
});

// Ošetření chyb na neaktivních klientech, aby nedocházelo k neošetřenému pádu procesu
pool.on("error", (err) => {
  console.error("Neočekávaná chyba databázového klienta v poolu:", err);
});

export const db = drizzle(pool, { schema });
