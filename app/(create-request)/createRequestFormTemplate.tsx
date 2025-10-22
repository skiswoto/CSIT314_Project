import { SafeAreaViewContainer } from '@/constants/GlobalStyles';
import { useCreateListingStore } from "@/global/createListingStore";
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { StatusBar } from 'react-native';
import { styled } from 'styled-components/native';


type CreateListingFormTemplateProps = { 
    children?: React.ReactNode,
}

const CreateRequestFormTemplate = ({ children }: CreateListingFormTemplateProps) => {
    const { currentStep, nextStep, previousStep, resetSteps, cancelProgress } = useCreateListingStore()
    const router = useRouter()
    const stepsArray = (['/(create-request)/(steps)/step1', '/(create-request)/(steps)/step2', '/(create-request)/(steps)/step3'] as const)

    const handleNextStep = () => {
        const lastIndex = stepsArray.length - 1
        if (currentStep >= lastIndex) {
            resetSteps()
            router.push('/(tabs)/home')
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