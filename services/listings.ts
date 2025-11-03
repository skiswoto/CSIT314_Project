// services/listings.ts
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
  urgency?: string; // Added urgency field
}
export interface ListingFilters {
  locations: string[];
  serviceTypes: string[];
  urgencies: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export const getAllListings = async (filters?: ListingFilters) => {
  console.log('Fetching listings with filters:', filters);
  
  let query = supabase
    .from('Listings')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply location filters (if any selected)
  if (filters?.locations && filters.locations.length > 0) {
    // Search in both street_address for any of the selected locations
    const locationConditions = filters.locations
      .map(loc => `street_address.ilike.%${loc}%`)
      .join(',');
    query = query.or(locationConditions);
  }

  // Apply service type filters (maps to category field)
  if (filters?.serviceTypes && filters.serviceTypes.length > 0) {
    query = query.in('category', filters.serviceTypes);
  }

  // Apply urgency filters
  if (filters?.urgencies && filters.urgencies.length > 0) {
    query = query.in('urgency', filters.urgencies);
  }

  // Apply date range filters
  if (filters?.dateRange?.start) {
    const startDate = filters.dateRange.start.toISOString().split('T')[0];
    query = query.gte('listing_date', startDate);
  }
  
  if (filters?.dateRange?.end) {
    const endDate = filters.dateRange.end.toISOString().split('T')[0];
    query = query.lte('listing_date', endDate);
  }

  const { data, error } = await query;

  console.log('Supabase filtered response:', { 
    dataCount: data?.length,
    error, 
    filtersApplied: filters 
  });

  if (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }

  return data as Listing[];
};