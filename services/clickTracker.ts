// services/clickTracker.ts
import { supabase } from '@/libs/supabase';

/** Monthly aggregate click (no params). */
export async function incrementMonthClick() {
  const { error } = await supabase.rpc('increment_month_click');
  if (error) {
    console.error('increment_month_click failed:', error);
    throw error;
  }
}

/** Optional: per-listing click (keep if you still need it). */
export async function incrementClickForListing(listingId: string) {
  const { error } = await supabase.rpc('incrementclickforlisting', { listing_id: listingId });
  if (error) {
    console.error('incrementclickforlisting failed:', error);
    throw error;
  }
}
