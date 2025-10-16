import { SafeAreaViewContainer } from '@/constants/GlobalStyles'
import { X } from 'lucide-react-native'
import { StatusBar } from 'react-native'
import { styled } from 'styled-components/native'

type CreateListingFormTemplateProps = { children?: React.ReactNode }


const CreateRequestFormTemplate = ({ children }: CreateListingFormTemplateProps) => {
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScreenContainer> 
                    <TopSection>
                        <X size={30} /> 
                    </TopSection>
                    <Content>
                        {children}
                    </Content>
                    <BottomSection>
                        <Previous>
                            <PreviousText>back</PreviousText>
                        </Previous>
                        <Next>
                            <NextText>Next</NextText>
                        </Next>
                    </BottomSection>
                </ScreenContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default CreateRequestFormTemplate

const TopSection = styled.View`
    justify-content: flex-start;
`
const BottomSection = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    
`
const ScreenContainer = styled.View`
    flex: 1;
    margin-top: 80px;
    margin-bottom: 50px;
    margin-horizontal: 26px;
    background-color: #EDEDED;
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