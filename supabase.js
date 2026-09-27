import { createClient } from '@supabase/supabase-js';

// Publishable values are safe to ship in the browser. Env vars override them.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jhdqgdqbtobfqamudlai.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RRqGFK-QC2qq2Cqb-wxlhQ_EzfDpvi4';

export const sb = createClient(SUPABASE_URL, KEY, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const PUBLIC_KEY = KEY;

// Ask Supabase Auth whether the Google provider is switched on.
export async function googleEnabled() {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: KEY } });
    const j = await r.json();
    return !!j?.external?.google;
  } catch {
    return true; // don't block the button if the check itself fails
  }
}
