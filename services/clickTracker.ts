// services/clickTracker.ts
import { supabase } from '@/libs/supabase'; // Import your supabase instance

export const incrementClickForListing = async (listingId: string, month: string) => {
  try {
    // Get the current value of clicks
    const { data: currentData, error: fetchError } = await supabase
      .from('pindashboard')
      .select('clicks')
      .eq('id', listingId)
      .eq('month', month)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Calculate the new clicks value
    const newClicks = currentData ? currentData.clicks + 1 : 1;

    // Update the clicks for the given listing and month
    const { error } = await supabase
      .from('pindashboard')
      .update({ clicks: newClicks })
      .eq('id', listingId)
      .eq('month', month);

    if (error) {
      throw error;
    }

    console.log('Click incremented for listing:', listingId);
  } catch (error) {
    console.error('Error incrementing click:', error);
  }
};


//database = @/libs/supabase