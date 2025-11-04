import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle, LayoutList, MapPin, Menu, Search, SlidersHorizontal, SquarePen, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { getRatingByRequestId } from '../../libs/(api)/ratings';
import { supabase } from '../../libs/supabase';

// Define the request type
interface Request {
  id: number;
  pinName: string;
  location: string;
  urgency: string;
  requestInfo: string;
  completedDate: string;
  isRated?: boolean;
  rating?: number | null;
}

const CompletedRequestScreen = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedRequests();
  }, []);

  const loadCompletedRequests = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch completed requests from your database
      // REPLACE 'requests' with your actual table name
      // REPLACE the column names with your actual column names
      const { data: completedRequests, error } = await supabase
        .from('requests') // Replace with your table name
        .select('*')
        .eq('status', 'completed') // Assuming you have a status field
        .eq('pin_user_id', user.id); // Fetch requests for current user

      if (error) {
        console.error('Error fetching completed requests:', error);
        setLoading(false);
        return;
      }

      if (!completedRequests || completedRequests.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Check ratings for each request
      const updatedRequests = await Promise.all(
        completedRequests.map(async (request: any) => {
          const { data: rating } = await getRatingByRequestId(request.id, user.id);
          
          // Map your database fields to the Request interface
          return {
            id: request.id,
            pinName: request.pin_name || 'Unknown', 
            location: request.location || 'Unknown',
            urgency: request.urgency || 'Low',
            requestInfo: request.request_info || request.description || '', // Replace with your field name
            completedDate: request.completed_date || request.updated_at || new Date().toISOString(),
            isRated: !!rating,
            rating: rating?.rating || null,
          };
        })
      );

      setRequests(updatedRequests);
    } catch (error) {
      console.error('Error loading completed requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return '#FEE2E2';
      case 'Medium': return '#FFEDD5';
      case 'Low': return '#DCFCE7';
      default: return '#F3F4F6';
    }
  };

  const getUrgencyTextColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return '#B91C1C';
      case 'Medium': return '#C2410C';
      case 'Low': return '#166534';
      default: return '#374151';
    }
  };

  if (loading) {
    return (
      <SafeAreaViewContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading completed requests...</Text>
        </View>
      </SafeAreaViewContainer>
    );
  }

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Menu Button */}
          <MenuContainer>
            <Menu size={26} />
          </MenuContainer>

          {/* Search Bar and Filter */}
          <Bar>
            <SearchBar>
              <Search />
            </SearchBar>
            <Filter>
              <SlidersHorizontal />
            </Filter>
          </Bar>

          {/* Tab Bar */}
          <TabBar>
            <TabButton 
              isActive={false}
              onPress={() => router.navigate('/(tabs)/home')}
            >
              <LayoutList size={24} color="#9CA3AF" />
              <TabText isActive={false}>Available</TabText>
            </TabButton>
            <TabButton isActive={true}>
              <CheckCircle size={24} color="#4F46E5" />
              <TabText isActive={true}>Completed</TabText>
            </TabButton>
          </TabBar>

          {/* Results Header */}
          <ResultsHeader>
            <ResultsHeaderText>Completed Requests ({requests.length})</ResultsHeaderText>
          </ResultsHeader>

          {/* Empty State */}
          {requests.length === 0 ? (
            <EmptyStateContainer>
              <EmptyStateText>No completed requests yet</EmptyStateText>
            </EmptyStateContainer>
          ) : (
            /* Scrollable Results List */
            requests.map((request) => (
              <ResultCard key={request.id}>
                {/* Top Row: CSR Logo and Profile */}
                <TopRow>
                  <NameContainer>
                    <PinName>{request.pinName}</PinName>
                    {/* Show rating badge if rated */}
                    {request.isRated && (
                      <RatingBadgeContainer>
                        <Star size={14} color="#FCD34D" fill="#FCD34D" />
                        <RatingBadgeText>Rated {request.rating}/5</RatingBadgeText>
                      </RatingBadgeContainer>
                    )}
                  </NameContainer>
                </TopRow>

                {/* Categories Row */}
                <CategoriesRow>
                  <CategoryTag backgroundColor="#F3F4F6">
                    <MapPin size={14} color="#374151" />
                    <CategoryText color="#374151">{request.location}</CategoryText>
                  </CategoryTag>
                  <CategoryTag backgroundColor={getUrgencyColor(request.urgency)}>
                    <AlertCircle size={14} color={getUrgencyTextColor(request.urgency)} />
                    <CategoryText color={getUrgencyTextColor(request.urgency)}>
                      {request.urgency}
                    </CategoryText>
                  </CategoryTag>
                </CategoriesRow>

                {/* Request Info */}
                <RequestInfo>{request.requestInfo}</RequestInfo>

                {/* Conditional buttons based on rating status */}
                {request.isRated ? (
                  // Already rated - show view button
                  <ViewMatchButton>
                    <ViewMatchButtonText>View Rating</ViewMatchButtonText>
                  </ViewMatchButton>
                ) : (
                  // Not rated - show rate button that navigates to rateService
                  <RateServiceButton
                    onPress={() => router.push({
                      pathname: '/(manage-request)/rateService' as any,
                      params: {
                        requestId: request.id.toString(),
                        requestInfo: request.requestInfo,
                        volunteerName: request.pinName,
                        completedDate: request.completedDate
                      }
                    })}
                  >
                    <Star size={18} color="#FFFFFF" />
                    <RateServiceButtonText>Rate This Service</RateServiceButtonText>
                  </RateServiceButton>
                )}
              </ResultCard>
            ))
          )}
        </ScrollContainer>

        {/* Create Listing Button */}
        <CreateListingContainer>
          <SquarePen 
            size={26} 
            color={'#ffffff'}
            onPress={() => router.navigate('(create-request)/(steps)/step1' as any)}
          />
        </CreateListingContainer>
      </SafeAreaViewContainer>
    </>
  );
};

export default CompletedRequestScreen;

// Styled Components 
const MenuContainer = styled.View`
  flex-direction: row;
  align-items: center;
  width: 40%;
  margin-bottom: 16px;
`;

const Bar = styled.View`
  flex-direction: row;
  background-color: #E6E6E6;
  padding-horizontal: 4px;
  padding-vertical: 6px;
  border-radius: 30px;
  justify-content: space-evenly;
  align-items: center;
  shadow-color: #000000;
  shadow-offset: 0px 0.5px;
  shadow-radius: 1px;
  shadow-opacity: 0.3;
  elevation: 1;
  width: 99%;
  align-self: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.Pressable`
  padding-horizontal: 20px;
  padding-vertical: 12px;
  background-color: #ffffff;
  border-radius: 30px;
  overflow: hidden;
  justify-content: flex-start;
  width: 80%;
`;

const Filter = styled.Pressable`
  padding-horizontal: 14px;
  padding-vertical: 12px;
  background-color: #ffffff;
  border-radius: 30px;
  overflow: hidden;
`;

const TabBar = styled.View`
  flex-direction: row;
  background-color: #ffffff;
  padding-horizontal: 8px;
  padding-vertical: 8px;
  border-radius: 12px;
  margin-bottom: 20px;
  width: 99%;
  align-self: center;
  shadow-color: #000000;
  shadow-offset: 0px 1px;
  shadow-radius: 3px;
  shadow-opacity: 0.08;
  elevation: 2;
`;

const TabButton = styled.TouchableOpacity<{ isActive: boolean }>`
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-vertical: 10px;
  padding-horizontal: 12px;
  gap: 4px;
`;

const TabText = styled.Text<{ isActive: boolean }>`
  font-size: 12px;
  font-weight: ${props => props.isActive ? '600' : '500'};
  color: ${props => props.isActive ? '#4F46E5' : '#9CA3AF'};
  margin-top: 2px;
`;

const CreateListingContainer = styled.Pressable`
  border-radius: 50px;
  border-width: 1px;
  border-color: #D1D1D1;
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px;
  shadow-color: #000000;
  shadow-offset: 1px 1px;
  shadow-radius: 1px;
  shadow-opacity: 0.3;
  elevation: 1;
  background-color: #2B61A6;
`;

const ResultsHeader = styled.View`
  margin-bottom: 16px;
`;

const ResultsHeaderText = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
`;

const EmptyStateContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #9CA3AF;
  text-align: center;
`;

const ResultCard = styled.View`
  background-color: #FFFFFF;
  border-radius: 16px;
  border-width: 1px;
  border-color: #E5E7EB;
  padding: 20px;
  margin-bottom: 16px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
`;

const CSRLogoContainer = styled.View`
  width: 56px;
  height: 56px;
  background-color: #DBEAFE;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const CSRLogoText = styled.Text`
  font-size: 24px;
`;

const ProfileImage = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border-width: 2px;
  border-color: #E5E7EB;
`;

const NameContainer = styled.View`
  flex: 1;
`;

const PinName = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const RatingBadgeContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: #FEF3C7;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 12px;
  align-self: flex-start;
`;

const RatingBadgeText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
`;

const CategoriesRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const CategoryTag = styled.View<{ backgroundColor: string }>`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: ${props => props.backgroundColor};
  border-radius: 50px;
  padding-horizontal: 12px;
  padding-vertical: 8px;
`;

const CategoryText = styled.Text<{ color: string }>`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.color};
`;

const RequestInfo = styled.Text`
  font-size: 14px;
  color: #6B7280;
  line-height: 20px;
  margin-bottom: 16px;
`;

const ViewMatchButton = styled.TouchableOpacity`
  background-color: #6B7280;
  border-radius: 50px;
  padding-horizontal: 24px;
  padding-vertical: 14px;
  align-items: center;
`;

const ViewMatchButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;

const RateServiceButton = styled.TouchableOpacity`
  background-color: #2B61A6;
  border-radius: 50px;
  padding-horizontal: 24px;
  padding-vertical: 14px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const RateServiceButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
`;