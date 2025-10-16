import { SafeAreaViewContainer } from '@/constants/GlobalStyles'
import { ArrowLeft } from 'lucide-react-native'
import { StatusBar, Text } from 'react-native'
import { styled } from 'styled-components/native'


const Step1 = () => {
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScreenContainer> 
                    <TopSection>
                        <ArrowLeft size={30} /> 
                    </TopSection>
                    <Content>

                    </Content>
                    <BottomSection>
                        <Previous>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: 400,
                                    textDecorationLine: 'underline'
                                }}
                            >back</Text>
                        </Previous>
                        <Next>
                            <Text>Next</Text>
                        </Next>
                    </BottomSection>
                </ScreenContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default Step1

const TopSection = styled.View`
    justify-content: flex-start;
`
const BottomSection = styled.View`
    flex-direction: row;
    justify-content: flex-end;
`
const ScreenContainer = styled.View`
    flex: 1;
    background-color: red;
    margin-top: 100px;
    margin-bottom: 40px;
    margin-horizontal: 30px;
`
const Content = styled.ScrollView`

`
const Previous = styled.Pressable`

`
const Next = styled.Pressable`
`
