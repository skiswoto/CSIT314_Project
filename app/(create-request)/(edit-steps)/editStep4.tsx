import { StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { useCreateListingStore } from "@/global/createListingStore";
import { userAuthStore } from "@/global/userAuthStore";
import { getDocumentSignedUrl, saveDocumentRecord, uploadDocument, UploadedDocument } from '@/services/listings';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking } from "react-native";
import { styled } from "styled-components/native";
import EditRequestFormTemplate from "./EditRequestFormTemplate";

const EditStep4 = () => {
  const params = useLocalSearchParams();
  const listingData = params.listingData ? JSON.parse(params.listingData as string) : null;
  if (!listingData) return null;

  const { supportingDocuments, setSupportingDocuments } = useCreateListingStore();
  const { user } = userAuthStore();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
  const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];

  useEffect(() => {
    return () => {
      setUploadError(null);
    };
  }, []);

  const validateFile = (file: { size?: number; mimeType?: string; type?: string }) => {
    const fileType = file.mimeType || file.type;
    const fileSize = file.size || 0;

    if (fileSize > MAX_FILE_SIZE) {
      setUploadError("File too large! Maximum size is 5MB.");
      return false;
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(fileType || '')) {
      setUploadError("Unsupported file type! Please upload JPG, PNG, or PDF files.");
      return false;
    }

    setUploadError(null);
    return true;
  };

  const viewDocument = async (doc: UploadedDocument) => {
    try {
      if (!doc.url) {
        Alert.alert('Error', 'Document URL not available');
        return;
      }

      setViewingDocument(doc.url);
      const signedUrl = await getDocumentSignedUrl(doc.url);

      if (signedUrl) {
        const canOpen = await Linking.canOpenURL(signedUrl);
        if (canOpen) {
          await Linking.openURL(signedUrl);
        } else {
          Alert.alert('Error', 'Unable to open document');
        }
      } else {
        Alert.alert('Error', 'Could not retrieve document');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', 'Failed to open document');
    } finally {
      setViewingDocument(null);
    }
  };

  const handleImagePicker = async () => {
    try {
      setUploadError(null);

      if (!user?.id) {
        Alert.alert("Authentication Required", "Please log in to upload documents.");
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        const validFiles = result.assets.filter(asset =>
          validateFile({ size: asset.fileSize, mimeType: asset.mimeType })
        );

        if (validFiles.length > 0) {
          setIsUploading(true);

          const uploadPromises = validFiles.map(async (asset) => {
            const documentUrl = await uploadDocument({
              uri: asset.uri,
              name: asset.fileName || `image_${Date.now()}.jpg`,
              type: asset.mimeType || 'image/jpeg',
              size: asset.fileSize
            });

            if (documentUrl && user?.id) {
              const saved = await saveDocumentRecord(documentUrl, user.id);

              if (saved) {
                return {
                  uri: asset.uri,
                  name: asset.fileName || `image_${Date.now()}.jpg`,
                  type: asset.mimeType || 'image/jpeg',
                  size: asset.fileSize,
                  url: documentUrl
                } as UploadedDocument;
              }
            }
            return null;
          });

          const uploadedDocs = (await Promise.all(uploadPromises))
            .filter((doc): doc is UploadedDocument => doc !== null && !!doc.url);

          if (uploadedDocs.length > 0) {
            setSupportingDocuments([...supportingDocuments, ...uploadedDocs]);
            Alert.alert('Success', `${uploadedDocs.length} file(s) uploaded successfully!`);
          } else {
            setUploadError("Failed to upload files. Please try again.");
          }

          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      setUploadError("Failed to upload. Please try again later.");
      setIsUploading(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      setUploadError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        const validFiles = result.assets.filter(asset =>
          validateFile({ size: asset.size, mimeType: asset.mimeType })
        );

        if (validFiles.length > 0) {
          setIsUploading(true);

          const uploadPromises = validFiles.map(async (file) => {
            const documentUrl = await uploadDocument({
              uri: file.uri,
              name: file.name,
              type: file.mimeType || 'application/pdf',
              size: file.size
            });

            if (documentUrl && user?.id) {
              const saved = await saveDocumentRecord(documentUrl, user.id);

              if (saved) {
                return {
                  uri: file.uri,
                  name: file.name,
                  type: file.mimeType || 'application/pdf',
                  size: file.size,
                  url: documentUrl
                } as UploadedDocument;
              }
            }
            return null;
          });

          const uploadedDocs = (await Promise.all(uploadPromises))
            .filter((doc): doc is UploadedDocument => doc !== null);

          if (uploadedDocs.length > 0) {
            setSupportingDocuments([...supportingDocuments, ...uploadedDocs]);
            Alert.alert('Success', `${uploadedDocs.length} file(s) uploaded successfully!`);
          } else {
            setUploadError("Failed to upload files. Please try again.");
          }

          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Document picker error:", error);
      setUploadError("Failed to upload. Please try again later.");
      setIsUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocs = supportingDocuments.filter((_, i) => i !== index);
    setSupportingDocuments(updatedDocs);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <EditRequestFormTemplate listingId={listingData.id} originalData={listingData}>
      <StepTitle>Do you have supporting documents?</StepTitle>
      <StepSubTitle>
        Upload medical certificates, prescriptions, or other documents to help volunteers understand your needs better. (Optional)
      </StepSubTitle>

      <UploadSection>
        <UploadButton onPress={handleImagePicker} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#333333" />
          ) : (
            <UploadButtonText>📷 Upload from Gallery</UploadButtonText>
          )}
        </UploadButton>

        <UploadButton onPress={handleDocumentPicker} style={{ marginTop: 12 }} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#333333" />
          ) : (
            <UploadButtonText>📄 Upload Document (PDF)</UploadButtonText>
          )}
        </UploadButton>

        <HelperText>Supported formats: JPG, PNG, PDF (Max 5MB per file)</HelperText>

        {uploadError && <ErrorText>{uploadError}</ErrorText>}
        {isUploading && <UploadingText>Uploading files...</UploadingText>}
      </UploadSection>

      {supportingDocuments.length > 0 && (
        <DocumentList>
          <SectionTitle>Uploaded Documents ({supportingDocuments.length})</SectionTitle>
          {supportingDocuments.map((doc, index) => (
            <DocumentCard key={index}>
              <TouchableDocumentInfo
                onPress={() => viewDocument(doc)}
                disabled={viewingDocument === doc.url}
              >
                <DocumentInfo>
                  {doc.type?.startsWith('image/') ? (
                    <DocumentThumbnail source={{ uri: doc.uri }} />
                  ) : (
                    <PDFIcon>📄</PDFIcon>
                  )}
                  <DocumentDetails>
                    <DocumentName numberOfLines={1}>{doc.name}</DocumentName>
                    <DocumentSize>{formatFileSize(doc.size)}</DocumentSize>
                    {doc.url && <UploadedBadge>✓ Uploaded</UploadedBadge>}
                    {viewingDocument === doc.url && <ViewingText>Opening...</ViewingText>}
                  </DocumentDetails>
                </DocumentInfo>
              </TouchableDocumentInfo>
              <RemoveButton onPress={() => removeDocument(index)}>
                <RemoveButtonText>✕</RemoveButtonText>
              </RemoveButton>
            </DocumentCard>
          ))}
        </DocumentList>
      )}
    </EditRequestFormTemplate>
  );
};

export default EditStep4;

const UploadSection = styled.View`margin-top: 24px;`;
const UploadButton = styled.TouchableOpacity`
  background-color: #F5F5F5;
  border: 2px dashed #CCCCCC;
  border-radius: 12px;
  padding-vertical: 20px;
  padding-horizontal: 16px;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;
const UploadButtonText = styled.Text`font-size: 16px; font-weight: 600; color: #333333;`;
const HelperText = styled.Text`font-size: 12px; color: #666; margin-top: 8px; text-align: center;`;
const ErrorText = styled.Text`font-size: 14px; color: #FF3B30; margin-top: 12px; text-align: center; font-weight: 500;`;
const UploadingText = styled.Text`font-size: 14px; color: #007AFF; margin-top: 12px; text-align: center; font-weight: 500;`;
const DocumentList = styled.View`margin-top: 24px;`;
const SectionTitle = styled.Text`font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px;`;
const DocumentCard = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
`;
const TouchableDocumentInfo = styled.TouchableOpacity`flex: 1; opacity: ${props => props.disabled ? 0.5 : 1};`;
const DocumentInfo = styled.View`flex-direction: row; align-items: center; flex: 1;`;
const DocumentThumbnail = styled.Image`width: 48px; height: 48px; border-radius: 8px; background-color: #F5F5F5;`;
const PDFIcon = styled.Text`width: 48px; height: 48px; font-size: 32px; text-align: center; line-height: 48px;`;
const DocumentDetails = styled.View`flex: 1; margin-left: 12px;`;
const DocumentName = styled.Text`font-size: 14px; font-weight: 500; color: #333;`;
const DocumentSize = styled.Text`font-size: 12px; color: #999; margin-top: 2px;`;
const UploadedBadge = styled.Text`font-size: 11px; color: #34C759; margin-top: 2px; font-weight: 600;`;
const ViewingText = styled.Text`font-size: 11px; color: #007AFF; margin-top: 2px; font-weight: 600;`;
const RemoveButton = styled.TouchableOpacity`
  width: 32px; height: 32px; border-radius: 16px; background-color: #FFE5E5;
  align-items: center; justify-content: center;
`;
const RemoveButtonText = styled.Text`font-size: 18px; color: #FF3B30; font-weight: 600;`;
