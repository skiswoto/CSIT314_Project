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
  uploaded_by: string;
  listing_id?: number;
  uploaded_at: string;
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
    const { data: listing, error: listingError } = await supabase
      .from('Listings')
      .insert(listingData)
      .select()
      .single();

    if (listingError) {
      throw listingError;
    }

    if (documentIds && documentIds.length > 0 && listing?.id) {
      const { error: linkError } = await supabase
        .from('supporting_documents')
        .update({ listing_id: listing.id })
        .in('id', documentIds);

      if (linkError) {
        console.warn('Failed to link documents:', linkError);
      }
    }

    return listing;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

// Accept a listing
export const acceptListing = async (listingId: string) => {
  const cleanId = listingId.toString().replace(/[\\"']/g, '').trim();
  const numericId = parseInt(cleanId, 10);

  if (isNaN(numericId) || numericId <= 0) {
    throw new Error('Invalid listing ID');
  }

  const { data: foundListings, error: findError } = await supabase
    .from('Listings')
    .select('*')
    .eq('id', numericId);

  if (findError) {
    throw new Error(`Failed to find listing: ${findError.message}`);
  }

  if (!foundListings || foundListings.length === 0) {
    throw new Error(`Listing ${numericId} not found`);
  }

  const { data, error } = await supabase
    .from('Listings')
    .update({ status: 'accepted' })
    .eq('id', numericId)
    .select();

  if (error) {
    throw new Error(`Failed to update listing: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Update returned no rows for listing ${numericId}`);
  }

  return data[0];
};

// Complete a listing
export const completeListing = async (listingId: string) => {
  const cleanId = listingId.toString().replace(/[\\"']/g, '').trim();
  const numericId = parseInt(cleanId, 10);

  if (isNaN(numericId) || numericId <= 0) {
    throw new Error('Invalid listing ID');
  }

  const { data, error } = await supabase
    .from('Listings')
    .update({ status: 'completed' })
    .eq('id', numericId)
    .select();

  if (error) {
    throw new Error(`Failed to complete listing: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Update returned no rows for listing ${numericId}`);
  }

  return data[0];
};

export const getAllListings = async (filters?: ListingFilters) => {
  let query = supabase
    .from('Listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.locations && filters.locations.length > 0) {
    const locationConditions = filters.locations
      .map(loc => `street_address.ilike.%${loc}%`)
      .join(',');
    query = query.or(locationConditions);
  }

  if (filters?.serviceTypes && filters.serviceTypes.length > 0) {
    query = query.in('category', filters.serviceTypes);
  }

  if (filters?.urgencies && filters.urgencies.length > 0) {
    query = query.in('urgency', filters.urgencies);
  }

  if (filters?.dateRange?.start) {
    const startDate = filters.dateRange.start.toISOString().split('T')[0];
    query = query.gte('listing_date', startDate);
  }

  if (filters?.dateRange?.end) {
    const endDate = filters.dateRange.end.toISOString().split('T')[0];
    query = query.lte('listing_date', endDate);
  }

  const { data, error } = await query;

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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = listingId ? `${listingId}/${fileName}` : `temp/${fileName}`;

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

    return filePath;
  } catch (error) {
    console.error('Document upload error:', error);
    return null;
  }
};

// Save document record to database and return the ID
export async function saveDocumentRecord(
  documentUrl: string,
  userId: string,
  listingId?: number
) {
  const { data, error } = await supabase
    .from('supporting_documents')
    .insert([
      {
        document_url: documentUrl,
        uploaded_by: userId,
        listing_id: listingId ?? null, // <-- include link if provided
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving document record:', error);
    return null;
  }
  return data;
}


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
    const { error: storageError } = await supabase.storage
      .from('supporting-docs')
      .remove([documentUrl]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      return false;
    }

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