import { userAuthStore } from '@/global/userAuthStore';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { CheckCircle, Heart, LayoutList, MapPin, MoveRight, Search, SlidersHorizontal, SquarePen, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StatusBar, Text } from 'react-native';
import { styled } from 'styled-components/native';
import { hasPermission } from '../../config/permissions';
import { SafeAreaViewContainer } from '../../constants/GlobalStyles';
import FilterBottomSheet from '../../services/filter';
import { getAllListings, ListingFilters } from '../../services/listings';
import { fetchMySavedIds, toggleSave } from '../../services/savedListings';
// services/clickTracker.js (or wherever you are defining this function)
import { supabase } from '@/libs/supabase'; // ensure this is the correct import for supabase

export const incrementMonthClick = async () => {
  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'short' }); // e.g., 'Nov' for November
    const { data: row, error: fetchError } = await supabase
      .from('pindashboard')
      .select('clicks')
      .eq('month', currentMonth)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // 'PGRST116' means no row found
      throw fetchError;
    }

    let newClicks = 1;
    if (row) {
      newClicks = row.clicks + 1;
      const { error } = await supabase
        .from('pindashboard')
        .update({ clicks: newClicks })
        .eq('month', currentMonth);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('pindashboard')
        .insert({ month: currentMonth, clicks: newClicks });

      if (error) {
        throw error;
      }
    }

    console.log('Click count updated or inserted');
  } catch (error) {
    console.error('Error updating click count:', error);
  }
};


const Home = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [filterVisible, setFilterVisible] = useState(false);

  const user = userAuthStore((s) => s.user);
  const userRole = user?.user_metadata.role;

  // --- NEW: search text state
  const [searchText, setSearchText] = useState('');

  // Saved IDs for heart fill state
  const [savedIds, setSavedIds] = useState<number[]>([]);
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const ids = await fetchMySavedIds();
          setSavedIds(ids);
        } catch (e) {
          console.log('Failed to load saved ids', e);
        }
      })();
    }, [])
  );

  const handleToggleSave = async (id: number) => {
    try {
      const nowSaved = await toggleSave(id);
      setSavedIds((prev) => (nowSaved ? [...prev, id] : prev.filter((x) => x !== id)));
    } catch (e) {
      console.log('toggleSave error', e);
    }
  };

  // Separate filter states for each tab
  const [availableFilters, setAvailableFilters] = useState<ListingFilters>({
    locations: [],
    serviceTypes: [],
    urgencies: [],
    dateRange: { start: null, end: null },
    status: 'available'
  });

  const [completedFilters, setCompletedFilters] = useState<ListingFilters>({
    locations: [],
    serviceTypes: [],
    urgencies: [],
    dateRange: { start: null, end: null },
    status: 'completed'
  });

  const currentFilters = activeTab === 'available' ? availableFilters : completedFilters;

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['listings', activeTab, currentFilters],
    queryFn: () => getAllListings(currentFilters),
  });

  const handleApplyFilters = (filters: Omit<ListingFilters, 'status'>) => {
    if (activeTab === 'available') {
      setAvailableFilters({ ...filters, status: 'available' });
    } else {
      setCompletedFilters({ ...filters, status: 'completed' });
    }
  };

  const clearCurrentFilters = () => {
    if (activeTab === 'available') {
      setAvailableFilters({
        locations: [], serviceTypes: [], urgencies: [],
        dateRange: { start: null, end: null }, status: 'available'
      });
    } else {
      setCompletedFilters({
        locations: [], serviceTypes: [], urgencies: [],
        dateRange: { start: null, end: null }, status: 'completed'
      });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilters.locations.length > 0) count += currentFilters.locations.length;
    if (currentFilters.serviceTypes.length > 0) count += currentFilters.serviceTypes.length;
    if (currentFilters.urgencies.length > 0) count += currentFilters.urgencies.length;
    if (currentFilters.dateRange.start || currentFilters.dateRange.end) count += 1;
    return count;
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

  // --- NEW: client-side filtering by search text
  const visibleListings = (listings ?? []).filter((l: any) => {
    if (!searchText.trim()) return true;
    const q = searchText.trim().toLowerCase();
    return (
      l.category?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.street_address?.toLowerCase().includes(q) ||
      l.urgency?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <HeaderSection>
          <MenuContainer />
          <Bar>
            {/* --- NEW: real search input */}
            <SearchBarContainer>
              <Search />
              <SearchInput
                placeholder="Search listings…"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <ClearSearch onPress={() => setSearchText('')}>
                  <X size={16} color="#6B7280" />
                </ClearSearch>
              )}
            </SearchBarContainer>

            <FilterButtonContainer>
              <Filter onPress={() => setFilterVisible(true)}>
                <SlidersHorizontal />
              </Filter>
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

          <SavedNav onPress={() => router.push('/(manage-request)/savedRequest')}>
            <SavedNavText>Go to Saved</SavedNavText>
          </SavedNav>
        </HeaderSection>

        <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
          {getActiveFilterCount() > 0 && (
            <ActiveFiltersContainer>
              <ActiveFiltersText>
                {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied
              </ActiveFiltersText>
              <ClearFiltersButton onPress={clearCurrentFilters}>
                <ClearFiltersText>Clear all</ClearFiltersText>
              </ClearFiltersButton>
            </ActiveFiltersContainer>
          )}

          {isLoading && (
            <LoadingContainer>
              <ActivityIndicator size="large" color="#2B61A6" />
              <LoadingText>Loading listings...</LoadingText>
            </LoadingContainer>
          )}

          {error && (
            <ErrorText>Error loading listings. Please try again.</ErrorText>
          )}

          {!isLoading && visibleListings && hasPermission(userRole, 'canViewAllListings') ? (
            visibleListings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                onPress={async () => {
                  console.log('Listing card clicked'); // For debugging
                  try {
                    await incrementMonthClick();
                    router.navigate({
                      pathname: '/(specific-listing)/sampleListing',
                      params: {
                        listingId: String(listing.id),
                        category: listing.category,
                        description: listing.description,
                        address: listing.street_address,
                        startTime: listing.start_time,
                        duration: listing.duration,
                        urgency: listing.urgency,
                        status: listing.status
                      }
                    });
                  } catch (e) {
                    console.error('Error on listing click:', e);
                  }
                }}
              >
                <CardContent>
                  <CardHeader>
                    <CategoryBadge>
                      <CategoryBadgeText>{listing.category}</CategoryBadgeText>
                    </CategoryBadge>

                    <CardActions>
                      <ActionButton onPress={() => handleToggleSave(listing.id)}> {/* Heart icon to save */}
                        <Heart
                          size={20}
                          color={savedIds.includes(listing.id) ? '#EF4444' : '#6B7280'}
                          fill={savedIds.includes(listing.id) ? '#EF4444' : 'transparent'}
                        />
                      </ActionButton>

                      <ActionButton onPress={handleViewRequestClick}> {/* View Request Button */}
                        <MoveRight size={20} color="#6B7280" />
                        <Text>View Request</Text> {/* Optional: Add some text here for clarity */}
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

                    <FooterRow>
                      {listing.urgency && (
                        <UrgencyBadge backgroundColor={getUrgencyColor(listing.urgency)}>
                          <UrgencyText color={getUrgencyTextColor(listing.urgency)}>
                            {listing.urgency} Priority
                          </UrgencyText>
                        </UrgencyBadge>
                      )}
                      {activeTab === 'completed' && (
                        <StatusBadge>
                          <CheckCircle size={14} color="#16A34A" />
                          <StatusText>Completed</StatusText>
                        </StatusBadge>
                      )}
                    </FooterRow>
                  </CardFooter>
                </CardContent>
              </ListingCard>
            ))
          ) : (
            <EmptyListingsContainer>
              <SigninToViewListingsText>- Sign in to view listings -</SigninToViewListingsText>
            </EmptyListingsContainer>
          )}

          {!isLoading && visibleListings && visibleListings.length === 0 && (
            <EmptyText>
              {searchText
                ? `No ${activeTab} listings match "${searchText}".`
                : `No ${activeTab} listings yet.`}
            </EmptyText>
          )}
        </ScrollContainer>

        {hasPermission(userRole, 'canCreateListings') && (
          <CreateListingContainer>
            <SquarePen
              size={26}
              color={'#ffffff'}
              onPress={() => router.navigate('(create-request)/(steps)/step1' as any)}
            />
          </CreateListingContainer>
        )}
      </SafeAreaViewContainer>

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={{
          locations: currentFilters.locations,
          serviceTypes: currentFilters.serviceTypes,
          urgencies: currentFilters.urgencies,
          dateRange: currentFilters.dateRange
        }}
      />
    </>
  );
};

export default Home;

/* ---------------- Styles ---------------- */

const ScrollContainer = styled.ScrollView`
  margin-horizontal: 20px;
  padding-top: 16px;
`;

const HeaderSection = styled.View`
  background-color: #ffffff;
`;

const MenuContainer = styled.View`
  padding-top: 80px;
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

/* NEW: Search input UI */
const SearchBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-horizontal: 14px;
  padding-vertical: 10px;
  background-color: #ffffff;
  border-radius: 30px;
  width: 80%;
`;
const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 15px;
  color: #111827;
`;
const ClearSearch = styled.Pressable`
  padding: 4px;
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

const TabBar = styled.View`
  flex-direction: row;
  background-color: #FFFFFF;
  padding-horizontal: 8px;
  padding-vertical: 6px;
  border-radius: 12px;
  margin-bottom: 12px;
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
  font-weight: ${props => (props.isActive ? '600' : '500')};
  color: ${props => (props.isActive ? '#000000' : '#9CA3AF')};
  margin-top: 2px;
`;

/* Go to Saved button */
const SavedNav = styled.TouchableOpacity`
  align-self: flex-end;
  margin-right: 20px;
  margin-bottom: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background-color: #F3F4F6;
`;
const SavedNavText = styled.Text`
  font-weight: 600;
  color: #111827;
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
  flex-direction: row;
  align-items: center;
  gap: 4px;
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

const FooterRow = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const StatusBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: #DCFCE7;
  padding: 6px 12px;
  border-radius: 16px;
`;

const StatusText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: #16A34A;
`;

const EmptyListingsContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-top: 100px;
`;

const SigninToViewListingsText = styled.Text`
  color: #8A8A8A;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

const handleViewRequestClick = async () => {
  console.log('View Request clicked');
  try {
    await incrementMonthClick(); // Ensure that the click count is updated in the database first
    router.push('/(manage-request)/viewStats1'); // Then navigate to the next screen
  } catch (e) {
    console.error('Error recording click:', e); // Catch any errors during the increment or navigation
  }
};