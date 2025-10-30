import React from 'react';
import { StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, Search, SlidersHorizontal, MapPin, AlertCircle, LayoutList, CheckCircle, SquarePen } from 'lucide-react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';

// Sample data for matched requests - can be replaced with Supabase data later
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

const CompletedRequestScreen = () => {
  const router = useRouter();

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
            <ResultsHeaderText>Matched Requests ({matchedRequests.length})</ResultsHeaderText>
          </ResultsHeader>

          {/* Scrollable Results List */}
          {matchedRequests.map((request) => (
            <ResultCard key={request.id}>
              {/* Top Row: CSR Logo and Profile */}
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

              {/* View Match Button */}
              <ViewMatchButton>
                <ViewMatchButtonText>View Match</ViewMatchButtonText>
              </ViewMatchButton>
            </ResultCard>
          ))}
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

const ViewMatchButton = styled.TouchableOpacity`
  background-color: #2B61A6;
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