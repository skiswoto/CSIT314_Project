import { SafeAreaViewContainer } from '@/constants/GlobalStyles';
import { useCreateListingStore } from "@/global/createListingStore";
import { supabase } from '@/libs/supabase';
import { linkDocumentsToListing } from '@/services/documents';
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
    const router = useRouter()
    
    const stepsArray = ([
        '/(create-request)/(steps)/step1', 
        '/(create-request)/(steps)/step2', 
        '/(create-request)/(steps)/step3',
        '/(create-request)/(steps)/step4'
    ] as const)
    
    const handleNextStep = async () => {
        const lastIndex = stepsArray.length - 1
        
        if (currentStep >= lastIndex) {
            try {
                // Create the listing first
                const { data: listing, error: listingError } = await supabase
                    .from('Listings')
                    .insert({
                        description: description,
                        category: category,
                        urgency: urgency,
                        listing_date: date?.toISOString().split('T')[0],
                        start_time: time?.toISOString(),
                        duration: duration?.toISOString(),
                        street_address: streetAddress,
                        unit_level: unitLevel,
                        building_name: buildingName,
                        post_code: postCode,
                    })
                    .select()
                    .single()
                
                if (listingError) {
                    console.error('Listing creation error:', listingError)
                    Alert.alert('Error', 'Failed to create listing. Please try again.')
                    return
                }

                if (supportingDocuments && supportingDocuments.length > 0) {
                    const documentUrls = supportingDocuments
                        .map(doc => doc.url)
                        .filter(Boolean) as string[]
                    
                    if (documentUrls.length > 0 && listing?.id) {
                        const linked = await linkDocumentsToListing(documentUrls, listing.id)
                        
                        if (!linked) {
                            console.warn('Some documents failed to link to listing')
                            // Don't block the flow, just warn
                        }
                    }
                }
                
                Alert.alert('Success', 'Listing created successfully!')
                router.push('/(tabs)/home')
                cancelProgress()
                
            } catch (e) {
                console.error('Error creating listing:', e)
                Alert.alert('Error', 'Failed to create listing. Please try again.')
            }
            return
        }
        
        const nextIndex = Math.min(currentStep + 1, lastIndex)
        nextStep()
        router.push(stepsArray[nextIndex])
    }
    
    const handlePreviousStep = () => {
        if (currentStep <= 0) return
        previousStep()
        router.back()
    }
    
    const handleCancelCreateListing = () => {
        cancelProgress()
        router.replace('/(tabs)/home')
    }
    
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
                            <NextText>Next</NextText>
                        </Next>
                    </BottomSection>
                </ScreenContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default CreateRequestFormTemplate

// Styled components remain the same
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