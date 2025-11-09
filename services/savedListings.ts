// services/savedListings.ts
import { supabase } from '@/libs/supabase';

/** Toggle: insert if not exists, otherwise delete. */
export async function toggleSave(listingId: number | string) {
  const id = Number(listingId);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error('Not signed in');

  // already saved?
  const { data: existing, error: selErr } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('listing_id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error } = await supabase.from('saved_listings').delete().eq('id', existing.id);
    if (error) throw error;
    return { saved: false };
  } else {
    const { error } = await supabase.from('saved_listings').insert({ listing_id: id, user_id: user.id });
    if (error) throw error;
    return { saved: true };
  }
}

/** Remove a saved row for this user/listing. */
export async function unsave(listingId: number | string) {
  const id = Number(listingId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase
    .from('saved_listings')
    .delete()
    .eq('listing_id', id)
    .eq('user_id', user.id);
  if (error) throw error;
}

/** IDs of the current user's saved listings (for hearts, etc.). */
export async function fetchMySavedIds(): Promise<number[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', user.id);
  if (error) throw error;
  return (data ?? []).map(r => Number(r.listing_id));
}

/** Full saved listings for current user (2-step to avoid FK-name ambiguity). */
export async function getMySavedListings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // saved rows
  const { data: savedRows, error: sErr } = await supabase
    .from('saved_listings')
    .select('id, listing_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (sErr) throw sErr;
  if (!savedRows?.length) return [];

  // listings for those ids
  const ids = savedRows.map(r => r.listing_id);
  const { data: listings, error: lErr } = await supabase
    .from('Listings')
    .select('id, category, description, street_address, urgency, status')
    .in('id', ids);
  if (lErr) throw lErr;

  const byId = new Map(listings?.map(l => [l.id, l]));
  return savedRows
    .map(r => ({ saved_id: r.id, created_at: r.created_at, listing: byId.get(r.listing_id) }))
    .filter(x => !!x.listing);
}

/** Back-compat alias if some files still import `getMySaved`. */
export async function getMySaved() {
  return getMySavedListings();
}
