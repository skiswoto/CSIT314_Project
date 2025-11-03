import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle, Heart, LayoutList, MapPin, Menu, MoveRight, Search, SlidersHorizontal, SquarePen } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer } from '../../constants/GlobalStyles';
import { getAllListings, ListingFilters } from '../../services/listings';
import FilterBottomSheet from '../filter';

// Sample data for matched requests
const matchedRequests = [
  {
    id: 1,
    csrLogo: '🏢',
    pinProfile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    location: 'Jurong West',
    urgency: 'High',
    pinName: 'Sarah Chen'
  },
  {
    id: 2,
    csrLogo: '🏥',
    pinProfile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    location: 'Tampines',
    urgency: 'Medium',
    pinName: 'David Tan'
  },
  {
    id: 3,
    csrLogo: '🍲',
    pinProfile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    location: 'Bishan',
    urgency: 'Low',
    pinName: 'Emily Wong'
  },
  {
    id: 4,
    csrLogo: '🚗',
    pinProfile: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    location: 'Clementi',
    urgency: 'High',
    pinName: 'Michael Lee'
  }
];

const Home = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Initialize with proper type
  const [appliedFilters, setAppliedFilters] = useState<ListingFilters>({
    locations: [],
    serviceTypes: [],
    urgencies: [],
    dateRange: { start: null, end: null }
  });

  // Update query to use filters
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['all-listings', appliedFilters],
    queryFn: () => getAllListings(appliedFilters),
  });

  const handleApplyFilters = (filters: ListingFilters) => {
    console.log('Applied Filters:', filters);
    setAppliedFilters(filters);
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.locations.length > 0) count += appliedFilters.locations.length;
    if (appliedFilters.serviceTypes.length > 0) count += appliedFilters.serviceTypes.length;
    if (appliedFilters.urgencies.length > 0) count += appliedFilters.urgencies.length;
    if (appliedFilters.dateRange.start || appliedFilters.dateRange.end) count += 1;
    return count;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return '#FEE2E2';
      case 'Medium':
        return '#FFEDD5';
      case 'Low':
        return '#DCFCE7';
      default:
        return '#F3F4F6';
    }
  };

  const getUrgencyTextColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return '#B91C1C';
      case 'Medium':
        return '#C2410C';
      case 'Low':
        return '#166534';
      default:
        return '#374151';
    }
  };

  console.log('Query state:', { 
    isLoading, 
    error: error?.message, 
    listingsCount: listings?.length,
    appliedFilters
  });

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <HeaderSection>
          <MenuContainer>
            <Menu size={26} />
          </MenuContainer>
          <Bar>
            <SearchBar>
              <Search />
            </SearchBar>
            <FilterButtonContainer>
              <Filter onPress={() => setFilterVisible(true)}>
                <SlidersHorizontal />
              </Filter>
              {/* Show badge with filter count */}
              {getActiveFilterCount() > 0 && (
                <FilterBadge>
                  <FilterBadgeText>{getActiveFilterCount()}</FilterBadgeText>
                </FilterBadge>
              )}
            </FilterButtonContainer>
          </Bar>
          <TabBar>
            <TabButton 
              isActive={activeTab === 'available'}
              onPress={() => setActiveTab('available')}
            >
              <LayoutList size={24} color={activeTab === 'available' ? '#000000' : '#9CA3AF'} />
              <TabText isActive={activeTab === 'available'}>Available</TabText>
            </TabButton>
            <TabButton 
              isActive={activeTab === 'completed'}
              onPress={() => setActiveTab('completed')}
            >
              <CheckCircle size={24} color={activeTab === 'completed' ? '#000000' : '#9CA3AF'} />
              <TabText isActive={activeTab === 'completed'}>Completed</TabText>
            </TabButton>
          </TabBar>
        </HeaderSection>

        <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
          {activeTab === 'available' ? (
            <>
              {/* Show active filters summary */}
              {getActiveFilterCount() > 0 && (
                <ActiveFiltersContainer>
                  <ActiveFiltersText>
                    {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied
                  </ActiveFiltersText>
                  <ClearFiltersButton onPress={() => setAppliedFilters({
                    locations: [],
                    serviceTypes: [],
                    urgencies: [],
                    dateRange: { start: null, end: null }
                  })}>
                    <ClearFiltersText>Clear all</ClearFiltersText>
                  </ClearFiltersButton>
                </ActiveFiltersContainer>
              )}

              {/* Loading State */}
              {isLoading && (
                <LoadingContainer>
                  <ActivityIndicator size="large" color="#2B61A6" />
                  <LoadingText>Loading listings...</LoadingText>
                </LoadingContainer>
              )}

              {/* Error State */}
              {error && (
                <ErrorText>Error loading listings. Please try again.</ErrorText>
              )}

              {/* Map through real listings from Supabase */}
              {!isLoading && listings && listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  onPress={() => router.navigate({
                    pathname: '/(specific-listing)/sampleListing',
                    params: {
                      listingId: listing.id,
                      category: listing.category,
                      description: listing.description,
                      address: listing.street_address,
                      startTime: listing.start_time,
                      duration: listing.duration,
                      urgency: listing.urgency
                    }
                  })}
                >
                  <CardContent>
                    <CardHeader>
                      <CategoryBadge>
                        <CategoryBadgeText>{listing.category}</CategoryBadgeText>
                      </CategoryBadge>
                      <CardActions>
                        <ActionButton>
                          <Heart size={20} color="#6B7280" />
                        </ActionButton>
                        <ActionButton>
                          <MoveRight size={20} color="#6B7280" />
                        </ActionButton>
                      </CardActions>
                    </CardHeader>
                    
                    <CardBody>
                      <ListingTitle>{listing.category}</ListingTitle>
                      <ListingSubtitle numberOfLines={3}>
                        {listing.description}
                      </ListingSubtitle>
                    </CardBody>
                    
                    <CardFooter>
                      <LocationRow>
                        <MapPin size={16} color="#6B7280" />
                        <ListingLocation numberOfLines={1}>
                          {listing.street_address}
                        </ListingLocation>
                      </LocationRow>
                      {/* Show urgency badge if available */}
                      {listing.urgency && (
                        <UrgencyBadge backgroundColor={getUrgencyColor(listing.urgency)}>
                          <UrgencyText color={getUrgencyTextColor(listing.urgency)}>
                            {listing.urgency} Priority
                          </UrgencyText>
                        </UrgencyBadge>
                      )}
                    </CardFooter>
                  </CardContent>
                </ListingCard>
              ))}

              {/* Empty State */}
              {!isLoading && listings && listings.length === 0 && (
                <EmptyText>
                  {getActiveFilterCount() > 0 
                    ? 'No listings match your filters. Try adjusting them.' 
                    : 'No listings available yet.'}
                </EmptyText>
              )}
            </>
          ) : (
            <>
              <ResultsHeader>
                <ResultsHeaderText>Matched Requests ({matchedRequests.length})</ResultsHeaderText>
              </ResultsHeader>
              {matchedRequests.map((request) => (
                <ResultCard key={request.id}>
                  <TopRow>
                    <CSRLogoContainer>
                      <CSRLogoText>{request.csrLogo}</CSRLogoText>
                    </CSRLogoContainer>
                    <ProfileImage
                      source={{ uri: request.pinProfile }}
                      resizeMode="cover"
                    />
                    <NameContainer>
                      <PinName>{request.pinName}</PinName>
                    </NameContainer>
                  </TopRow>
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
                  <ViewMatchButton>
                    <ViewMatchButtonText>View Match</ViewMatchButtonText>
                  </ViewMatchButton>
                </ResultCard>
              ))}
            </>
          )}
        </ScrollContainer>

        <CreateListingContainer>
          <SquarePen 
            size={26} 
            color={'#ffffff'}
            onPress={() => router.navigate('(create-request)/(steps)/step1' as any)}
          />
        </CreateListingContainer>
      </SafeAreaViewContainer>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </>
  );
};

export default Home;

const ScrollContainer = styled.ScrollView`
    margin-horizontal: 20px;
    padding-top: 16px;
`

const HeaderSection = styled.View`
  background-color: #ffffff;
`;

const MenuContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 80px;
  padding-horizontal: 20px;
  margin-bottom: 24px;
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
  margin-horizontal: 20px;
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

const FilterButtonContainer = styled.View`
  position: relative;
`;

const FilterBadge = styled.View`
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #EF4444;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding-horizontal: 4px;
  z-index: 1;
`;

const FilterBadgeText = styled.Text`
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
`;

const ActiveFiltersContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #F3F4F6;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ActiveFiltersText = styled.Text`
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const ClearFiltersButton = styled.TouchableOpacity`
  padding: 4px 8px;
`;

const ClearFiltersText = styled.Text`
  font-size: 14px;
  color: #2B61A6;
  font-weight: 600;
`;

const TabBar = styled.View`
  flex-direction: row;
  background-color: #FFFFFF;
  padding-horizontal: 8px;
  padding-vertical: 6px;
  border-radius: 12px;
  margin-bottom: 20px;
  margin-horizontal: 20px;
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
  color: ${props => props.isActive ? '#000000' : '#9CA3AF'};
  margin-top: 2px;
`;

const ListingCard = styled.TouchableOpacity`
  background-color: #FFFFFF;
  border-radius: 16px;
  margin-bottom: 16px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const CardContent = styled.View`
  padding: 20px;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CategoryBadge = styled.View`
  background-color: #DBEAFE;
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-radius: 20px;
`;

const CategoryBadgeText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #1E40AF;
  text-transform: uppercase;
`;

const CardActions = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ActionButton = styled.Pressable`
  background-color: #F9FAFB;
  padding: 8px;
  border-radius: 20px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const CardBody = styled.View`
  margin-bottom: 16px;
`;

const CardFooter = styled.View`
  padding-top: 16px;
  border-top-width: 1px;
  border-top-color: #F3F4F6;
`;

const LocationRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const UrgencyBadge = styled.View<{ backgroundColor: string }>`
  background-color: ${props => props.backgroundColor};
  padding: 6px 12px;
  border-radius: 16px;
  align-self: flex-start;
`;

const UrgencyText = styled.Text<{ color: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
`;

const ListingTitle = styled.Text`
  font-weight: 700;
  font-size: 22px;
  color: #111827;
  margin-bottom: 8px;
`;

const ListingSubtitle = styled.Text`
  font-size: 15px;
  font-weight: 400;
  color: #6B7280;
  line-height: 22px;
`;

const ListingLocation = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  flex: 1;
`;

const CreateListingContainer = styled.Pressable`
  background-color: #000000;
  border-radius: 50px;
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 14px;
  shadow-color: #000000;
  shadow-offset: 2px 2px;
  shadow-radius: 4px;
  shadow-opacity: 0.3;
  elevation: 4;
`;

const ResultsHeader = styled.View`
  margin-bottom: 16px;
  padding-horizontal: 8px;
`;

const ResultsHeaderText = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const ResultCard = styled.View`
  background-color: #FFFFFF;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
  padding: 20px;
  margin-bottom: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
`;

const CSRLogoContainer = styled.View`
  width: 48px;
  height: 48px;
  background-color: #F3F4F6;
  border-radius: 24px;
  align-items: center;
  justify-content: center;
`;

const CSRLogoText = styled.Text`
  font-size: 24px;
`;

const ProfileImage = styled.Image`
  width: 48px;
  height: 48px;
  border-radius: 24px;
`;

const NameContainer = styled.View`
  flex: 1;
`;

const PinName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const CategoriesRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const CategoryTag = styled.View<{ backgroundColor: string }>`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: ${props => props.backgroundColor};
  border-radius: 16px;
`;

const CategoryText = styled.Text<{ color: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.color};
`;

const ViewMatchButton = styled.TouchableOpacity`
  background-color: #2B61A6;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
`;

const ViewMatchButtonText = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const LoadingContainer = styled.View`
  padding: 40px;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  margin-top: 12px;
  font-size: 14px;
  color: #6B7280;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: #EF4444;
  text-align: center;
  padding: 20px;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: #6B7280;
  text-align: center;
  padding: 40px 20px;
`;