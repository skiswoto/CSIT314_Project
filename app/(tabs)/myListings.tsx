import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Edit2, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, View } from 'react-native';
import { styled } from 'styled-components/native';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { supabase } from '../../libs/supabase';

/* ---- Types ---- */
type DBListing = {
  id: number;
  description: string | null;
  status: string | null;
  created_at: string | null;
  category?: string | null;
  urgency?: string | null;
  date?: string | null;
  time?: string | null;
  duration?: string | null;
  street_address?: string | null;
  unit_level?: string | null;
  building_name?: string | null;
  post_code?: string | null;
  created_by?: string | null;
};

/* ---- Status helpers (display only) ---- */
const toDisplayStatus = (status?: string | null) => {
  switch ((status || '').toLowerCase()) {
    case 'available': return 'Active';
    case 'matched':   return 'Matched';
    case 'completed': return 'Completed';
    default:          return status || '—';
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
    router.push({
      pathname: '/(create-request)/[id]',
      params: { id: String(item.id) },
    });
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

  const handleViewListing = (listing: DBListing) => {
    router.push({
      pathname: '/(specific-listing)/sampleListing',
      params: {
        listingId: listing.id,
        category: listing.category,
        description: listing.description,
        address: listing.street_address,
        startTime: listing.time,
        duration: listing.duration,
        urgency: listing.urgency,
        status: listing.status
      }
    });
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

              <RequestInfo onPress={() => handleViewListing(listing)}>
                {listing.description || 'No description'}
              </RequestInfo>

              <CardFooter>
                <FooterInfo onPress={() => handleViewListing(listing)}>
                  <FooterLabel>Created:</FooterLabel>
                  <FooterValue>{listing.created_at ? new Date(listing.created_at).toLocaleDateString() : '—'}</FooterValue>
                </FooterInfo>
                {listing.category ? (
                  <FooterInfo onPress={() => handleViewListing(listing)}>
                    <FooterLabel>Category:</FooterLabel>
                    <FooterValue>{listing.category}</FooterValue>
                  </FooterInfo>
                ) : <View onStartShouldSetResponder={() => true} onResponderRelease={() => handleViewListing(listing)} />}
              </CardFooter>
            </ListingCard>
          ))}
        </ScrollContainer>
      </SafeAreaViewContainer>
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