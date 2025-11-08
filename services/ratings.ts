import { supabase } from '../libs/supabase';

export interface ServiceRating {
  id?: string; // Changed from number to string (UUID)
  listing_id: number; 
  rater_id: string; 
  rater_email: string; 
  csr_rep_id: string;
  rating: number;
  created_at?: string;
}

// Submit a new service rating
export const submitRating = async (ratingData: ServiceRating) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .insert([
                {
                    listing_id: ratingData.listing_id,
                    rater_id: ratingData.rater_id,
                    rater_email: ratingData.rater_email,
                    csr_rep_id: ratingData.csr_rep_id,
                    rating: ratingData.rating,
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

// Get rating for a specific listing (check if user already rated)
export const getRatingByListingId = async (listingId: number, raterId: string) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .select('*')
            .eq('listing_id', listingId) 
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching rating:', error);
        return { data: null, error: error.message };
    }
};

// Get all ratings received by a CSR Rep
export const getRatingsByCSRRep = async (csrRepId: string) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .select(`
                *,
                Listings!inner(
                    category,
                    listing_date,
                    description
                ),
                rater:Profiles!service_ratings_rater_id_rater_email_fkey(
                    name,
                    email
                )
            `)
            .eq('csr_rep_id', csrRepId) 
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching CSR Rep ratings:', error);
        return { data: null, error: error.message };
    }
};

// Get average rating for a CSR Rep
export const getAverageRating = async (csrRepId: string) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .select('rating')
            .eq('csr_rep_id', csrRepId); 

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

// Get all ratings given by a PIN (their rating history)
export const getRatingsByRater = async (raterId: string) => {
    try {
        const { data, error } = await supabase
            .from('service_ratings')
            .select(`
                *,
                Listings!inner(
                    category,
                    listing_date,
                    description
                ),
                csr_rep:Profiles!service_ratings_csr_rep_id_fkey(
                    name,
                    email
                )
            `)
            .eq('rater_id', raterId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching rater ratings:', error);
        return { data: null, error: error.message };
    }
};