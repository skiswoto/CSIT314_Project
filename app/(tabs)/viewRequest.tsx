import { useRouter } from 'expo-router';
import { Menu, Search, SlidersHorizontal } from 'lucide-react-native';
import { StatusBar, View } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';

// Sample data for listings - can be replaced with Supabase data later
const requestListings = [
    {
        id: 1,
        pinProfile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        pinName: 'Sarah Chen',
        requestInfo: 'Need assistance with grocery shopping'
    },
    {
        id: 2,
        pinProfile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        pinName: 'David Tan',
        requestInfo: 'Looking for transportation to medical appointment'
    },
    {
        id: 3,
        pinProfile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        pinName: 'Emily Wong',
        requestInfo: 'Need help with household repairs'
    }
];

const RequestListings = () => {

    const router = useRouter();

    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
                    {/*Menu Icon*/}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '40%',
                            marginBottom: 16,
                        }}
                    >
                        <Menu size={26} />
                    </View>
                    {/* Search Bar & Filter */}
                    <Bar>
                        <SearchBar>
                            <Search />
                        </SearchBar>
                        <Filter>
                            <SlidersHorizontal />
                        </Filter>
                    </Bar>
                    {/* Results Header */}
                    <ResultsHeader>
                        <ResultsHeaderText>Request Listings ({requestListings.length})</ResultsHeaderText>
                    </ResultsHeader>
                    {/* Scrollable Request List */}
                    {requestListings.map((request) => (
                        <RequestCard key={request.id}>
                            <RequestContent>
                                <ProfileImage source={{ uri: request.pinProfile }} resizeMode="cover" />
                                <InfoContainer>
                                    <PinName>{request.pinName}</PinName>
                                    <RequestInfo>{request.requestInfo}</RequestInfo>
                                </InfoContainer>
                            </RequestContent>
                            <ViewRequestButton onPress={() => router.push({
                                pathname: '/(manage-request)/viewStats1',
                                params: {
                                    requestId: request.id,
                                    pinName: request.pinName,
                                    requestInfo: request.requestInfo
                                }
                            })}>
                                <ViewRequestButtonText>View Request</ViewRequestButtonText>
                            </ViewRequestButton>
                        </RequestCard>
                    ))}
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    );
};

export default RequestListings;

// Search Bar Styles
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
    
const ResultsHeader = styled.View`
    margin-bottom: 16px;
`;

const ResultsHeaderText = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #1F2937;
`;

const RequestCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 16px;
    border-width: 1px;
    border-color: #E5E7EB;
    padding: 20px;
    margin-bottom: 16px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const RequestContent = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 12px;
    flex: 1;
    margin-right: 12px;
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

const RequestInfo = styled.Text`
    font-size: 14px;
    font-weight: 400;
    color: #6B7280;
    line-height: 20px;
`;
  
const ViewRequestButton = styled.TouchableOpacity`
    background-color: #2B61A6;
    border-radius: 50px;
    padding-horizontal: 20px;
    padding-vertical: 12px;
    align-items: center;
`;

const ViewRequestButtonText = styled.Text`
    font-size: 14px;
    font-weight: 600;
    color: #FFFFFF;
`;