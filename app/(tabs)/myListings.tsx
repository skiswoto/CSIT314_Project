import { StatusBar } from 'react-native'
import { H1, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles'


const MyListings = () => {
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScrollContainer>
                    <H1>my listings</H1>
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default MyListings