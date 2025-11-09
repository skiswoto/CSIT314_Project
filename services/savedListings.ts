// services/savedListings.ts
import { supabase } from '@/libs/supabase';

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

export async function toggleSave(listingId: number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data: existing, error: selErr } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from('saved_listings')
    .insert({ listing_id: listingId, user_id: user.id });
  if (error) throw error;
  return true;
}

/** Use an explicit FK to disambiguate the embed. */
export async function getMySavedListings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_listings')
    .select(`
      id,
      created_at,
      listing_id,
      listing:Listings!saved_listings_listing_id_fkey(
        id, category, description, street_address, start_time, duration, urgency, status,
        created_by,
        creator:Profiles!listings_created_by_fkey(name)
      )
    `) // 👈 if this name doesn't exist in your DB, swap to the other one below
    // .select(`
    //   id, created_at, listing_id,
    //   listing:Listings!saved_listings_listing_fk(
    //     id, category, description, street_address, start_time, duration, urgency, status,
    //     created_by,
    //     creator:Profiles!listings_created_by_fkey(name)
    //   )
    // `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
