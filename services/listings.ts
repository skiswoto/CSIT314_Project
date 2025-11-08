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
  status?: string;
  created_by: string;
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

export interface DocumentUpload {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UploadedDocument {
  id?: string; 
  uri: string;
  name: string;
  type: string;
  size?: number;
  url?: string; 
}

export interface SupportingDocument {
  id: string;
  document_url: string;
  user_id: string;
  listing_id?: number;
  created_at: string;
}

// Create a new listing with optional documents
export const createListing = async (
  listingData: {
    description: string;
    category: string;
    urgency: string;
    listing_date: string;
    start_time: string;
    duration: string | null;
    street_address: string;
    unit_level: string;
    building_name: string;
    post_code: string;
    created_by: string;
  },
  documentIds?: string[]
) => {
  try {
    // Create the listing
    const { data: listing, error: listingError } = await supabase
      .from('Listings')
      .insert(listingData)
      .select()
      .single();

    if (listingError) {
      console.error('Listing creation error:', listingError);
      throw listingError;
    }

    // Link documents if provided
    if (documentIds && documentIds.length > 0 && listing?.id) {
      const { error: linkError } = await supabase
        .from('supporting_documents')
        .update({ listing_id: listing.id })
        .in('id', documentIds);

      if (linkError) {
        console.warn('Failed to link documents:', linkError);
        // Don't throw - listing was created successfully
      }
    }

    return listing;
  } catch (error) {
    console.error('Error in createListing:', error);
    throw error;
  }
};

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

// Upload document to storage
export const uploadDocument = async (
  file: DocumentUpload,
  listingId?: number
): Promise<string | null> => {
  try {
    console.log('Starting upload for:', file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = listingId
      ? `${listingId}/${fileName}`
      : `temp/${fileName}`;
    
    console.log('Uploading to path:', filePath);
    
    // Fetch file as arrayBuffer
    const response = await fetch(file.uri);
    const arrayBuffer = await response.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('supporting-docs')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    console.log('Upload successful:', data);
    return filePath;
  } catch (error) {
    console.error('Document upload error:', error);
    return null;
  }
};

// Save document record to database and return the ID
export const saveDocumentRecord = async (
  documentUrl: string,
  userId: string,
  listingId?: number
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('supporting_documents')
      .insert({
        listing_id: listingId || null,
        document_url: documentUrl,
        user_id: userId,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Database insert error:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Save document record error:', error);
    return null;
  }
};

// Get signed URL for viewing document
export const getDocumentSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('supporting-docs')
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
};

// Get documents for a listing
export const getListingDocuments = async (
  listingId: number
): Promise<SupportingDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('supporting_documents')
      .select('*')
      .eq('listing_id', listingId);
    
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Get listing documents error:', error);
    return [];
  }
};

// Delete document
export const deleteDocument = async (
  documentUrl: string,
  documentId: string
): Promise<boolean> => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('supporting-docs')
      .remove([documentUrl]);
    
    if (storageError) {
      console.error('Storage delete error:', storageError);
      return false;
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('supporting_documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      console.error('Database delete error:', dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Delete document error:', error);
    return false;
  }
};