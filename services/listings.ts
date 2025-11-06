import { supabase } from '../libs/supabase';

export interface Listing {
  id: number;
  created_at: string;
  description: string;
  category: string;
  listing_date: string;
  start_time: string;
  duration: string;
  street_address: string;
  unit_level: string;
  building_name: string;
  post_code: string;
  urgency?: string;
  status?: string
}
export interface ListingFilters {
  locations: string[];
  serviceTypes: string[];
  urgencies: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status?: string;
}

// Accept a listing
export const acceptListing = async (listingId: string) => {
  console.log('═══════════════════════════════════════')
  console.log('🔍 DEBUG: acceptListing called')
  console.log('Raw listingId:', listingId)
  console.log('Type:', typeof listingId)
  
  // Clean and parse
  const cleanId = listingId.toString().replace(/[\\"']/g, '').trim()
  console.log('Cleaned ID:', cleanId)
  
  const numericId = parseInt(cleanId, 10)
  console.log('Numeric ID:', numericId)
  console.log('Is NaN?:', isNaN(numericId))
  
  if (isNaN(numericId) || numericId <= 0) {
    throw new Error('Invalid listing ID')
  }
  
  // STEP 1: Try a simple SELECT to verify connection
  console.log('\n--- STEP 1: Testing basic SELECT ---')
  try {
    const { data: allListings, error: allError } = await supabase
      .from('Listings')
      .select('id')
      .limit(5)
    
    console.log('Basic SELECT result:', allListings)
    console.log('Basic SELECT error:', allError)
  } catch (err) {
    console.error('Basic SELECT threw exception:', err)
  }
  
  // STEP 2: Try to find this specific listing
  console.log(`\n--- STEP 2: Looking for ID ${numericId} ---`)
  try {
    const { data: foundListings, error: findError, status, statusText } = await supabase
      .from('Listings')
      .select('*')
      .eq('id', numericId)
    
    console.log('Find query - Data:', foundListings)
    console.log('Find query - Error:', findError)
    console.log('Find query - Status:', status)
    console.log('Find query - Status Text:', statusText)
    console.log('Find query - Found count:', foundListings?.length || 0)
    
    if (findError) {
      console.error('❌ Find error details:', JSON.stringify(findError, null, 2))
    }
    
    if (!foundListings || foundListings.length === 0) {
      console.error('❌ Listing not found in database!')
      console.log('Throwing error...')
      throw new Error(`Listing ${numericId} not found`)
    }
    
    console.log('✅ Listing found:', foundListings[0])
    
  } catch (err) {
    console.error('Find query threw exception:', err)
    throw err
  }
  
  // STEP 3: Try to update
  console.log(`\n--- STEP 3: Updating ID ${numericId} ---`)
  try {
    const { data, error, status, statusText } = await supabase
      .from('Listings')
      .update({ status: 'accepted' })
      .eq('id', numericId)
      .select()
    
    console.log('Update query - Data:', data)
    console.log('Update query - Error:', error)
    console.log('Update query - Status:', status)
    console.log('Update query - Status Text:', statusText)
    
    if (error) {
      console.error('❌ Update error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to update: ${error.message}`)
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Update returned no rows for listing ${numericId}`)
    }
    
    console.log('✅ Update successful!')
    console.log('═══════════════════════════════════════\n')
    return data[0]
    
  } catch (err) {
    console.error('Update query threw exception:', err)
    throw err
  }
}

export const getAllListings = async (filters?: ListingFilters) => {
  console.log('Fetching listings with filters:', filters);
  
  let query = supabase
    .from('Listings')
    .select('*')
    .order('created_at', { ascending: false });

    if (filters?.status){
      query = query.eq('status', filters.status)
    }

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