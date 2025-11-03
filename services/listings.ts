import { supabase } from '../libs/supabase';

export interface Listing {
  id: string;
  created_at: string;
  description: string;
  category: string;
  listing_date: string;
  start_time: string;
  duration: number;
  street_address: string;
  unit_level: string;
  building_name: string;
  post_code: string;
  urgency: string;
}

export interface ListingFilters {
  location?: string; // post_code or street_address
  category?: string; // service type
  urgency?: string; // urgency (L/M/H)
}

export const getAllListings = async () => {
    const { data, error } = await supabase
        .from('Listings')
        .select('*')
        .order('created_at', {ascending: false});
    if (error) {
        console.error('Error fetching listing: ', error );
        throw error;
    }

    return data as Listing[];
};

export const getFilteredListings = async (filters: ListingFilters = {}) => {
  let query = supabase
    .from('Listings')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters if provided
  if (filters.location) {
    query = query.or(`post_code.ilike.%${filters.location}%,street_address.ilike.%${filters.location}%`);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }

  return data as Listing[];
};

export const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from('Listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Listing;
};