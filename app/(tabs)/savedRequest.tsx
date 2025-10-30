import { useRouter } from 'expo-router';
import { AlertCircle, MapPin, Menu, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Alert, StatusBar, View } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';

// Sample data for saved/shortlisted requests - can be replaced with Supabase data later
const savedRequests = [
    {
        id: 1,
        pinProfile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        pinName: 'Sarah Chen',
        requestInfo: 'Need assistance with grocery shopping',
        location: 'Jurong West',
        urgency: 'High',
        savedDate: '2024-10-28'
    },
    {
        id: 2,
        pinProfile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        pinName: 'David Tan',
        requestInfo: 'Looking for transportation to medical appointment',
        location: 'Tampines',
        urgency: 'Medium',
        savedDate: '2024-10-27'
    },
    {
        id: 3,
        pinProfile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        pinName: 'Emily Wong',
        requestInfo: 'Need help with household repairs',
        location: 'Bishan',
        urgency: 'Low',
        savedDate: '2024-10-26'
    },
    {
        id: 4,
        pinProfile: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        pinName: 'Michael Lee',
        requestInfo: 'Seeking companionship for elderly parent',
        location: 'Clementi',
        urgency: 'High',
        savedDate: '2024-10-25'
    }
];

const SavedRequests = () => {
    const router = useRouter();

    const handleRemove = (id: number, pinName: string) => {
        Alert.alert(
            'Remove Request',
            `Remove ${pinName}'s request from your saved list?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement remove functionality with Supabase
                        console.log('Removing saved request:', id);
                    }
                }
            ]
        );
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

                    {/* Empty State */}
                    {savedRequests.length === 0 ? (
                        <EmptyState>
                            <EmptyStateText>No saved requests yet</EmptyStateText>
                            <EmptyStateSubText>
                                Start saving requests to manage them effectively
                            </EmptyStateSubText>
                        </EmptyState>
                    ) : (
                        /* Scrollable Saved Requests */
                        savedRequests.map((request) => (
                            <RequestCard key={request.id}>
                                <CardTop>
                                    <ProfileSection>
                                        <ProfileImage 
                                            source={{ uri: request.pinProfile }} 
                                            resizeMode="cover" 
                                        />
                                        <InfoContainer>
                                            <PinName>{request.pinName}</PinName>
                                            <SavedDate>Saved on {request.savedDate}</SavedDate>
                                        </InfoContainer>
                                    </ProfileSection>
                                    <RemoveButton 
                                        onPress={() => handleRemove(request.id, request.pinName)}
                                    >
                                        <X size={20} color="#DC2626" />
                                    </RemoveButton>
                                </CardTop>

                                <RequestInfo>{request.requestInfo}</RequestInfo>

                                <TagsRow>
                                    <Tag backgroundColor="#F3F4F6">
                                        <MapPin size={14} color="#374151" />
                                        <TagText color="#374151">{request.location}</TagText>
                                    </Tag>
                                    <Tag backgroundColor={getUrgencyColor(request.urgency)}>
                                        <AlertCircle size={14} color={getUrgencyTextColor(request.urgency)} />
                                        <TagText color={getUrgencyTextColor(request.urgency)}>
                                            {request.urgency}
                                        </TagText>
                                    </Tag>
                                </TagsRow>

                                <ActionButtons>
                                    <ViewDetailsButton 
                                        onPress={() => router.push({
                                            pathname: '/(manage-request)/viewStats1',
                                            params: {
                                                requestId: request.id,
                                                pinName: request.pinName,
                                                requestInfo: request.requestInfo
                                            }
                                        })}
                                    >
                                        <ViewDetailsButtonText>View Details</ViewDetailsButtonText>
                                    </ViewDetailsButton>
                                    <ApplyButton
                                        onPress={() => {
                                            Alert.alert(
                                                'Apply to Request',
                                                `Apply to help ${request.pinName}?`,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { 
                                                        text: 'Apply', 
                                                        onPress: () => console.log('Applied to request:', request.id)
                                                    }
                                                ]
                                            );
                                        }}
                                    >
                                        <ApplyButtonText>Apply Now</ApplyButtonText>
                                    </ApplyButton>
                                </ActionButtons>
                            </RequestCard>
                        ))
                    )}
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    );
};

export default SavedRequests;

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

const ApplyButton = styled.TouchableOpacity`
    flex: 1;
    background-color: #2B61A6;
    border-radius: 50px;
    padding-vertical: 12px;
    align-items: center;
`;

const ApplyButtonText = styled.Text`
    font-size: 14px;
    font-weight: 600;
    color: #FFFFFF;
`;