import { StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { H1, ScrollContainer } from '../../constants/GlobalStyles'


const Home = () => {
    return (
        <>
            <StatusBar />
            <SafeAreaView>
                <ScrollContainer>
                    <H1>home</H1>
                </ScrollContainer>
            </SafeAreaView>
        </>

    )
}

export default Home