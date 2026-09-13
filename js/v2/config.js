// Supabase project the game signs players into.
//
// The publishable key is *meant* to be public: it identifies the project and
// nothing more. Every row is guarded by row-level security policies that compare
// auth.uid() against the row's user_id, so a player holding this key can only
// ever read or write their own saves. Never put a service-role or secret key
// here — that one bypasses RLS entirely.
export const SUPABASE_URL='https://bobdxuxltiyumvbhecse.supabase.co';
export const SUPABASE_KEY='sb_publishable_t5IJz14NbKj7A7ylVTPh1g_BVGU0-t3';
