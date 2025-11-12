import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, FileText, Heart, MapPin, Star, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { styled } from 'styled-components/native';
import { hasPermission } from '../../config/permissions';
import { SafeAreaViewContainer } from '../../constants/GlobalStyles';
import { supabase } from '../../libs/supabase';
import { sendListingStatusEmail } from '../../services/emailNotifications';
import { acceptListing, completeListing } from '../../services/listings';
import { getAverageRating, getRatingByListingId } from '../../services/ratings';
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
    const isAccepted = status === 'accepted';
    const [isAccepting, setIsAccepting] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(isAccepted || isCompleted);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showDocuments, setShowDocuments] = useState(false);
    const [documentCount, setDocumentCount] = useState(0);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [userRole, setUserRole] = useState<string>('');
    const [existingRating, setExistingRating] = useState<number | null>(null);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [ratingCount, setRatingCount] = useState<number>(0);
    const [isLoadingRating, setIsLoadingRating] = useState(true);
    const [isCreator, setIsCreator] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    
    useEffect(() => {
        loadDocumentCount();
        loadUserRoleAndRating();
        loadRatings();
    }, [listingId]);
    
    // Timer effect for completing listing after 15 seconds
    useEffect(() => {
        if (countdown === null) return;
        
        if (countdown === 0) {
            handleCompleteListing();
            return;
        }
        
        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [countdown]);
    
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
            
            setCurrentUserId(user.id);
            
            const { data: profile } = await supabase
                .from('Profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            
            const role = profile?.role?.toLowerCase() || '';
            setUserRole(role);
            
            // Check if current user is the listing creator
            const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
            
            if (normalizedListingId) {
                const { data: listing } = await supabase
                    .from('Listings')
                    .select('created_by')
                    .eq('id', normalizedListingId)
                    .single();
                
                if (listing && listing.created_by === user.id) {
                    setIsCreator(true);
                }
            }
            
            if (role === 'csr_rep' || role === 'platform_manager') {
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
    
    const loadRatings = async () => {
        try {
            setIsLoadingRating(true);
            const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
            
            if (!normalizedListingId) {
                setIsLoadingRating(false);
                return;
            }
            
            // Get average rating
            const { average, count } = await getAverageRating(Number(normalizedListingId));
            setAverageRating(average || 0);
            setRatingCount(count || 0);
            
            // Check if current user has rated
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userRating } = await getRatingByListingId(
                    Number(normalizedListingId),
                    user.id
                );
                if (userRating) {
                    setExistingRating(userRating.rating);
                }
            }
        } catch (error) {
            console.error('Error loading ratings:', error);
        } finally {
            setIsLoadingRating(false);
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
        
        // Handle timezone properly
        if (timeStr.includes('T')) {
            // It's an ISO datetime string
            let timestampString = timeStr;
            
            // Clean up and ensure it's treated as UTC
            timestampString = timestampString.replace(' ', 'T'); // Handle space
            timestampString = timestampString.replace(/([+-]\d{2}):?(\d{2})?$/, ''); // Remove timezone offset
            
            // Add Z if not present (tells JavaScript it's UTC)
            if (!timestampString.endsWith('Z')) {
                timestampString = timestampString.split('.')[0] + 'Z'; // Remove microseconds, add Z
            }
            
            const date = new Date(timestampString);
            
            // getHours() and getMinutes() automatically return LOCAL time
            const hours = date.getHours(); // This is already in local timezone (SGT)
            const minutes = date.getMinutes().toString().padStart(2, '0');
            
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            
            console.log('🕐 Formatting time:', timeStr, '→', `${displayHour}:${minutes} ${ampm}`);
            
            return `${displayHour}:${minutes} ${ampm}`;
        } else {
            // It's a simple time string like "10:30:00"
            // ⚠️ Treat this as UTC and convert to local
            const timeParts = timeStr.split(':');
            const utcHours = parseInt(timeParts[0], 10);
            const utcMinutes = parseInt(timeParts[1], 10);
            
            // Create a UTC date for today with this time
            const now = new Date();
            const utcDate = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                utcHours,
                utcMinutes,
                0
            ));
            
            // Convert to local time
            const localHours = utcDate.getHours(); // Automatically in local timezone
            const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
            
            const ampm = localHours >= 12 ? 'PM' : 'AM';
            const displayHour = localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours;
            
            console.log('🕐 Formatting simple time:', timeStr, '(UTC) →', `${displayHour}:${localMinutes} ${ampm}`, '(Local)');
            
            return `${displayHour}:${localMinutes} ${ampm}`;
        }
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
            
            // Update listing status to 'accepted'
            await acceptListing(normalizedListingId);
            
            // Send acceptance email
            await sendListingStatusEmail({
                listingId: normalizedListingId,
                category: (Array.isArray(category) ? category[0] : category) || 'N/A',
                description: (Array.isArray(description) ? description[0] : description) || 'N/A',
                address: (Array.isArray(address) ? address[0] : address) || 'N/A',
                startTime: (Array.isArray(startTime) ? startTime[0] : startTime) || 'N/A',
                duration: (Array.isArray(duration) ? duration[0] : duration) || 'N/A',
                emailType: 'accepted',
                recipientEmail: 'monasterypin@gmail.com'
            });
            
            // Disable button and start countdown
            setIsButtonDisabled(true);
            setCountdown(15);
            
            Alert.alert(
                'Success',
                'Listing accepted! Email sent to monasterypin@gmail.com\nListing will be completed in 15 seconds.',
                [{ text: 'OK' }]
            );
            
        } catch (error) {
            console.error('Error accepting listing:', error);
            Alert.alert('Error', 'Failed to accept listing. Please try again.');
            setIsButtonDisabled(false);
        } finally {
            setIsAccepting(false);
        }
    };
    
    const handleCompleteListing = async () => {
        try {
            const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
            
            if (!normalizedListingId) {
                console.error('Invalid listing ID');
                return;
            }
            
            // Update listing status to 'completed'
            await completeListing(normalizedListingId);
            
            // Send completion email
            await sendListingStatusEmail({
                listingId: normalizedListingId,
                category: (Array.isArray(category) ? category[0] : category) || 'N/A',
                description: (Array.isArray(description) ? description[0] : description) || 'N/A',
                address: (Array.isArray(address) ? address[0] : address) || 'N/A',
                startTime: (Array.isArray(startTime) ? startTime[0] : startTime) || 'N/A',
                duration: (Array.isArray(duration) ? duration[0] : duration) || 'N/A',
                emailType: 'completed',
                recipientEmail: 'monasterypin@gmail.com'
            });
            
            Alert.alert(
                'Completed',
                'Listing has been marked as completed! Email sent to monasterypin@gmail.com',
                [{ text: 'OK', onPress: () => router.back() }]
            );
            
        } catch (error) {
            console.error('Error completing listing:', error);
            Alert.alert('Error', 'Failed to complete listing.');
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
                    
                    {/* Show View Documents button only to CSR, PIN (own request) */}
                    {((userRole === 'csr_rep') || (userRole === 'pin' && documentCount > 0)) && (
                        <DocumentButton onPress={() => setShowDocuments(true)}>
                            <FileText size={20} color="#4F46E5" />
                            <DocumentButtonText>
                                {isLoadingDocs 
                                    ? 'Loading documents...' 
                                    : `View Documents (${documentCount})`
                                }
                            </DocumentButtonText>
                        </DocumentButton>
                    )}
                    
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
                    
                    {/* Rating Display Section - Show to everyone on completed listings */}
                    {isCompleted && !isLoadingRating && (
                        <RatingDisplaySection>
                            <RatingHeader>
                                <Star size={20} color="#FBBF24" fill="#FBBF24" />
                                <RatingHeaderText>Service Rating</RatingHeaderText>
                            </RatingHeader>
                            
                            {ratingCount > 0 ? (
                                <>
                                    <RatingScoreRow>
                                        <RatingScore>{averageRating.toFixed(1)}</RatingScore>
                                        <RatingOutOf>/ 5.0</RatingOutOf>
                                    </RatingScoreRow>
                                    
                                    <StarsDisplayRow>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={24}
                                                color="#FBBF24"
                                                fill={star <= Math.round(averageRating) ? '#FBBF24' : 'transparent'}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </StarsDisplayRow>
                                    
                                    <RatingCountText>
                                        Rated by service requester
                                    </RatingCountText>
                                    
                                    {isCreator && (
                                        <UserRatingBadge>
                                            <Star size={16} color="#2B61A6" fill="#2B61A6" />
                                            <UserRatingText>You rated: {averageRating.toFixed(1)}/5</UserRatingText>
                                        </UserRatingBadge>
                                    )}
                                </>
                            ) : (
                                <NoRatingYetText>
                                    {isCreator 
                                        ? 'You haven\'t rated this service yet.' 
                                        : 'Service requester hasn\'t rated yet.'}
                                </NoRatingYetText>
                            )}
                        </RatingDisplaySection>
                    )}
                    
                    {/* Apply Button - Only show to CSR, not to PIN users */}
                    {!isCompleted && hasPermission(userRole, 'canApplyListing') && (
                        <ApplyButton 
                            disabled={isButtonDisabled || isAccepting}
                            onPress={handleAcceptListing}
                            style={{ 
                                backgroundColor: isButtonDisabled ? '#9CA3AF' : '#111827',
                                opacity: isButtonDisabled ? 0.6 : 1 
                            }}
                        >
                            <ApplyButtonText>
                                {isAccepting 
                                    ? 'Processing...' 
                                    : countdown !== null
                                        ? `Accepted - Completing in ${countdown}s`
                                        : isAccepted
                                            ? 'Already Accepted'
                                            : 'Apply now'
                                }
                            </ApplyButtonText>
                        </ApplyButton>
                    )}
                    
                    {/* Service Completed Badge - Show to everyone on completed listings */}
                    {isCompleted && (
                        <CompletedBadge>
                            <CheckCircle size={20} color="#16A34A" />
                            <CompletedBadgeText>Service Completed</CompletedBadgeText>
                        </CompletedBadge>
                    )}
                    
                    {isCompleted && (
                        <>
                            {/* Show Rate Service button only to the listing creator (PIN user) */}
                            {isCreator && userRole === 'pin' && (
                                <RateServiceButton onPress={handleRateService}>
                                    <Star size={20} color="#FBBF24" fill="#FBBF24" />
                                    <RateServiceButtonText>
                                        {ratingCount > 0 ? 'View Your Rating' : 'Rate Service'}
                                    </RateServiceButtonText>
                                </RateServiceButton>
                            )}
                            
                            {/* Old rating display for CSR/Platform Manager - Remove or keep for reference */}
                            {(userRole === 'csr_rep' || userRole === 'platform_manager') && !isCreator && (
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

// New Rating Display Components
const RatingDisplaySection = styled.View`
    background-color: #FFFBEB;
    border-radius: 16px;
    padding: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
    border-width: 2px;
    border-color: #FCD34D;
`;

const RatingHeader = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
`;

const RatingHeaderText = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #92400E;
`;

const RatingScoreRow = styled.View`
    flex-direction: row;
    align-items: baseline;
    justify-content: center;
    margin-bottom: 12px;
`;

const RatingScore = styled.Text`
    font-size: 48px;
    font-weight: 700;
    color: #92400E;
`;

const RatingOutOf = styled.Text`
    font-size: 24px;
    font-weight: 500;
    color: #92400E;
    margin-left: 4px;
`;

const StarsDisplayRow = styled.View`
    flex-direction: row;
    justify-content: center;
    gap: 4px;
    margin-bottom: 12px;
`;

const RatingCountText = styled.Text`
    text-align: center;
    font-size: 14px;
    color: #92400E;
    margin-bottom: 12px;
`;

const UserRatingBadge = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background-color: #DBEAFE;
    padding: 8px 16px;
    border-radius: 20px;
    align-self: center;
    margin-top: 8px;
`;

const UserRatingText = styled.Text`
    font-size: 14px;
    font-weight: 600;
    color: #2B61A6;
`;

const NoRatingYetText = styled.Text`
    text-align: center;
    font-size: 14px;
    color: #92400E;
    font-style: italic;
    padding: 20px 0;
`;

const CompletedBadge = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #DCFCE7;
    padding: 16px;
    border-radius: 24px;
    border-width: 2px;
    border-color: #16A34A;
`;

const CompletedBadgeText = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #16A34A;
`;