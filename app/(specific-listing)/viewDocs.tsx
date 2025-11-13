import { AlertCircle, Download, FileText, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, ScrollView } from 'react-native';
import { styled } from 'styled-components/native';
import { supabase } from '../../libs/supabase';
import { getDocumentSignedUrl } from '../../services/documents';

interface Document {
  id: string;
  document_url: string;
  uploaded_at: string;
  listing_id: number;
  uploaded_by?: string;
}

interface DocumentViewerProps {
  listingId: string;
  visible: boolean;
  onClose: () => void;
}

const DocumentViewer = ({ listingId, visible, onClose }: DocumentViewerProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (visible && listingId) {
      checkPermissionAndLoadDocuments();
    }
  }, [visible, listingId]);

  const checkPermissionAndLoadDocuments = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        Alert.alert('Error', 'Unable to verify user');
        onClose();
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('Profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        Alert.alert('Error', 'Unable to verify user role');
        onClose();
        return;
      }

      const userRole = profile?.role?.toLowerCase();

      // Check if user has permission to view documents
      if (userRole === 'csr_rep') {
        setHasPermission(true);
        await loadDocuments(userRole, user.id);
      } else if (userRole === 'pin') {
        setHasPermission(true);
        await loadDocuments(userRole, user.id);
      } else {
        // Platform manager or unknown role - no permission
        setHasPermission(false);
        Alert.alert(
          'Access Denied', 
          'You do not have permission to view supporting documents.'
        );
        onClose();
      }
      
    } catch (error) {
      console.error('Exception in checkPermissionAndLoadDocuments:', error);
      Alert.alert('Error', 'Failed to verify permissions');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (userRole: string, userId: string) => {
    try {
      let query = supabase
        .from('supporting_documents')
        .select('*')
        .eq('listing_id', listingId);

      if (userRole === 'pin') {
        // PIN can only see their own documents
        query = query.eq('uploaded_by', userId);
      }
      // CSR_REP can see all documents (no additional filter)

      const { data, error } = await query.order('uploaded_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      setDocuments(data || []);
      
    } catch (error) {
      console.error('Exception in loadDocuments:', error);
      Alert.alert('Error', 'Failed to load documents');
    }
  };

  const handleOpenDocument = async (doc: Document) => {
    try {
      setOpeningDoc(doc.id);
      
      const signedUrl = await getDocumentSignedUrl(doc.document_url);
      
      if (!signedUrl) {
        Alert.alert('Error', 'Could not retrieve document');
        return;
      }

      const canOpen = await Linking.canOpenURL(signedUrl);
      if (canOpen) {
        await Linking.openURL(signedUrl);
      } else {
        Alert.alert('Error', 'Unable to open document');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Failed to open document');
    } finally {
      setOpeningDoc(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1] || 'Document';
    const cleanName = fileName.replace(/^\d+_[a-z0-9]+\./, '');
    return cleanName || fileName;
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'IMG';
    return 'DOC';
  };

  if (!hasPermission) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalHeaderLeft>
              <FileText size={24} color="#111827" />
              <ModalHeaderTitle>Supporting Documents</ModalHeaderTitle>
            </ModalHeaderLeft>
            <CloseButton onPress={onClose}>
              <X size={24} color="#6B7280" />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            {loading ? (
              <LoadingContainer>
                <ActivityIndicator size="large" color="#4F46E5" />
                <LoadingText>Loading documents...</LoadingText>
              </LoadingContainer>
            ) : documents.length === 0 ? (
              <EmptyContainer>
                <AlertCircle size={48} color="#9CA3AF" />
                <EmptyTitle>No Documents</EmptyTitle>
                <EmptyText>
                  No supporting documents have been uploaded for this request.
                </EmptyText>
              </EmptyContainer>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {documents.map((doc) => {
                  const fileName = getFileName(doc.document_url);
                  const fileType = getFileType(fileName);
                  
                  return (
                    <DocumentCard 
                      key={doc.id}
                      onPress={() => handleOpenDocument(doc)}
                      disabled={openingDoc === doc.id}
                      activeOpacity={0.7}
                    >
                      <DocumentIconContainer>
                        <FileTypeText>{fileType}</FileTypeText>
                      </DocumentIconContainer>
                      
                      <DocumentInfo>
                        <DocumentName numberOfLines={2}>
                          {fileName}
                        </DocumentName>
                        <DocumentDate>
                          Uploaded {formatDate(doc.uploaded_at)}
                        </DocumentDate>
                        {openingDoc === doc.id && (
                          <OpeningText>Opening...</OpeningText>
                        )}
                      </DocumentInfo>

                      <DownloadIconButton 
                        onPress={() => handleOpenDocument(doc)}
                        disabled={openingDoc === doc.id}
                      >
                        {openingDoc === doc.id ? (
                          <ActivityIndicator size="small" color="#4F46E5" />
                        ) : (
                          <Download size={20} color="#4F46E5" />
                        )}
                      </DownloadIconButton>
                    </DocumentCard>
                  );
                })}
              </ScrollView>
            )}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default DocumentViewer;

// Styled Components
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalContent = styled.View`
  background-color: #FFFFFF;
  border-radius: 20px;
  width: 100%;
  max-height: 70%;
  overflow: hidden;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #E5E7EB;
`;

const ModalHeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ModalHeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ModalBody = styled.View`
  padding: 20px;
  max-height: 400px;
`;

const LoadingContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding-vertical: 40px;
`;

const LoadingText = styled.Text`
  margin-top: 12px;
  font-size: 14px;
  color: #6B7280;
`;

const EmptyContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding-vertical: 40px;
`;

const EmptyTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: #6B7280;
  text-align: center;
  padding-horizontal: 20px;
  line-height: 20px;
`;

const DocumentCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: #F9FAFB;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const DocumentIconContainer = styled.View`
  background-color: #EEF2FF;
  border-radius: 10px;
  padding: 10px;
  margin-right: 12px;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
`;

const FileTypeText = styled.Text`
  font-size: 10px;
  font-weight: 700;
  color: #4F46E5;
`;

const DocumentInfo = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const DocumentName = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const DocumentDate = styled.Text`
  font-size: 12px;
  color: #6B7280;
`;

const OpeningText = styled.Text`
  font-size: 11px;
  color: #4F46E5;
  margin-top: 2px;
  font-weight: 500;
`;

const DownloadIconButton = styled.TouchableOpacity`
  background-color: #EEF2FF;
  border-radius: 8px;
  padding: 8px;
`;