import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

let _instance: DB | undefined;

function getInstance(): DB {
  if (!_instance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    // Disable prefetch for Supabase transaction mode pooler
    _instance = drizzle(postgres(process.env.DATABASE_URL, { prepare: false }), { schema });
  }
  return _instance;
}

// Lazy proxy — defers connection until first query so Next.js can collect
// page data during build without DATABASE_URL being set.
export const db = new Proxy({} as DB, {
  get(_, prop) {
    return Reflect.get(getInstance(), prop as keyof DB);
  },
});
