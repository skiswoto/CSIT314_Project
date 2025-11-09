import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { AlertCircle, MapPin, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { getMySavedListings } from '../../services/savedListings';
import { ResultsHeader } from './myListings';

const SavedRequests = () => {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const data = await getMySavedListings(); // each row: { id, created_at, listing_id, listing: {...} }
          setRows(data);
        } catch (e) {
          console.log('getMySavedListings error', e);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const handleRemove = (rowId: string | number, pinName: string) => {
    Alert.alert(
      'Remove Request',
      `Remove ${pinName}'s request from your saved list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        // You can call toggleSave(listing.id) here too, but keeping it simple for now.
        { text: 'OK' }
      ]
    );
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'High': return '#FEE2E2';
      case 'Medium': return '#FFEDD5';
      case 'Low': return '#DCFCE7';
      default: return '#F3F4F6';
    }
  };
  const getUrgencyTextColor = (urgency?: string) => {
    switch (urgency) {
      case 'High': return '#B91C1C';
      case 'Medium': return '#C2410C';
      case 'Low': return '#166534';
      default: return '#374151';
    }
  };

  const count = rows.length;

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
          <ResultsHeader>
            <H2>Saved Listings ({count})</H2>
          </ResultsHeader>

          {loading && (
            <Loading>
              <ActivityIndicator size="large" />
            </Loading>
          )}

          {!loading && count === 0 && (
            <EmptyState>
              <EmptyStateText>No saved requests yet</EmptyStateText>
              <EmptyStateSubText>Tap the heart on a listing to save it.</EmptyStateSubText>
            </EmptyState>
          )}

          {!loading && rows.map((row) => {
            const l = row.listing ?? {};
            return (
              <RequestCard key={row.id}>
                <CardTop>
                  <ProfileSection>
                    <ProfileImage source={{ uri: 'https://placehold.co/100x100' }} />
                    <InfoContainer>
                      <PinName>{l.creator?.name ?? 'Unknown User'}</PinName>
                      <SavedDate>Saved on {new Date(row.created_at).toLocaleDateString()}</SavedDate>
                    </InfoContainer>
                  </ProfileSection>
                  <RemoveButton onPress={() => handleRemove(row.id, l.creator?.name ?? 'user')}>
                    <X size={20} color="#DC2626" />
                  </RemoveButton>
                </CardTop>

                <RequestInfo>{l.description ?? 'No description'}</RequestInfo>

                <TagsRow>
                  <Tag backgroundColor="#F3F4F6">
                    <MapPin size={14} color="#374151" />
                    <TagText color="#374151">{l.street_address ?? 'Unknown location'}</TagText>
                  </Tag>
                  <Tag backgroundColor={getUrgencyColor(l.urgency)}>
                    <AlertCircle size={14} color={getUrgencyTextColor(l.urgency)} />
                    <TagText color={getUrgencyTextColor(l.urgency)}>
                      {l.urgency ?? '—'}
                    </TagText>
                  </Tag>
                </TagsRow>

                <ActionButtons>
                  <ViewDetailsButton
                    onPress={() => router.push({
                      pathname: '/(specific-listing)/sampleListing',
                      params: {
                        listingId: String(l.id),
                        category: l.category,
                        description: l.description,
                        address: l.street_address,
                        startTime: l.start_time,
                        duration: l.duration,
                        urgency: l.urgency,
                        status: l.status
                      }
                    })}
                  >
                    <ViewDetailsButtonText>View Details</ViewDetailsButtonText>
                  </ViewDetailsButton>
                </ActionButtons>
              </RequestCard>
            );
          })}
        </ScrollContainer>
      </SafeAreaViewContainer>
    </>
  );
};

export default SavedRequests;

const Loading = styled.View`
  padding: 40px;
  align-items: center;
`;

const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding-vertical: 60px;
  gap: 8px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #6B7280;
`;

const EmptyStateSubText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: #9CA3AF;
  text-align: center;
`;

const RequestCard = styled.View`
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

const CardTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProfileSection = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ProfileImage = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border-width: 2px;
  border-color: #E5E7EB;
`;

const InfoContainer = styled.View`
  flex: 1;
  gap: 4px;
`;

const PinName = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const SavedDate = styled.Text`
  font-size: 12px;
  font-weight: 400;
  color: #9CA3AF;
`;

const RemoveButton = styled.TouchableOpacity`
  padding: 8px;
  background-color: #FEE2E2;
  border-radius: 8px;
`;

const RequestInfo = styled.Text`
  font-size: 15px;
  font-weight: 400;
  color: #374151;
  line-height: 22px;
  margin-bottom: 12px;
`;

const TagsRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Tag = styled.View<{ backgroundColor: string }>`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: ${props => props.backgroundColor};
  border-radius: 16px;
`;

const TagText = styled.Text<{ color: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.color};
`;

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ViewDetailsButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #F3F4F6;
  border-radius: 50px;
  padding-vertical: 12px;
  align-items: center;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const ViewDetailsButtonText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;
