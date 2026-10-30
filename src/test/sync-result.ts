/** Terminal methods of a synchronous Drizzle SQLite builder, for mocked transactions. */
export function syncResult<T>(rows: T[] = []) {
  return { all: () => rows, get: () => rows[0], run: () => ({ changes: rows.length }) };
}
