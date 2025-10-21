import { useRouter } from 'expo-router'
import { Heart, Menu, MoveRight, Search, SlidersHorizontal, SquarePen } from 'lucide-react-native'
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native'
import { styled } from 'styled-components/native'
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles'

const Home = () => {
    const router = useRouter()
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
                    <View
                        style={{ 
                            flex: 1, 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: "space-between", 
                            width: '40%',
                            marginBottom: 16,
                        }}
                    >
                        <Menu size={26} />
                    </View>
                    <Bar>
                        <SearchBar>
                            <Search />
                        </SearchBar>
                        <Filter>
                            <SlidersHorizontal />
                        </Filter>
                    </Bar>
                    <ListingCard
                        onPress={() => router.navigate('/(specific-listing)/sampleListing')}
                    >
                        <ImageBackground 
                            style={styles.image}
                            resizeMode="cover"
                            source={require('../../assets/samples/bobby.jpg')}
                        >
                            <Overlay>
                                <ListingTextColumn>
                                    <ListingTitle>Bobby, 60+</ListingTitle>
                                </ListingTextColumn>
                                <ListingIconColumn>
                                    <IconContainer>
                                        <Heart />
                                    </IconContainer>
                                    <IconContainer>
                                        <MoveRight />
                                    </IconContainer>
                                </ListingIconColumn>
                            </Overlay>
                        </ImageBackground>
                    </ListingCard>
                    <ListingCard>
                        <ImageBackground 
                            style={styles.image}
                            resizeMode="cover"
                            source={require('../../assets/samples/sally.jpg')}
                        >
                            <Overlay>
                                <ListingTextColumn>
                                    <ListingTitle>Bobby, 50+</ListingTitle>
                                </ListingTextColumn>
                                <ListingIconColumn>
                                    <IconContainer>
                                        <Heart />
                                    </IconContainer>
                                    <IconContainer>
                                        <MoveRight />
                                    </IconContainer>
                                </ListingIconColumn>
                            </Overlay>
                        </ImageBackground>
                    </ListingCard>
                </ScrollContainer>
                <CreateListingContainer>
                    <SquarePen 
                        size = {26} 
                        color={'#ffffff'}
                        onPress={()=> router.navigate('(create-request)/(steps)/step3' as any)}/>
                </CreateListingContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default Home

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 380,
        borderRadius: 20,
    }
})

const CreateListingContainer = styled.Pressable`
    border-radius: 50px;
    border-width: 1px;
    border-color: #D1D1D1;
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 10px;
    shadow-color: #000000;
    shadow-offset: 1px 1px;
    shadow-radius: 1px;
    shadow-opacity: 0.3;
    elevation: 1;
`
const Bar = styled.View`
    flex-direction: row;
    background-color: #E6E6E6;
    padding-horizontal: 4px;
    padding-vertical: 6px;
    border-radius: 30px;
    justify-content: space-evenly;
    align-items: center;
    shadow-color: #000000;
    shadow-offset: 0px 0.5px;
    shadow-radius: 1px;
    shadow-opacity: 0.3;
    elevation: 1;
    width: 99%;
    align-self: center;
    margin-bottom: 20px;
`
const SearchBar = styled.Pressable`
    padding-horizontal: 20px;
    padding-vertical: 12px;
    background-color: #ffffff;
    border-radius: 30px;
    overflow: hidden;
    justify-content: flex-start;
    width: 80%;
`
const Filter = styled.Pressable`
    padding-horizontal: 14px;
    padding-vertical: 12px;
    background-color: #ffffff;
    border-radius: 30px;
    overflow: hidden;
`
const ListingCard = styled.TouchableOpacity`
    height: 380px;
    width: 99%;
    border-radius: 30px;
    overflow: hidden;
    margin-vertical: 4px;
`
const Overlay = styled.View`
    flex: 1;
    flex-direction: row;
    padding-vertical: 16px;
    padding-horizontal: 20px;
`
const ListingTextColumn = styled.View`
    flex: 1;
    justify-content: flex-end;
`
const ListingIconColumn = styled.View`
    flex-direction: column;
    justify-content: space-between;
`
const ListingTitle = styled.Text`
    font-weight: 700;
    font-size: 30px;
    color: #ffffff;
`
const IconContainer = styled.Pressable`
    background-color: #ffffff;
    padding: 10px;
    border-radius: 30px;
`
