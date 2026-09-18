import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

// PostgreSQL via the `postgres` npm package (postgres.js) — a pure-JS client
// with zero native dependencies, so it runs identically on any contributor
// machine (Windows included) and any serverless deploy target. This replaces
// the previous better-sqlite3 client, which required a prebuilt native
// binary matching the exact OS/arch/Node ABI and broke on Windows dev
// machines and would have repeated the same risk on serverless hosts.
//
// DATABASE_URL points at either a local Postgres or the Supabase Postgres
// connection string. Supabase project settings also expose `SUPABASE_URL`,
// `NEXT_PUBLIC_SUPABASE_URL`, and the publishable key, but the database layer
// should still use the actual DB connection string (server-side) when available.
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:sherise_dev_pw@localhost:5432/sherise";
const USE_TRANSACTION_POOLER =
  DATABASE_URL.includes(".pooler.supabase.com") ||
  DATABASE_URL.includes("pgbouncer=true");

declare global {
  var __sheriseSql: postgres.Sql | undefined;
  var __sheriseSchemaReady: Promise<void> | undefined;
}

function createSql(): postgres.Sql {
  return postgres(DATABASE_URL, {
    max: 5,
    // Supabase's transaction pooler does not support prepared statements.
    prepare: !USE_TRANSACTION_POOLER,
    // Postgres returns COUNT(*)/COUNT(DISTINCT ...) as `bigint` (OID 20) and
    // AVG(...) as `numeric` (OID 1700) — neither has a default JS parser in
    // postgres.js (bigint would otherwise arrive as a raw string, and the
    // built-in `postgres.BigInt` helper returns an actual BigInt, which
    // crashes `JSON.stringify`/`Response.json`). Every count/avg in this
    // codebase fits safely in a JS `number`, so we coerce both to `number`
    // here, once, instead of touching every call site.
    types: {
      bigint: {
        to: 20,
        from: [20],
        parse: (x: string) => Number(x),
        serialize: (x: number) => String(x),
      },
      numeric: {
        to: 1700,
        from: [1700],
        parse: (x: string) => Number(x),
        serialize: (x: number) => String(x),
      },
    },
  });
}

function sqlClient(): postgres.Sql {
  if (!global.__sheriseSql) {
    global.__sheriseSql = createSql();
  }
  return global.__sheriseSql;
}

async function ensureSchema(client: postgres.Sql): Promise<void> {
  if (!global.__sheriseSchemaReady) {
    global.__sheriseSchemaReady = (async () => {
      const schema = fs.readFileSync(
        path.join(process.cwd(), "src/lib/schema.sql"),
        "utf-8",
      );
      await client.unsafe(schema);
    })();
  }
  return global.__sheriseSchemaReady;
}

/**
 * Converts a `.prepare(sql)` call's placeholder style into postgres.js's
 * `$1, $2, ...` numbered-parameter style, and normalizes the two calling
 * conventions used across this codebase:
 *   1. Positional: `.get(a, b, c)` against a query using `?` placeholders.
 *   2. Named: `.run({ id, role, ... })` against a query using `@name`
 *      placeholders (used by the seed script's bulk inserts).
 * This lets every existing call site keep its exact query string and
 * argument shape — the only required change is adding `await`.
 */
function toPositional(
  query: string,
  args: unknown[],
): { text: string; values: unknown[] } {
  if (
    args.length === 1 &&
    args[0] !== null &&
    typeof args[0] === "object" &&
    !Array.isArray(args[0])
  ) {
    const named = args[0] as Record<string, unknown>;
    const values: unknown[] = [];
    const text = query.replace(
      /@([a-zA-Z_][a-zA-Z0-9_]*)/g,
      (_match, name: string) => {
        values.push(named[name]);
        return `$${values.length}`;
      },
    );
    return { text, values };
  }
  let i = 0;
  const text = query.replace(/\?/g, () => `$${++i}`);
  return { text, values: args };
}

export interface PreparedStatement<T = Record<string, unknown>> {
  get(...args: unknown[]): Promise<T | undefined>;
  all(...args: unknown[]): Promise<T[]>;
  run(...args: unknown[]): Promise<void>;
}

export interface DbLike {
  prepare<T = Record<string, unknown>>(query: string): PreparedStatement<T>;
  /**
   * better-sqlite3-shaped transaction API: `db.transaction(fn)` returns a
   * callable that, when invoked, runs `fn` with a transaction-scoped
   * `DbLike` (so queries inside `fn` MUST use the `tx` argument passed to
   * it, not the outer `db`) inside a single Postgres `BEGIN`/`COMMIT`. If
   * `fn` throws, postgres.js rolls the transaction back automatically.
   */
  transaction<T>(fn: (tx: DbLike) => Promise<T>): () => Promise<T>;
}

function wrap(client: postgres.Sql): DbLike {
  return {
    prepare<T>(query: string): PreparedStatement<T> {
      return {
        async get(...args: unknown[]) {
          await ensureSchema(client);
          const { text, values } = toPositional(query, args);
          const rows = await client.unsafe(text, values as never[]);
          return rows[0] as T | undefined;
        },
        async all(...args: unknown[]) {
          await ensureSchema(client);
          const { text, values } = toPositional(query, args);
          const rows = await client.unsafe(text, values as never[]);
          return rows as unknown as T[];
        },
        async run(...args: unknown[]) {
          await ensureSchema(client);
          const { text, values } = toPositional(query, args);
          await client.unsafe(text, values as never[]);
        },
      };
    },
    transaction<T>(fn: (tx: DbLike) => Promise<T>) {
      return async () => {
        await ensureSchema(client);
        return client.begin(async (txSql) =>
          fn(wrap(txSql as unknown as postgres.Sql)),
        ) as Promise<T>;
      };
    },
  };
}

export function getDb(): DbLike {
  return wrap(sqlClient());
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
