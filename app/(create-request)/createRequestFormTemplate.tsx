import { SafeAreaViewContainer } from '@/constants/GlobalStyles';
import { useCreateListingStore } from "@/global/createListingStore";
import { userAuthStore } from '@/global/userAuthStore';
import { supabase } from '@/libs/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Alert, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';

type CreateListingFormTemplateProps = { 
    children?: React.ReactNode,
}

const CreateRequestFormTemplate = ({ children }: CreateListingFormTemplateProps) => {
    const {
        description,
        category,
        urgency,
        date,
        time,
        duration,
        streetAddress,
        unitLevel,
        buildingName,
        postCode,
        supportingDocuments
    } = useCreateListingStore()
    
    const { currentStep, nextStep, previousStep, cancelProgress } = useCreateListingStore()
    const { user } = userAuthStore();
    const router = useRouter()
    const queryClient = useQueryClient();
    
    const stepsArray = ([
        '/(create-request)/(steps)/step1', 
        '/(create-request)/(steps)/step2', 
        '/(create-request)/(steps)/step3',
        '/(create-request)/(steps)/step4'
    ] as const)

    const isLastStep = currentStep >= stepsArray.length - 1;
    
    const handleNextStep = async () => {
        const lastIndex = stepsArray.length - 1;
        
        if (currentStep >= lastIndex) {
            try {
                const durationInterval = duration 
                    ? (() => {
                        const hours = duration.getHours();
                        const minutes = duration.getMinutes();
                        const totalMinutes = hours * 60 + minutes;
                        return totalMinutes > 0 ? `${totalMinutes} minutes` : null;
                        })()
                    : null;
                
                // Combine date and time in local timezone, then convert to UTC
                let combinedStartTime = null;
                if (date && time) {
                    // Create a new date using the selected date and time
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    const day = date.getDate();
                    const hours = time.getHours();
                    const minutes = time.getMinutes();
                    const seconds = time.getSeconds();
                    
                    // Create in local timezone, then convert to ISO (UTC)
                    const localDateTime = new Date(year, month, day, hours, minutes, seconds);
                    combinedStartTime = localDateTime.toISOString();
                    
                    console.log('🕐 Local date:', date.toLocaleDateString());
                    console.log('🕐 Local time:', time.toLocaleTimeString());
                    console.log('🕐 Combined local datetime:', localDateTime.toLocaleString());
                    console.log('🕐 UTC timestamp to save:', combinedStartTime);
                }
                
                // Prepare listing data
                const listingData = {
                    description: description || '',
                    category: category || '',
                    urgency: urgency || '',
                    listing_date: date?.toISOString().split('T')[0] || '',
                    start_time: combinedStartTime,
                    duration: durationInterval,
                    street_address: streetAddress || '',
                    unit_level: unitLevel || '',
                    building_name: buildingName || '',
                    post_code: postCode || '',
                    created_by: user?.id,
                    status: 'available'
                };
                
                console.log('Creating listing with data:', listingData);
                
                // Create the listing
                const { data: listing, error: listingError } = await supabase
                    .from('Listings')
                    .insert(listingData)
                    .select()
                    .single();
            
                if (listingError) {
                    throw listingError;
                }
                
                // Link documents to the listing
                if (supportingDocuments && supportingDocuments.length > 0) {
                    const documentUrls = supportingDocuments
                        .map(doc => doc.url)
                        .filter((url): url is string => !!url);
                    
                    if (documentUrls.length > 0) {
                        const { error: updateError } = await supabase
                            .from('supporting_documents')
                            .update({ listing_id: listing.id })
                            .in('document_url', documentUrls);
                        
                        if (updateError) {
                            console.error('Error linking documents:', updateError);
                        }
                    }
                }
                
                // Invalidate cache to refresh home tab
                console.log('Invalidating listing queries...');
                await queryClient.invalidateQueries({ 
                    queryKey: ['listings']
                });
                
                Alert.alert('Success', 'Listing created successfully!');
                router.push('/(tabs)/home');
                cancelProgress();
                
            } catch (e: any) {
                console.error('Error creating listing:', e);
                Alert.alert('Error', e.message || 'Failed to create listing. Please try again.');
            }
            return;
        }
        
        const nextIndex = Math.min(currentStep + 1, lastIndex);
        nextStep();
        router.push(stepsArray[nextIndex]);
    };
    
    const handlePreviousStep = () => {
        if (currentStep <= 0) return;
        previousStep();
        router.back();
    };
    
    const handleCancelCreateListing = () => {
        cancelProgress();
        router.replace('/(tabs)/home');
    };
    
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScreenContainer> 
                    <TopSection onPress={handleCancelCreateListing}>
                        <X size={30} /> 
                    </TopSection>
                    <Content>
                        {children}
                    </Content>
                    <BottomSection>
                        <Previous onPress={handlePreviousStep}>
                            <PreviousText>back</PreviousText>
                        </Previous>
                        <Next onPress={handleNextStep}>
                            <NextText>{isLastStep ? 'Submit' : 'Next'}</NextText>
                        </Next>
                    </BottomSection>
                </ScreenContainer>
            </SafeAreaViewContainer>
        </>
    );
};

export default CreateRequestFormTemplate;

const TopSection = styled.Pressable`
    justify-content: flex-start;
    width: 20%;
`

const BottomSection = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`

const ScreenContainer = styled.View`
    flex: 1;
    padding-top: 80px;
    padding-bottom: 50px;
    padding-horizontal: 26px;
    background-color: #FCFCFC;
`

const Content = styled.ScrollView`
    padding-vertical: 40px;
`

const Previous = styled.Pressable`
    padding-right: 20px;
`

const Next = styled.Pressable`
    background-color: #000000;
    padding-horizontal: 18px;
    padding-vertical: 10px;
    border-radius: 10px;
    overflow: hidden;
`

const PreviousText = styled.Text`
    font-weight: 400;
    font-size: 18px;
    text-decoration-line: underline;
`

const NextText = styled(PreviousText)`
    text-decoration-line: none;
    color: #ffffff;
`