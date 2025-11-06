import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, Heart, MapPin, TrendingUp } from 'lucide-react-native';
import { useState } from 'react'; // Add if not already there
import { Alert, Image, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer } from '../../constants/GlobalStyles';
import { sendListingAcceptedEmail } from '../../services/emailNotifications';
import { acceptListing } from '../../services/listings';

const SampleListing = () => {
    const router = useRouter()
    const params = useLocalSearchParams()
    
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
    
    const isCompleted = status === 'completed'
    
    console.log('Listing Detail Params:', params)
    
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

    const formatTime = (time: string | string[] | undefined) => {
        if (!time) return 'Not specified';
        const timeStr = Array.isArray(time) ? time[0] : time;
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    const handleExportData = async () => {
        // Create CSV-like data
        const data = `
Service Report
--------------
Category: ${category}
Description: ${description}
Address: ${address}
Start Time: ${formatTime(startTime)}
Duration: ${duration} hours
Urgency: ${urgency}
Status: ${status}
        `.trim();

        Alert.alert('Export Data', data, [
            { text: 'OK' }
        ]);
    }

    const [isAccepting, setIsAccepting] = useState(false)

    const handleAcceptListing = async () => {
    try {
        setIsAccepting(true)
        
        // Normalize the listing ID
        const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId
        
        if (!normalizedListingId) {
        Alert.alert('Error', 'Invalid listing ID')
        return
        }
        
        console.log('🚀 Accepting listing:', normalizedListingId)
        
        // Update database
        await acceptListing(normalizedListingId)
        
        // Send email
        await sendListingAcceptedEmail({
        listingId: normalizedListingId,
        category: (Array.isArray(category) ? category[0] : category) || 'N/A',
        description: (Array.isArray(description) ? description[0] : description) || 'N/A',
        address: (Array.isArray(address) ? address[0] : address) || 'N/A',
        startTime: (Array.isArray(startTime) ? startTime[0] : startTime) || 'N/A',
        duration: (Array.isArray(duration) ? duration[0] : duration) || 'N/A'
        })
        
        Alert.alert(
        '✅ Success!',
        'Listing accepted! Email sent to kiswotoshawn@gmail.com',
        [{ text: 'OK', onPress: () => router.back() }]
        )
        
    } catch (error) {
        console.error('❌ Error:', error)
        Alert.alert('Error', 'Failed to accept listing. Please try again.')
    } finally {
        setIsAccepting(false)
    }
    }

    return (
        <SafeAreaViewContainer>
            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >   
                <ImageBackground
                    style={styles.backgroundImage}
                    resizeMode='cover'
                    source={{ uri: 'https://images.unsplash.com/photo-1755018237843-2f47f470cf11?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1336' }}
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
                            <Category backgroundColor={isCompleted ? '#DCFCE7' : '#F3F4F6'}>
                                <CategoryText color={isCompleted ? '#16A34A' : '#6B7280'}>
                                    {Array.isArray(status) ? status[0] : status}
                                </CategoryText>
                            </Category>
                        )}
                    </CategoryRow>

                    <ListingTitle>
                        {category || 'Service Request'}
                    </ListingTitle>

                    <ListingDescription>
                        {description || 'No description provided.'}
                    </ListingDescription>

                    {/* INSIGHTS SECTION FOR COMPLETED LISTINGS */}
                    {isCompleted && (
                        <InsightsSection>
                            <SectionHeader>
                                <TrendingUp size={20} color="#111827" />
                                <SectionTitle>Service Insights</SectionTitle>
                            </SectionHeader>
                            
                            <InsightsGrid>
                                <InsightCard>
                                    <InsightIcon>
                                        <CheckCircle size={24} color="#16A34A" />
                                    </InsightIcon>
                                    <InsightLabel>Status</InsightLabel>
                                    <InsightValue>Completed</InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightIcon>
                                        <Clock size={24} color="#2563EB" />
                                    </InsightIcon>
                                    <InsightLabel>Duration</InsightLabel>
                                    <InsightValue>
                                        {duration ? `${Array.isArray(duration) ? duration[0] : duration} hrs` : 'N/A'}
                                    </InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightIcon>
                                        <Calendar size={24} color="#7C3AED" />
                                    </InsightIcon>
                                    <InsightLabel>Start Time</InsightLabel>
                                    <InsightValue>{formatTime(startTime)}</InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightIcon>
                                        <MapPin size={24} color="#DC2626" />
                                    </InsightIcon>
                                    <InsightLabel>Location</InsightLabel>
                                    <InsightValue numberOfLines={2}>
                                        {address ? (Array.isArray(address) ? address[0] : address).split(',')[0] : 'N/A'}
                                    </InsightValue>
                                </InsightCard>
                            </InsightsGrid>

                            <ExportButton onPress={handleExportData}>
                                <Download size={20} color="#ffffff" />
                                <ExportButtonText>Export Service Data</ExportButtonText>
                            </ExportButton>
                        </InsightsSection>
                    )}

                    {/* REGULAR DETAILS SECTION FOR AVAILABLE LISTINGS */}
                    {!isCompleted && (
                        <DetailsSection>
                            {address && (
                                <DetailRow>
                                    <MapPin size={18} color="#6B7280" />
                                    <DetailText>{Array.isArray(address) ? address[0] : address}</DetailText>
                                </DetailRow>
                            )}

                            {startTime && (
                                <DetailRow>
                                    <Clock size={18} color="#6B7280" />
                                    <DetailText>Starts at {formatTime(startTime)}</DetailText>
                                </DetailRow>
                            )}

                            {duration && (
                                <DetailRow>
                                    <Calendar size={18} color="#6B7280" />
                                    <DetailText>
                                        Duration: {Array.isArray(duration) ? duration[0] : duration} hour(s)
                                    </DetailText>
                                </DetailRow>
                            )}
                        </DetailsSection>
                    )}

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

                    <ApplyButton 
                        disabled={isCompleted || isAccepting}
                        onPress={handleAcceptListing}
                    >
                        <ApplyButtonText>
                            {isAccepting 
                                ? 'Processing...' 
                                : isCompleted 
                                    ? 'Service Completed' 
                                    : 'Apply now'
                            }
                        </ApplyButtonText>
                    </ApplyButton>
                </Card>
            </ScrollView>
        </SafeAreaViewContainer>
    )
}

export default SampleListing

const styles = StyleSheet.create({
    backgroundImage: {
        width: '100%',
        height: 400,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    }
})

const Card = styled.View`
    background-color: #ffffff;
    width: 100%;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    padding-horizontal: 20px;
    padding-vertical: 20px;
    margin-top: -40px;
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

const InsightsSection = styled.View`
    background-color: #F9FAFB;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
`

const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
`

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #111827;
`

const InsightsGrid = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
`

const InsightCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 16px;
    width: 48%;
    border-width: 1px;
    border-color: #E5E7EB;
    align-items: center;
`

const InsightIcon = styled.View`
    margin-bottom: 8px;
`

const InsightLabel = styled.Text`
    font-size: 12px;
    color: #6B7280;
    font-weight: 500;
    margin-bottom: 4px;
    text-align: center;
`

const InsightValue = styled.Text`
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    text-align: center;
`

const ExportButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #2563EB;
    padding: 14px;
    border-radius: 12px;
`

const ExportButtonText = styled.Text`
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
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