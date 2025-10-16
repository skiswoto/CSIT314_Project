import { useRouter } from 'expo-router'
import { SquarePen } from 'lucide-react-native'
import { StatusBar } from 'react-native'
import { styled } from 'styled-components/native'
import { H1, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles'

const Home = () => {
    const router = useRouter()
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScrollContainer>
                    <H1>home</H1>
                    <CreateListingContainer>
                        <SquarePen size = {26} onPress={()=> router.navigate('(create-request)/(steps)/step1' as any)}/>
                    </CreateListingContainer>
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default Home

const CreateListingContainer = styled.TouchableOpacity`
    border-radius: 50px;
    border-width: 1px;
    border-color: #D1D1D1;
    position: absolute;
    align-self: flex-end;
    top: 580px;
    right: 2px;
    padding: 10px;
    shadow-color: #000000;
    shadow-offset: 0px 0px;
    shadow-opacity: 0.4;
    shadow-radius: 4px;
`
