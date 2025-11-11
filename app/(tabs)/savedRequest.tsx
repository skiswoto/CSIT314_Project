import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { AlertCircle, MapPin, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { getMySavedListings, unsave } from '../../services/savedListings';
import { ResultsHeader } from './myListings';

const SavedRequests = () => {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMySavedListings();
      setItems(data);
    } catch (e) {
      console.error('getMySavedListings error', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRemove = (listingId: number) => {
    Alert.alert('Remove Request', 'Remove this request from your saved list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => { await unsave(listingId); await load(); }
      }
    ]);
  };

  const bg = (u?: string) => (u === 'High' ? '#FEE2E2' : u === 'Medium' ? '#FFEDD5' : u === 'Low' ? '#DCFCE7' : '#F3F4F6');
  const fg = (u?: string) => (u === 'High' ? '#B91C1C' : u === 'Medium' ? '#C2410C' : u === 'Low' ? '#166534' : '#374151');

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
          <ResultsHeader>
            <H2>Saved Listings ({items.length})</H2>
          </ResultsHeader>

          {!loading && items.length === 0 ? (
            <EmptyState>
              <EmptyStateText>No saved requests yet</EmptyStateText>
              <EmptyStateSubText>Tap the heart on a listing to save it.</EmptyStateSubText>
            </EmptyState>
          ) : (
            items.map(({ listing }) => (
              <RequestCard key={listing.id}>
                <CardTop>
                  <InfoContainer>
                    <PinName>{listing.category ?? `Listing #${listing.id}`}</PinName>
                    <SavedDate>{listing.status ?? 'Saved'}</SavedDate>
                  </InfoContainer>
                  <RemoveButton onPress={() => handleRemove(listing.id)}>
                    <X size={20} color="#DC2626" />
                  </RemoveButton>
                </CardTop>

                <RequestInfo>{listing.description}</RequestInfo>

                <TagsRow>
                  <Tag backgroundColor="#F3F4F6">
                    <MapPin size={14} color="#374151" />
                    <TagText color="#374151">{listing.street_address ?? '—'}</TagText>
                  </Tag>
                  {listing.urgency && (
                    <Tag backgroundColor={bg(listing.urgency)}>
                      <AlertCircle size={14} color={fg(listing.urgency)} />
                      <TagText color={fg(listing.urgency)}>{listing.urgency}</TagText>
                    </Tag>
                  )}
                </TagsRow>
              </RequestCard>
            ))
          )}
        </ScrollContainer>
      </SafeAreaViewContainer>
    </>
  );
};

export default SavedRequests;

/* styles */
const EmptyState = styled.View`align-items:center; justify-content:center; padding-vertical:60px; gap:8px;`;
const EmptyStateText = styled.Text`font-size:16px; font-weight:600; color:#6B7280;`;
const EmptyStateSubText = styled.Text`font-size:14px; font-weight:400; color:#9CA3AF; text-align:center;`;
const RequestCard = styled.View`background:#FFF; border-radius:16px; border-width:1px; border-color:#E5E7EB; padding:20px; margin-bottom:16px; elevation:2;`;
const CardTop = styled.View`flex-direction:row; justify-content:space-between; align-items:flex-start; margin-bottom:12px;`;
const InfoContainer = styled.View`flex:1; gap:4px;`;
const PinName = styled.Text`font-size:18px; font-weight:600; color:#111827;`;
const SavedDate = styled.Text`font-size:12px; font-weight:400; color:#9CA3AF;`;
const RemoveButton = styled.TouchableOpacity`padding:8px; background:#FEE2E2; border-radius:8px;`;
const RequestInfo = styled.Text`font-size:15px; font-weight:400; color:#374151; line-height:22px; margin-bottom:12px;`;
const TagsRow = styled.View`flex-direction:row; gap:8px; margin-bottom:16px; flex-wrap:wrap;`;
const Tag = styled.View<{ backgroundColor: string }>`flex-direction:row; align-items:center; gap:4px; padding:6px 12px; background:${p=>p.backgroundColor}; border-radius:16px;`;
const TagText = styled.Text<{ color: string }>`font-size:12px; font-weight:500; color:${p=>p.color};`;
