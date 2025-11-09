import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, FileText, Heart, MapPin, Star, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer } from '../../constants/GlobalStyles';
import { supabase } from '../../libs/supabase';
import { sendListingAcceptedEmail } from '../../services/emailNotifications';
import { acceptListing } from '../../services/listings';
import DocumentViewer from './viewDocs';

const SampleListing = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const {
        listingId,
        category,
        description,
        address,
        startTime,
        duration,
        urgency,
        status
    } = params;
    
    const isCompleted = status === 'completed';
    const [isAccepting, setIsAccepting] = useState(false);
    const [showDocuments, setShowDocuments] = useState(false);
    const [documentCount, setDocumentCount] = useState(0);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [userRole, setUserRole] = useState<string>('');
    const [existingRating, setExistingRating] = useState<number | null>(null);
    
    useEffect(() => {
        loadDocumentCount();
        loadUserRoleAndRating();
    }, [listingId]);
    
    const loadDocumentCount = async () => {
        try {
            setIsLoadingDocs(true);
            
            if (!listingId) {
                setIsLoadingDocs(false);
                return;
            }
            
            const { data, error } = await supabase
                .from('supporting_documents')
                .select('*')
                .eq('listing_id', listingId);
            
            if (error) {
                console.error('Error loading documents:', error);
                setIsLoadingDocs(false);
                return;
            }
            
            setDocumentCount(data?.length || 0);
        } catch (error) {
            console.error('Exception loading document count:', error);
        } finally {
            setIsLoadingDocs(false);
        }
    };
    
    const loadUserRoleAndRating = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            const { data: profile } = await supabase
                .from('Profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            
            const role = profile?.role?.toLowerCase() || '';
            setUserRole(role);
            
            if (role === 'csr_rep' || role === 'platform_manager') {
                const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
                
                const { data: ratingData } = await supabase
                    .from('service_ratings')
                    .select('rating')
                    .eq('listing_id', normalizedListingId)
                    .maybeSingle();
                
                if (ratingData) {
                    setExistingRating(ratingData.rating);
                }
            }
        } catch (error) {
            console.error('Error loading user role and rating:', error);
        }
    };
    
    const getUrgencyColor = (urgency: string | string[] | undefined) => {
        if (!urgency) return '#F3F4F6';
        const urgencyStr = Array.isArray(urgency) ? urgency[0] : urgency;
        switch (urgencyStr) {
            case 'High': return '#FEE2E2';
            case 'Medium': return '#FFEDD5';
            case 'Low': return '#DCFCE7';
            default: return '#F3F4F6';
        }
    };
    
    const getUrgencyTextColor = (urgency: string | string[] | undefined) => {
        if (!urgency) return '#6B7280';
        const urgencyStr = Array.isArray(urgency) ? urgency[0] : urgency;
        switch (urgencyStr) {
            case 'High': return '#B91C1C';
            case 'Medium': return '#C2410C';
            case 'Low': return '#166534';
            default: return '#6B7280';
        }
    };
    
    const formatTime = (time: string | string[] | undefined) => {
        if (!time) return 'Not specified';
        const timeStr = Array.isArray(time) ? time[0] : time;
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };
    
    const handleExportData = async () => {
        const data = `Service Report
--------------
Category: ${category}
Description: ${description}
Address: ${address}
Start Time: ${formatTime(startTime)}
Duration: ${duration} hours
Urgency: ${urgency}
Status: ${status}`.trim();
        
        Alert.alert('Export Data', data, [{ text: 'OK' }]);
    };
    
    const handleAcceptListing = async () => {
        try {
            setIsAccepting(true);
            const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
            
            if (!normalizedListingId) {
                Alert.alert('Error', 'Invalid listing ID');
                return;
            }
            
            await acceptListing(normalizedListingId);
            
            await sendListingAcceptedEmail({
                listingId: normalizedListingId,
                category: (Array.isArray(category) ? category[0] : category) || 'N/A',
                description: (Array.isArray(description) ? description[0] : description) || 'N/A',
                address: (Array.isArray(address) ? address[0] : address) || 'N/A',
                startTime: (Array.isArray(startTime) ? startTime[0] : startTime) || 'N/A',
                duration: (Array.isArray(duration) ? duration[0] : duration) || 'N/A'
            });
            
            Alert.alert(
                'Success',
                'Listing accepted! Email sent to kiswotoshawn@gmail.com',
                [{ text: 'OK', onPress: () => router.back() }]
            );
            
        } catch (error) {
            console.error('Error accepting listing:', error);
            Alert.alert('Error', 'Failed to accept listing. Please try again.');
        } finally {
            setIsAccepting(false);
        }
    };
    
    const handleRateService = () => {
        router.push({
            pathname: '/(manage-request)/rateService',
            params: {
                listingId: Array.isArray(listingId) ? listingId[0] : listingId,
                category: Array.isArray(category) ? category[0] : category,
            }
        });
    };
    
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
                    
                    <DocumentButton onPress={() => setShowDocuments(true)}>
                        <FileText size={20} color="#4F46E5" />
                        <DocumentButtonText>
                            {isLoadingDocs 
                                ? 'Loading documents...' 
                                : `View Documents (${documentCount})`
                            }
                        </DocumentButtonText>
                    </DocumentButton>
                    
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
                    
                    {isCompleted && (
                        <>
                            {userRole === 'pin' && (
                                <RateServiceButton onPress={handleRateService}>
                                    <Star size={20} color="#FBBF24" fill="#FBBF24" />
                                    <RateServiceButtonText>Rate Service</RateServiceButtonText>
                                </RateServiceButton>
                            )}
                            
                            {(userRole === 'csr_rep' || userRole === 'platform_manager') && (
                                <RatingDisplayContainer>
                                    <RatingLabel>Service Rating</RatingLabel>
                                    {existingRating ? (
                                        <StarsRow>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={28}
                                                    color="#FCD34D"
                                                    fill={star <= existingRating ? '#FCD34D' : 'transparent'}
                                                    strokeWidth={2}
                                                />
                                            ))}
                                            <RatingText>{existingRating}/5</RatingText>
                                        </StarsRow>
                                    ) : (
                                        <NoRatingText>Not yet rated</NoRatingText>
                                    )}
                                </RatingDisplayContainer>
                            )}
                        </>
                    )}
                </Card>
            </ScrollView>
            
            <DocumentViewer
                listingId={Array.isArray(listingId) ? listingId[0] : listingId || ''}
                visible={showDocuments}
                onClose={() => setShowDocuments(false)}
            />
        </SafeAreaViewContainer>
    );
};

export default SampleListing;

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
});

const Card = styled.View`
    background-color: #ffffff;
    width: 100%;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    padding-horizontal: 20px;
    padding-vertical: 20px;
    margin-top: -40px;
`;

const ApplyButton = styled.TouchableOpacity`
    background-color: #111827;
    border-radius: 24px;
    padding-horizontal: 14px;
    padding-vertical: 18px;
`;

const RateServiceButton = styled.TouchableOpacity`
    background-color: #FEF3C7;
    border-radius: 24px;
    padding-horizontal: 14px;
    padding-vertical: 18px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-width: 2px;
    border-color: #FBBF24;
    margin-top: 20px;
`;

const ChatButton = styled.Pressable`
    background-color: #F2F2F2;
    border-radius: 24px;
    padding-horizontal: 20px;
    padding-vertical: 14px;
`;

const DocumentButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #EEF2FF;
    padding: 14px;
    border-radius: 12px;
    margin-bottom: 20px;
    border-width: 1.5px;
    border-color: #4F46E5;
`;

const Category = styled.View<{ backgroundColor?: string }>`
    background-color: ${props => props.backgroundColor || '#F5F5F5'};
    border-radius: 20px;
    padding-horizontal: 12px;
    padding-vertical: 8px;
    margin-right: 8px;
`;

const IconContainer = styled.Pressable`
    background-color: #ffffff;
    border-radius: 50px;
    padding: 6px;
`;

const ApplyButtonText = styled.Text`
    font-weight: 600;
    font-size: 20px;
    color: #ffffff;
    align-self: center;
`;

const RateServiceButtonText = styled.Text`
    font-weight: 600;
    font-size: 20px;
    color: #92400E;
    align-self: center;
`;

const ChatButtonText = styled.Text`
    font-weight: 600;
    font-size: 14px;
    align-self: center;
`;

const DocumentButtonText = styled.Text`
    color: #4F46E5;
    font-size: 14px;
    font-weight: 600;
`;

const CategoryText = styled.Text<{ color?: string }>`
    font-weight: 600;
    font-size: 12px;
    align-self: center;
    color: ${props => props.color || '#6B7280'};
`;

const ListingTitle = styled.Text`
    font-weight: 600;
    font-size: 24px;
    margin-bottom: 14px;
`;

const ListingDescription = styled.Text`
    font-weight: 400;
    font-size: 14px;
    color: #636363;
    margin-bottom: 20px;
    line-height: 22px;
`;

const TopBar = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 70px;
    margin-horizontal: 20px;
`;

const CategoryRow = styled.View`
    width: 100%;
    flex-direction: row;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap;
`;

const Row = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const InsightsSection = styled.View`
    background-color: #F9FAFB;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
`;

const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #111827;
`;

const InsightsGrid = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
`;

const InsightCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 16px;
    width: 48%;
    border-width: 1px;
    border-color: #E5E7EB;
    align-items: center;
`;

const InsightIcon = styled.View`
    margin-bottom: 8px;
`;

const InsightLabel = styled.Text`
    font-size: 12px;
    color: #6B7280;
    font-weight: 500;
    margin-bottom: 4px;
    text-align: center;
`;

const InsightValue = styled.Text`
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    text-align: center;
`;

const ExportButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #2563EB;
    padding: 14px;
    border-radius: 12px;
`;

const ExportButtonText = styled.Text`
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
`;

const DetailsSection = styled.View`
    margin-bottom: 20px;
    gap: 12px;
`;

const DetailRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const DetailText = styled.Text`
    font-size: 14px;
    color: #6B7280;
    font-weight: 500;
    flex: 1;
`;

const RatingDisplayContainer = styled.View`
    background-color: #FEF3C7;
    border-radius: 16px;
    padding: 20px;
    margin-top: 20px;
    border-width: 2px;
    border-color: #FBBF24;
`;

const RatingLabel = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #92400E;
    margin-bottom: 12px;
`;

const StarsRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const RatingText = styled.Text`
    font-size: 20px;
    font-weight: 700;
    color: #92400E;
    margin-left: 8px;
`;

const NoRatingText = styled.Text`
    font-size: 14px;
    color: #92400E;
    font-style: italic;
`;