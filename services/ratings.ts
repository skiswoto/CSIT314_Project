import { supabase } from '../libs/supabase';

export interface ServiceRating {
  id?: string;
  listing_id: number;
  rating: number;
  rated_by?: string;
  created_at?: string;
  rater_id?: string;
}

// Submit a new service rating
export const submitRating = async (ratingData: ServiceRating) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the listing to check status and creator
    const { data: listing, error: listingError } = await supabase
      .from('Listings')
      .select('status, created_by')
      .eq('id', ratingData.listing_id)
      .single();

    if (listingError) {
      throw new Error('Failed to verify listing status');
    }

    // Check if listing is completed
    if (listing.status !== 'completed') {
      throw new Error('You can only rate completed services');
    }

    // Check if current user is the listing creator
    if (listing.created_by !== user.id) {
      throw new Error('Only the service requester (PIN user who created the listing) can rate this service');
    }

    // Check if the creator has already rated this listing
    const { data: existingRating } = await supabase
      .from('service_ratings')
      .select('*')
      .eq('listing_id', ratingData.listing_id)
      .eq('rated_by', user.id)
      .single();

    if (existingRating) {
      throw new Error('You have already rated this service. Ratings cannot be edited once submitted.');
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

// Get all ratings for a specific listing (should only have one rating per listing)
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

// Get average rating for a listing (should return the single rating if exists)
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

    // Since only the creator can rate, there should only be one rating
    const rating = data[0].rating;

    return {
      average: Number(rating.toFixed(1)),
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

// Check if user can rate a listing (completed, is creator, and not yet rated)
export const canUserRateListing = async (listingId: number, userId: string) => {
  try {
    // Check listing status and creator
    const { data: listing, error: listingError } = await supabase
      .from('Listings')
      .select('status, created_by')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return { canRate: false, reason: 'Listing not found' };
    }

    if (listing.status !== 'completed') {
      return { canRate: false, reason: 'Service must be completed before rating' };
    }

    // Check if user is the listing creator
    if (listing.created_by !== userId) {
      return { canRate: false, reason: 'Only the service requester (PIN user who created this listing) can rate this service' };
    }

    // Check if creator has already rated
    const { data: existingRating } = await supabase
      .from('service_ratings')
      .select('id')
      .eq('listing_id', listingId)
      .eq('rated_by', userId)
      .maybeSingle();

    if (existingRating) {
      return { canRate: false, reason: 'You have already rated this service' };
    }

    return { canRate: true, reason: null };
  } catch (error: any) {
    console.error('Error checking rating eligibility:', error);
    return { canRate: false, reason: 'Error checking rating eligibility' };
  }
};