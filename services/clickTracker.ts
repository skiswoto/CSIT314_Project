// services/clickTracker.ts
import { supabase } from '@/libs/supabase';

/**
 * Increment monthly click count for a specific profile.
 * profileId = Profiles.id (UUID)
 */
export async function incrementMonthClick(profileId: string) {
  if (!profileId) return;

  const { error } = await supabase.rpc('increment_month_click', {
    p_profile_id: profileId,   // <-- must match SQL param name
  });

  if (error) {
    console.error('increment_month_click failed:', error);
    throw error;
  }
}

/** Optional: per-listing click (keep if you still need it). */
export async function incrementClickForListing(listingId: string) {
  const { error } = await supabase.rpc('incrementclickforlisting', {
    listing_id: listingId,
  });
  if (error) {
    console.error('incrementclickforlisting failed:', error);
    throw error;
  }
}
