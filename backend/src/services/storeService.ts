import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function findStoreBySlug(slug: string): Promise<any | null> {
  const { data, error, status } = await supabase
    .from('stores')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (error) {
    if (status === 406 || data == null) return null;
    throw error;
  }
  return data ?? null;
}
