import { StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { useCreateListingStore } from "@/global/createListingStore";
import { userAuthStore } from "@/global/userAuthStore";
import { deleteDocument, getDocumentSignedUrl, getListingDocuments, saveDocumentRecord, uploadDocument, UploadedDocument } from "@/services/listings";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking } from "react-native";
import { styled } from "styled-components/native";
import EditRequestFormTemplate from "./EditRequestFormTemplate";

const EditStep4 = () => {
  const params = useLocalSearchParams();
  const listingData = params.listingData ? JSON.parse(params.listingData as string) : null;

  const { supportingDocuments, setSupportingDocuments } = useCreateListingStore();
  const { user } = userAuthStore();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<UploadedDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
  const ALLOWED_DOCUMENT_TYPES = ["application/pdf", ...ALLOWED_IMAGE_TYPES];

  useEffect(() => {
    if (!listingData?.id) return;
    const fetchDocuments = async () => {
      setIsLoadingDocs(true);
      const docs = await getListingDocuments(listingData.id);
      setExistingDocs(docs);
      setIsLoadingDocs(false);
    };
    fetchDocuments();
  }, [listingData?.id]);

  const validateFile = (file: { size?: number; mimeType?: string; type?: string }) => {
    const fileType = file.mimeType || file.type;
    const fileSize = file.size || 0;

    if (fileSize > MAX_FILE_SIZE) {
      setUploadError("File too large! Maximum size is 5MB.");
      return false;
    }
    if (!ALLOWED_DOCUMENT_TYPES.includes(fileType || "")) {
      setUploadError("Unsupported file type! Please upload JPG, PNG, or PDF files.");
      return false;
    }
    setUploadError(null);
    return true;
  };

  const viewDocument = async (doc: UploadedDocument) => {
    try {
      if (!doc.document_url) {
        Alert.alert("Error", "Document URL not available");
        return;
      }
      setViewingDocument(doc.document_url);
      const signedUrl = await getDocumentSignedUrl(doc.document_url);
      if (signedUrl) {
        const canOpen = await Linking.canOpenURL(signedUrl);
        if (canOpen) await Linking.openURL(signedUrl);
        else Alert.alert("Error", "Unable to open document");
      } else {
        Alert.alert("Error", "Could not retrieve document");
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      Alert.alert("Error", "Failed to open document");
    } finally {
      setViewingDocument(null);
    }
  };

  const handleDeleteDocument = async (docId: string, docUrl: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteDocument(docUrl, docId);
          if (success) {
            setExistingDocs((prev) => prev.filter((d) => d.id !== docId));
            Alert.alert("Deleted", "Document removed successfully");
          } else {
            Alert.alert("Error", "Failed to delete the document");
          }
        },
      },
    ]);
  };

  const handleImagePicker = async () => {
    try {
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

      const validFiles = result.assets.filter((asset) =>
        validateFile({ size: asset.fileSize, mimeType: asset.mimeType })
      );
      if (validFiles.length === 0) return;

      setIsUploading(true);
      const uploadPromises = validFiles.map(async (asset) => {
        const documentUrl = await uploadDocument({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        });
        if (documentUrl && user?.id) {
          const saved = await saveDocumentRecord(documentUrl, user.id, listingData.id);
          if (saved) {
            return {
              uri: asset.uri,
              name: asset.fileName || `image_${Date.now()}.jpg`,
              type: asset.mimeType || "image/jpeg",
              size: asset.fileSize,
              document_url: documentUrl,
              id: saved,
            } as UploadedDocument;
          }
        }
        return null;
      });
      const uploadedDocs = (await Promise.all(uploadPromises)).filter(
        (d): d is UploadedDocument => d !== null
      );
      if (uploadedDocs.length > 0) {
        setSupportingDocuments([...supportingDocuments, ...uploadedDocs]);
        setExistingDocs((prev) => [...prev, ...uploadedDocs]);
        Alert.alert("Success", `${uploadedDocs.length} file(s) uploaded successfully!`);
      } else setUploadError("Failed to upload files. Please try again.");
      setIsUploading(false);
    } catch (error) {
      console.error("Image picker error:", error);
      setUploadError("Failed to upload. Please try again later.");
      setIsUploading(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const validFiles = result.assets.filter((asset) =>
        validateFile({ size: asset.size, mimeType: asset.mimeType })
      );
      if (validFiles.length === 0) return;

      setIsUploading(true);
      const uploadPromises = validFiles.map(async (file) => {
        const documentUrl = await uploadDocument({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/pdf",
          size: file.size,
        });
        if (documentUrl && user?.id) {
          const saved = await saveDocumentRecord(documentUrl, user.id, listingData.id);
          if (saved) {
            return {
              uri: file.uri,
              name: file.name,
              type: file.mimeType || "application/pdf",
              size: file.size,
              document_url: documentUrl,
              id: saved,
            } as UploadedDocument;
          }
        }
        return null;
      });
      const uploadedDocs = (await Promise.all(uploadPromises)).filter(
        (d): d is UploadedDocument => d !== null
      );
      if (uploadedDocs.length > 0) {
        setSupportingDocuments([...supportingDocuments, ...uploadedDocs]);
        setExistingDocs((prev) => [...prev, ...uploadedDocs]);
        Alert.alert("Success", `${uploadedDocs.length} file(s) uploaded successfully!`);
      } else setUploadError("Failed to upload files. Please try again.");
      setIsUploading(false);
    } catch (error) {
      console.error("Document picker error:", error);
      setUploadError("Failed to upload. Please try again later.");
      setIsUploading(false);
    }
  };

  if (!listingData) return null;

  return (
    <EditRequestFormTemplate listingId={listingData.id} originalData={listingData}>
      <StepTitle>Do you have supporting documents?</StepTitle>
      <StepSubTitle>
        Upload medical certificates, prescriptions, or other documents to help volunteers
        understand your needs better. (Optional)
      </StepSubTitle>

      {/* Existing Documents */}
      {isLoadingDocs ? (
        <ActivityIndicator color="#333333" style={{ marginVertical: 16 }} />
      ) : existingDocs.length > 0 ? (
        <DocumentList>
          <SectionTitle>Existing Documents ({existingDocs.length})</SectionTitle>
          {existingDocs.map((doc, i) => (
            <DocumentCard key={doc.id || i}>
              <TouchableDocumentInfo onPress={() => viewDocument(doc)}>
                <DocumentInfo>
                  {doc.document_url.endsWith(".pdf") ? (
                    <PDFIcon>📄</PDFIcon>
                  ) : (
                    <DocumentThumbnail
                      source={{
                        uri: `https://fkfebevhzuaciiyoabnr.storage.supabase.co/storage/v1/s3/${doc.document_url}`,
                      }}
                    />
                  )}
                  <DocumentDetails>
                    <DocumentName numberOfLines={1}>
                      {doc.document_url.split("/").pop()}
                    </DocumentName>
                    <DocumentSize>
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </DocumentSize>
                  </DocumentDetails>
                </DocumentInfo>
              </TouchableDocumentInfo>
              <RemoveButton
                onPress={() => handleDeleteDocument(doc.id, doc.document_url)}
              >
                <RemoveButtonText>✕</RemoveButtonText>
              </RemoveButton>
            </DocumentCard>
          ))}
        </DocumentList>
      ) : (
        <HelperText>No existing documents found.</HelperText>
      )}

      {/* Upload Section */}
      <UploadSection>
        <UploadButton onPress={handleImagePicker} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#333333" />
          ) : (
            <UploadButtonText>📷 Upload from Gallery</UploadButtonText>
          )}
        </UploadButton>

        <UploadButton
          onPress={handleDocumentPicker}
          style={{ marginTop: 12 }}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#333333" />
          ) : (
            <UploadButtonText>📄 Upload Document (PDF)</UploadButtonText>
          )}
        </UploadButton>

        <HelperText>
          Supported formats: JPG, PNG, PDF (Max 5MB per file)
        </HelperText>
        {uploadError && <ErrorText>{uploadError}</ErrorText>}
        {isUploading && <UploadingText>Uploading files...</UploadingText>}
      </UploadSection>
    </EditRequestFormTemplate>
  );
};

export default EditStep4;

/* ---------- Styled Components ---------- */
const UploadSection = styled.View`
  margin-top: 24px;
`;

const UploadButton = styled.TouchableOpacity`
  background-color: #f5f5f5;
  border: 2px dashed #cccccc;
  border-radius: 12px;
  padding-vertical: 20px;
  padding-horizontal: 16px;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const UploadButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
`;

const HelperText = styled.Text`
  font-size: 12px;
  color: #666666;
  margin-top: 8px;
  text-align: center;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: #ff3b30;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
`;

const UploadingText = styled.Text`
  font-size: 14px;
  color: #007aff;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
`;

const DocumentList = styled.View`
  margin-top: 24px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
`;

const DocumentCard = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
`;

const TouchableDocumentInfo = styled.TouchableOpacity`
  flex: 1;
`;

const DocumentInfo = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const DocumentThumbnail = styled.Image`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #f5f5f5;
`;

const PDFIcon = styled.Text`
  width: 48px;
  height: 48px;
  font-size: 32px;
  text-align: center;
  line-height: 48px;
`;

const DocumentDetails = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const DocumentName = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
`;

const DocumentSize = styled.Text`
  font-size: 12px;
  color: #999999;
  margin-top: 2px;
`;

const RemoveButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #ffe5e5;
  align-items: center;
  justify-content: center;
`;

const RemoveButtonText = styled.Text`
  font-size: 18px;
  color: #ff3b30;
  font-weight: 600;
`;
