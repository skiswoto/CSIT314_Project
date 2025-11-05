import { supabase } from '@/libs/supabase';

export interface DocumentUpload {
    uri: string;
    name: string;
    type: string;
    size?: number;
}

export interface UploadedDocument {
    uri: string;
    name: string;
    type: string;
    size?: number;
    url?: string;
}

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

        const response = await fetch(file.uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
            .from('supporting-docs')
            .upload(filePath, blob, {
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

export const saveDocumentRecord = async (
    listingId: number,
    documentUrl: string,
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('supporting_documents')
            .insert({
                listing_id: listingId,
                document_url: documentUrl,
            });
        
        if (error) {
            console.error('Database insert error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Save document record error:', error);
        return false;
    }
};

export const uploadAndSaveDocument = async (
    file: DocumentUpload,
    listingId: number
): Promise<string | null> => {
    const documentUrl = await uploadDocument(file, listingId);
    
    if (!documentUrl) {
        return null;
    }

    const saved = await saveDocumentRecord(listingId, documentUrl);
    return saved ? documentUrl : null;
};

export const deleteDocument = async (
    documentUrl: string,
    listingId: number
): Promise<boolean> => {
    try {
        const urlParts = documentUrl.split('/supporting-docs/');
        if (urlParts.length < 2) {
            console.error('Invalid document URL');
            return false;
        }
        
        const filePath = urlParts[1];

        const { error: storageError } = await supabase.storage
            .from('supporting-docs')
            .remove([filePath]);
        
        if (storageError) {
            console.error('Storage delete error:', storageError);
            return false;
        }

        const { error: dbError } = await supabase
            .from('supporting_documents')
            .delete()
            .match({ listing_id: listingId, document_url: documentUrl });

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