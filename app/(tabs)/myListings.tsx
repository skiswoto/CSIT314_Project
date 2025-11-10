import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Edit2, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StatusBar, TextInput, View } from 'react-native';
import { styled } from 'styled-components/native';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { supabase } from '../../libs/supabase';

/* ---- Types ---- */
type DBListing = {
  id: number;
  description: string | null;
  status: string | null;       // 'available' | 'completed' | 'matched' (if used)
  created_at: string | null;
  category?: string | null;
  street_address?: string | null;
  created_by?: string | null;  // uuid
};

/* ---- Helpers for status display ---- */
const toDisplayStatus = (status?: string | null) => {
  switch ((status || '').toLowerCase()) {
    case 'available': return 'Active';
    case 'matched':   return 'Matched';
    case 'completed': return 'Completed';
    default:          return status || '—';
  }
};
const toDBStatus = (display: string) => {
  switch (display) {
    case 'Active':    return 'available';
    case 'Matched':   return 'matched';
    case 'Completed': return 'completed';
    default:          return 'available';
  }
};
const statusBg = (status?: string | null) => {
  const s = (status || '').toLowerCase();
  if (s === 'available') return '#DBEAFE';
  if (s === 'matched')   return '#DCFCE7';
  if (s === 'completed') return '#F3F4F6';
  return '#F3F4F6';
};
const statusText = (status?: string | null) => {
  const s = (status || '').toLowerCase();
  if (s === 'available') return '#1E40AF';
  if (s === 'matched')   return '#166534';
  if (s === 'completed') return '#374151';
  return '#374151';
};

const MyListings = () => {
  const router = useRouter();

  const [items, setItems] = useState<DBListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<DBListing | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Matched' | 'Completed'>('Active');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMyListings();
    }, [])
  );

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setItems([]);
        return;
      }
      const { data, error } = await supabase
        .from('Listings')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('load listings error', error);
        setItems([]);
        return;
      }
      setItems((data || []) as DBListing[]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item: DBListing) => {
    setEditItem(item);
    setFormDesc(item.description || '');
    setFormStatus(toDisplayStatus(item.status) as 'Active' | 'Matched' | 'Completed');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('Listings')
        .update({
          description: formDesc,
          status: toDBStatus(formStatus),
        })
        .eq('id', editItem.id);

      if (error) {
        Alert.alert('Update failed', error.message);
        return;
      }

      // Optimistic local update
      setItems(prev =>
        prev.map(it =>
          it.id === editItem.id
            ? { ...it, description: formDesc, status: toDBStatus(formStatus) }
            : it
        )
      );
      setEditOpen(false);
      setEditItem(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, requestInfo?: string | null) => {
    Alert.alert(
      'Delete Request',
      `Are you sure you want to delete "${requestInfo || 'this request'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('Listings').delete().eq('id', id);
            if (error) {
              Alert.alert('Delete failed', error.message);
              return;
            }
            setItems(prev => prev.filter(x => x.id !== id));
          }
        }
      ]
    );
  };

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
          <ResultsHeader>
            <H2>My Requests ({items.length})</H2>
          </ResultsHeader>

          {loading && (
            <LoaderWrap>
              <ActivityIndicator size="large" color="#2B61A6" />
            </LoaderWrap>
          )}

          {!loading && items.length === 0 && (
            <EmptyWrap>
              <EmptyText>No listings yet.</EmptyText>
            </EmptyWrap>
          )}

          {!loading && items.map((listing) => (
            <ListingCard key={listing.id}>
              <CardHeader>
                <StatusBadge backgroundColor={statusBg(listing.status)}>
                  <StatusText color={statusText(listing.status)}>
                    {toDisplayStatus(listing.status)}
                  </StatusText>
                </StatusBadge>

                <ActionButtons>
                  <ActionButton onPress={() => openEdit(listing)}>
                    <Edit2 size={18} color="#2B61A6" />
                  </ActionButton>
                  <ActionButton onPress={() => handleDelete(listing.id, listing.description)}>
                    <Trash2 size={18} color="#DC2626" />
                  </ActionButton>
                </ActionButtons>
              </CardHeader>

              <RequestInfo>{listing.description || 'No description'}</RequestInfo>

              <CardFooter>
                <FooterInfo>
                  <FooterLabel>Created:</FooterLabel>
                  <FooterValue>
                    {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : '—'}
                  </FooterValue>
                </FooterInfo>
                {listing.category ? (
                  <FooterInfo>
                    <FooterLabel>Category:</FooterLabel>
                    <FooterValue>{listing.category}</FooterValue>
                  </FooterInfo>
                ) : <View />}
              </CardFooter>

              <ViewDetailsButton
                onPress={() =>
                  router.push({
                    pathname: '/(specific-listing)/sampleListing',
                    params: {
                      listingId: String(listing.id),
                      category: listing.category ?? '',
                      description: listing.description ?? '',
                      address: listing.street_address ?? '',
                      status: listing.status ?? '',
                    },
                  })
                }
              >
                <ViewDetailsButtonText>View Details</ViewDetailsButtonText>
              </ViewDetailsButton>
            </ListingCard>
          ))}
        </ScrollContainer>
      </SafeAreaViewContainer>

      {/* ---- Edit Modal ---- */}
      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpen(false)}
      >
        <ModalBackdrop onPress={() => !saving && setEditOpen(false)} />
        <ModalCard>
          <ModalTitle>Edit Listing</ModalTitle>

          <FieldLabel>Description</FieldLabel>
          <FieldInput
            value={formDesc}
            onChangeText={setFormDesc}
            placeholder="Describe the request"
            multiline
          />

          <FieldLabel>Status</FieldLabel>
          <StatusRow>
            {(['Active', 'Matched', 'Completed'] as const).map(s => (
              <StatusChip
                key={s}
                active={formStatus === s}
                onPress={() => setFormStatus(s)}
                disabled={saving}
              >
                <StatusChipText active={formStatus === s}>{s}</StatusChipText>
              </StatusChip>
            ))}
          </StatusRow>

          <ModalActions>
            <ModalBtn
              disabled={saving}
              onPress={() => setEditOpen(false)}
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <ModalBtnText style={{ color: '#374151' }}>Cancel</ModalBtnText>
            </ModalBtn>
            <ModalBtn onPress={saveEdit} disabled={saving}>
              <ModalBtnText>{saving ? 'Saving…' : 'Save'}</ModalBtnText>
            </ModalBtn>
          </ModalActions>
        </ModalCard>
      </Modal>
    </>
  );
};

export default MyListings;

/* -------- shared header (exported) -------- */
export const ResultsHeader = styled.View`
  margin-bottom: 16px;
`;

export const ResultsHeaderText = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
`;

/* -------- styles -------- */
const LoaderWrap = styled.View`
  padding: 32px;
  align-items: center;
`;

const EmptyWrap = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #6B7280;
`;

const ListingCard = styled.View`
  background-color: #FFFFFF;
  border-radius: 16px;
  border-width: 1px;
  border-color: #E5E7EB;
  padding: 20px;
  margin-bottom: 16px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusBadge = styled.View<{ backgroundColor: string }>`
  background-color: ${p => p.backgroundColor};
  padding: 6px 12px;
  border-radius: 16px;
`;

const StatusText = styled.Text<{ color: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.color};
`;

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 8px;
  background-color: #F9FAFB;
  border-radius: 8px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const RequestInfo = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  line-height: 24px;
  margin-bottom: 16px;
`;

const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: #E5E7EB;
`;

const FooterInfo = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

const FooterLabel = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
`;

const FooterValue = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
`;

const ViewDetailsButton = styled.TouchableOpacity`
  background-color: #2B61A6;
  border-radius: 50px;
  padding-vertical: 12px;
  align-items: center;
`;

const ViewDetailsButtonText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
`;

/* ---- Modal styles ---- */
const ModalBackdrop = styled.Pressable`
  position: absolute;
  inset: 0;
  background-color: rgba(0,0,0,0.35);
`;

const ModalCard = styled.View`
  position: absolute;
  left: 20px;
  right: 20px;
  top: 15%;
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 5px;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
`;

const FieldLabel = styled.Text`
  font-size: 13px;
  color: #374151;
  margin-top: 8px;
  margin-bottom: 6px;
`;

const FieldInput = styled(TextInput)`
  border-width: 1px;
  border-color: #E5E7EB;
  border-radius: 10px;
  padding: 10px;
  min-height: 70px;
  text-align-vertical: top;
  color: #111827;
`;

const StatusRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const StatusChip = styled.TouchableOpacity<{ active: boolean }>`
  padding: 8px 12px;
  border-radius: 999px;
  background-color: ${p => (p.active ? '#E0E7FF' : '#F3F4F6')};
  border-width: 1px;
  border-color: ${p => (p.active ? '#6366F1' : '#E5E7EB')};
`;

const StatusChipText = styled.Text<{ active: boolean }>`
  color: ${p => (p.active ? '#3730A3' : '#374151')};
  font-weight: 600;
  font-size: 13px;
`;

const ModalActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
`;

const ModalBtn = styled.TouchableOpacity`
  background-color: #2B61A6;
  padding: 10px 14px;
  border-radius: 10px;
`;

const ModalBtnText = styled.Text`
  color: #FFFFFF;
  font-weight: 700;
`;
