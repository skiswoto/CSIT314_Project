/*import { StatusBar } from 'react-native'
import { H1, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles'


const MyListings = () => {
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScrollContainer>
                    <H1>my listings</H1>
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default MyListings
*/

import { useRouter } from 'expo-router';
import { Edit2, Menu, Search, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import { Alert, StatusBar, View } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';

// Sample data for PIN's own listings - can be replaced with Supabase data later
const myListings = [
    {
        id: 1,
        requestInfo: 'Need assistance with grocery shopping',
        status: 'Active',
        createdDate: '2024-10-15',
        matchesCount: 3
    },
    {
        id: 2,
        requestInfo: 'Looking for transportation to medical appointment',
        status: 'Matched',
        createdDate: '2024-10-20',
        matchesCount: 5
    },
    {
        id: 3,
        requestInfo: 'Need help with household repairs',
        status: 'Active',
        createdDate: '2024-10-28',
        matchesCount: 1
    }
];

const MyListings = () => {
    const router = useRouter();

    const handleDelete = (id: number, requestInfo: string) => {
        Alert.alert(
            'Delete Request',
            `Are you sure you want to delete "${requestInfo}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement delete functionality with Supabase
                        console.log('Deleting request:', id);
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return '#DBEAFE';
            case 'Matched':
                return '#DCFCE7';
            case 'Completed':
                return '#F3F4F6';
            default:
                return '#F3F4F6';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Active':
                return '#1E40AF';
            case 'Matched':
                return '#166534';
            case 'Completed':
                return '#374151';
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

                    {/* Results Header */}
                    <ResultsHeader>
                        <ResultsHeaderText>My Requests ({myListings.length})</ResultsHeaderText>
                    </ResultsHeader>

                    {/* Scrollable My Listings */}
                    {myListings.map((listing) => (
                        <ListingCard key={listing.id}>
                            <CardHeader>
                                <StatusBadge 
                                    backgroundColor={getStatusColor(listing.status)}
                                >
                                    <StatusText color={getStatusTextColor(listing.status)}>
                                        {listing.status}
                                    </StatusText>
                                </StatusBadge>
                                <ActionButtons>
                                    <ActionButton>
                                        <Edit2 size={18} color="#2B61A6" />
                                    </ActionButton>
                                    <ActionButton 
                                        onPress={() => handleDelete(listing.id, listing.requestInfo)}
                                    >
                                        <Trash2 size={18} color="#DC2626" />
                                    </ActionButton>
                                </ActionButtons>
                            </CardHeader>

                            <RequestInfo>{listing.requestInfo}</RequestInfo>

                            <CardFooter>
                                <FooterInfo>
                                    <FooterLabel>Created:</FooterLabel>
                                    <FooterValue>{listing.createdDate}</FooterValue>
                                </FooterInfo>
                                <FooterInfo>
                                    <FooterLabel>Matches:</FooterLabel>
                                    <FooterValue>{listing.matchesCount}</FooterValue>
                                </FooterInfo>
                            </CardFooter>

                            <ViewDetailsButton 
                                onPress={() => router.push({
                                    pathname: '/(manage-request)/completedRequest',
                                    params: {
                                        requestId: listing.id,
                                        requestInfo: listing.requestInfo,
                                        status: listing.status,
                                        matchesCount: listing.matchesCount
                                    }
                                })}
                            >
                                <ViewDetailsButtonText>View Details</ViewDetailsButtonText>
                            </ViewDetailsButton>
                        </ListingCard>
                    ))}
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    );
};

export default MyListings;

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
    background-color: ${props => props.backgroundColor};
    padding-horizontal: 12px;
    padding-vertical: 6px;
    border-radius: 16px;
`;

const StatusText = styled.Text<{ color: string }>`
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.color};
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