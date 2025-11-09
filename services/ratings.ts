import { supabase } from '../libs/supabase';

export interface ServiceRating {
  id?: string;
  listing_id: number;
  rating: number;
  rated_by?: string;
  created_at?: string;
}

// Submit a new service rating
export const submitRating = async (ratingData: ServiceRating) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: existingRating } = await supabase
      .from('service_ratings')
      .select('*')
      .eq('listing_id', ratingData.listing_id)
      .eq('rated_by', user.id)
      .single();

    if (existingRating) {
      throw new Error('You have already rated this service');
    }

    const { data, error } = await supabase
      .from('service_ratings')
      .insert([
        {
          listing_id: ratingData.listing_id,
          rating: ratingData.rating,
          rated_by: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return { data: null, error: error.message };
  }
};

export const getRatingByListingId = async (listingId: number, raterId?: string) => {
  try {
    let query = supabase
      .from('service_ratings')
      .select('*')
      .eq('listing_id', listingId);

    if (raterId) {
      query = query.eq('rated_by', raterId);
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching rating for user:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } else {
      const { data, error } = await supabase
        .from('service_ratings')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching rating:', error);
        return { data: null, error: error.message };
      }

      return { data: data && data.length > 0 ? data[0] : null, error: null };
    }
  } catch (error: any) {
    console.error('Exception in getRatingByListingId:', error);
    return { data: null, error: error.message };
  }
};

// Get all ratings for a specific listing
export const getRatingsByListingId = async (listingId: number) => {
  try {
    const { data, error } = await supabase
      .from('service_ratings')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching listing ratings:', error);
    return { data: null, error: error.message };
  }
};

// Get average rating for a listing
export const getAverageRating = async (listingId: number) => {
  try {
    const { data, error } = await supabase
      .from('service_ratings')
      .select('rating')
      .eq('listing_id', listingId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0, error: null };
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / data.length;

    return {
      average: Number(average.toFixed(1)),
      count: data.length,
      error: null
    };
  } catch (error: any) {
    console.error('Error calculating average rating:', error);
    return { average: 0, count: 0, error: error.message };
  }
};

// Get all ratings given by a specific user (their rating history)
export const getRatingsByRater = async (raterId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_ratings')
      .select(`
        *,
        Listings!inner(
          category,
          listing_date,
          description,
          created_by
        )
      `)
      .eq('rated_by', raterId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching rater ratings:', error);
    return { data: null, error: error.message };
  }
};
