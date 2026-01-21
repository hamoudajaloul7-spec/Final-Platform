export async function findStoreBySlug(slug: string): Promise<any | null> {
  // Attempt to use a global DB client if available; this keeps compile-time clean
  try {
    // @ts-ignore
    const db = (globalThis as any).dbClient;
    if (db && typeof db.findStoreBySlug === 'function') {
      return await db.findStoreBySlug(slug);
    }
  } catch {
    // ignore
  }
  // If no DB is configured yet, return null
  return null;
}
