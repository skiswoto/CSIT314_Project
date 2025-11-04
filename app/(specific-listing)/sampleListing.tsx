import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Calendar, Clock, Heart, MapPin } from 'lucide-react-native'
import { Image, ImageBackground, StyleSheet, View } from 'react-native'
import { styled } from 'styled-components/native'
import { SafeAreaViewContainer } from '../../constants/GlobalStyles'

const SampleListing = () => {
    const router = useRouter()
    
    // STEP 1: Receive the params passed from home.tsx
    const params = useLocalSearchParams()
    
    // STEP 2: Extract the data (all params come as strings)
    const {
        listingId,
        category,
        description,
        address,
        startTime,
        duration,
        urgency,
        status
    } = params
    
    // Log to see what we received
    console.log('Listing Detail Params:', params)
    
    // Helper function to get urgency color
    const getUrgencyColor = (urgency: string | string[] | undefined) => {
        if (!urgency) return '#F3F4F6';
        const urgencyStr = Array.isArray(urgency) ? urgency[0] : urgency;
        switch (urgencyStr) {
            case 'High': return '#FEE2E2';
            case 'Medium': return '#FFEDD5';
            case 'Low': return '#DCFCE7';
            default: return '#F3F4F6';
        }
    }
    
    const getUrgencyTextColor = (urgency: string | string[] | undefined) => {
        if (!urgency) return '#6B7280';
        const urgencyStr = Array.isArray(urgency) ? urgency[0] : urgency;
        switch (urgencyStr) {
            case 'High': return '#B91C1C';
            case 'Medium': return '#C2410C';
            case 'Low': return '#166534';
            default: return '#6B7280';
        }
    }

    // Format time (startTime comes as "14:00:00")
    const formatTime = (time: string | string[] | undefined) => {
        if (!time) return 'Not specified';
        const timeStr = Array.isArray(time) ? time[0] : time;
        // Convert "14:00:00" to "2:00 PM"
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    return (
        <SafeAreaViewContainer>
            <View style={{ flex: 1 }}>   
                <ImageBackground
                    style={styles.backgroundImage}
                    resizeMode='cover'
                    // Placeholder image - to be changed later on
                    source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800' }}
                >
                    <TopBar>
                        <IconContainer onPress={() => router.back()}>
                            <ArrowLeft size={26} />
                        </IconContainer>
                        <IconContainer>
                            <Heart size={26} />
                        </IconContainer>
                    </TopBar>
                </ImageBackground>

                <Card>
                    {/* STEP 3: Display category and urgency badges */}
                    <CategoryRow>
                        <Category backgroundColor="#DBEAFE">
                            <CategoryText color="#1E40AF">
                                {category || 'General'}
                            </CategoryText>
                        </Category>
                        
                        {urgency && (
                            <Category backgroundColor={getUrgencyColor(urgency)}>
                                <CategoryText color={getUrgencyTextColor(urgency)}>
                                    {Array.isArray(urgency) ? urgency[0] : urgency}
                                </CategoryText>
                            </Category>
                        )}
                        
                        {status && (
                            <Category backgroundColor={status === 'completed' ? '#DCFCE7' : '#F3F4F6'}>
                                <CategoryText color={status === 'completed' ? '#16A34A' : '#6B7280'}>
                                    {Array.isArray(status) ? status[0] : status}
                                </CategoryText>
                            </Category>
                        )}
                    </CategoryRow>

                    {/* Display the category as title */}
                    <ListingTitle>
                        {category || 'Service Request'}
                    </ListingTitle>

                    {/* Display the description */}
                    <ListingDescription>
                        {description || 'No description provided.'}
                    </ListingDescription>

                    {/* Additional details section */}
                    <DetailsSection>
                        {/* Address */}
                        {address && (
                            <DetailRow>
                                <MapPin size={18} color="#6B7280" />
                                <DetailText>{Array.isArray(address) ? address[0] : address}</DetailText>
                            </DetailRow>
                        )}

                        {/* Start time */}
                        {startTime && (
                            <DetailRow>
                                <Clock size={18} color="#6B7280" />
                                <DetailText>Starts at {formatTime(startTime)}</DetailText>
                            </DetailRow>
                        )}

                        {/* Duration */}
                        {duration && (
                            <DetailRow>
                                <Calendar size={18} color="#6B7280" />
                                <DetailText>
                                    Duration: {Array.isArray(duration) ? duration[0] : duration} hour(s)
                                </DetailText>
                            </DetailRow>
                        )}
                    </DetailsSection>

                    {/* Profile and Chat button row */}
                    <Row>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }} 
                            resizeMode="cover"
                            style={styles.profileImage}
                        />
                        <ChatButton>
                            <ChatButtonText>Chat now</ChatButtonText>
                        </ChatButton>
                    </Row>

                    {/* Apply button */}
                    <ApplyButton>
                        <ApplyButtonText>
                            {status === 'completed' ? 'View Details' : 'Save Listing'}
                        </ApplyButtonText>
                    </ApplyButton>
                </Card>
            </View>
        </SafeAreaViewContainer>
    )
}

export default SampleListing

const styles = StyleSheet.create({
    backgroundImage: {
        width: '100%',
        height: 500,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    }
})

const Card = styled.View`
    background-color: #ffffff;
    height: 46%;
    width: 100%;
    position: absolute;
    bottom: 0px;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    overflow: hidden;
    padding-horizontal: 20px;
    padding-vertical: 20px;
`

const ApplyButton = styled.TouchableOpacity`
    background-color: #111827;
    border-radius: 24px;
    overflow: hidden;
    padding-horizontal: 14px;
    padding-vertical: 18px;
`

const ChatButton = styled.Pressable`
    background-color: #F2F2F2;
    border-radius: 24px;
    overflow: hidden;
    padding-horizontal: 20px;
    padding-vertical: 14px;
`

const Category = styled.View<{ backgroundColor?: string }>`
    background-color: ${props => props.backgroundColor || '#F5F5F5'};
    border-radius: 20px;
    overflow: hidden;
    padding-horizontal: 12px;
    padding-vertical: 8px;
    margin-right: 8px;
`

const IconContainer = styled.Pressable`
    background-color: #ffffff;
    border-radius: 50px;
    overflow: hidden;
    padding: 6px;
`

const ComponentText = styled.Text`
    align-self: center;
`

const ApplyButtonText = styled(ComponentText)`
    font-weight: 600;
    font-size: 20px;
    color: #ffffff;
`

const ChatButtonText = styled(ComponentText)`
    font-weight: 600;
    font-size: 14px;
`

const CategoryText = styled.Text<{ color?: string }>`
    font-weight: 600;
    font-size: 12px;
    align-self: center;
    color: ${props => props.color || '#6B7280'};
`

const ListingTitle = styled.Text`
    font-weight: 600;
    font-size: 24px;
    margin-bottom: 14px;
`

const ListingDescription = styled.Text`
    font-weight: 400;
    font-size: 14px;
    color: #636363;
    margin-bottom: 20px;
    line-height: 22px;
`

const DetailsSection = styled.View`
    margin-bottom: 20px;
    gap: 12px;
`

const DetailRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`

const DetailText = styled.Text`
    font-size: 14px;
    color: #6B7280;
    font-weight: 500;
    flex: 1;
`

const TopBar = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 70px;
    margin-horizontal: 20px;
`

const CategoryRow = styled.View`
    width: 100%;
    flex-direction: row;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap;
`

const Row = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`