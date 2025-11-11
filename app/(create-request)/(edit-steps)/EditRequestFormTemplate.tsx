import { SafeAreaViewContainer } from '@/constants/GlobalStyles';
import { useCreateListingStore } from "@/global/createListingStore";
import { userAuthStore } from '@/global/userAuthStore';
import { supabase } from '@/libs/supabase';
import { sendListingStatusEmail } from '@/services/emailNotifications';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Alert, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';

type EditRequestFormTemplateProps = { 
    children?: React.ReactNode;
    listingId: string;
    originalData: any;
}

const EditRequestFormTemplate = ({ children, listingId, originalData }: EditRequestFormTemplateProps) => {
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
    } = useCreateListingStore();
    
    const { currentStep, nextStep, previousStep, cancelProgress } = useCreateListingStore();
    const { user } = userAuthStore();
    const router = useRouter();
    
    const stepsArray = ([
        '/(create-request)/(edit-steps)/editStep1', 
        '/(create-request)/(edit-steps)/editStep2', 
        '/(create-request)/(edit-steps)/editStep3',
        '/(create-request)/(edit-steps)/editStep4'
    ] as const);

    const isLastStep = currentStep >= stepsArray.length - 1;
    
    // Track what changed
    const getChanges = (original: any, updated: any) => {
        const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
        
        if (original.description !== updated.description) {
            changes.push({ 
                field: 'Description', 
                oldValue: original.description || 'N/A', 
                newValue: updated.description || 'N/A' 
            });
        }
        if (original.category !== updated.category) {
            changes.push({ 
                field: 'Category', 
                oldValue: original.category || 'N/A', 
                newValue: updated.category || 'N/A' 
            });
        }
        if (original.urgency !== updated.urgency) {
            changes.push({ 
                field: 'Urgency', 
                oldValue: original.urgency || 'N/A', 
                newValue: updated.urgency || 'N/A' 
            });
        }
        if (original.street_address !== updated.street_address) {
            changes.push({ 
                field: 'Address', 
                oldValue: original.street_address || 'N/A', 
                newValue: updated.street_address || 'N/A' 
            });
        }
        if (original.start_time !== updated.start_time) {
            changes.push({ 
                field: 'Start Time', 
                oldValue: original.start_time || 'N/A', 
                newValue: updated.start_time || 'N/A' 
            });
        }
        if (original.duration !== updated.duration) {
            changes.push({ 
                field: 'Duration', 
                oldValue: original.duration || 'N/A', 
                newValue: updated.duration || 'N/A' 
            });
        }
        
        return changes;
    };
    
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
            
            const updatedListingData = {
                description: description || '',
                category: category || '',
                urgency: urgency || '',
                listing_date: date?.toISOString().split('T')[0] || '',
                start_time: time?.toTimeString().split(' ')[0] || '',
                duration: durationInterval,
                street_address: streetAddress || '',
                unit_level: unitLevel || '',
                building_name: buildingName || '',
                post_code: postCode || '',
            };
            
            console.log('Updating listing ID:', listingId);

            const { data: updatedListing, error: updateError } = await supabase
                .from('Listings')
                .update(updatedListingData)
                .eq('id', Number(listingId))
                .select()
                .single();
        
            if (updateError) throw updateError;
            
            const changes = getChanges(originalData, updatedListingData);

            if (changes.length > 0) {
                await sendListingStatusEmail({
                    listingId: String(listingId),
                    category: updatedListingData.category,
                    description: updatedListingData.description,
                    address: updatedListingData.street_address,
                    startTime: updatedListingData.start_time,
                    duration: updatedListingData.duration || 'N/A',
                    emailType: 'edited',
                    recipientEmail: 'monasterypin@gmail.com',
                    changes: changes
                });
            }
            
            Alert.alert('Success', 'Listing updated successfully!');
            router.push('/(tabs)/home');
            cancelProgress();
        } catch (e: any) {
            console.error('Error updating listing:', e);
            Alert.alert('Error', e.message || 'Failed to update listing. Please try again.');
        }
        return;
    }

    // ✅ keep listingData when going to next step
    const nextIndex = Math.min(currentStep + 1, lastIndex);
    nextStep();
    router.push({
        pathname: stepsArray[nextIndex],
        params: { listingData: JSON.stringify(originalData) },
    });
};

    
    const handlePreviousStep = () => {
        if (currentStep <= 0) return;
        previousStep();
        router.push({
            pathname: stepsArray[currentStep - 1],
            params: { listingData: JSON.stringify(originalData) },
        });
    };

    
    const handleCancelEdit = () => {
        cancelProgress();
        router.replace('/(tabs)/home');
    };
    
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScreenContainer> 
                    <TopSection onPress={handleCancelEdit}>
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
                            <NextText>{isLastStep ? 'Update' : 'Next'}</NextText>
                        </Next>
                    </BottomSection>
                </ScreenContainer>
            </SafeAreaViewContainer>
        </>
    );
};

export default EditRequestFormTemplate;

const TopSection = styled.Pressable`
    justify-content: flex-start;
    width: 20%;
`;

const BottomSection = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`;

const ScreenContainer = styled.View`
    flex: 1;
    padding-top: 80px;
    padding-bottom: 50px;
    padding-horizontal: 26px;
    background-color: #FCFCFC;
`;

const Content = styled.ScrollView`
    padding-vertical: 40px;
`;

const Previous = styled.Pressable`
    padding-right: 20px;
`;

const Next = styled.Pressable`
    background-color: #000000;
    padding-horizontal: 18px;
    padding-vertical: 10px;
    border-radius: 10px;
    overflow: hidden;
`;

const PreviousText = styled.Text`
    font-weight: 400;
    font-size: 18px;
    text-decoration-line: underline;
`;

const NextText = styled(PreviousText)`
    text-decoration-line: none;
    color: #ffffff;
`;