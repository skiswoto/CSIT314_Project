import { useRouter } from 'expo-router'
import { ArrowLeft, Heart } from 'lucide-react-native'
import { Image, ImageBackground, StyleSheet, View } from 'react-native'
import { styled } from 'styled-components/native'
import { SafeAreaViewContainer } from '../../constants/GlobalStyles'


const SampleListing = () => {
    const router = useRouter()
    return (
        <SafeAreaViewContainer>
            <View
                style={{
                    flex: 1,
                }}
            >   
                <ImageBackground
                    style={styles.backgroundImage}
                    resizeMode='cover'
                    source={require('../../assets/samples/bobby.jpg')}
                >
                    <TopBar>
                        <IconContainer onPress={() => router.back()}>
                            <ArrowLeft size={26} />
                        </IconContainer>
                        <IconContainer>
                            <Heart size={26} />
                        </IconContainer>
                    </TopBar>
                </ImageBackground>
                <Card>
                    <CategoryRow>
                        <Category>
                            <CategoryText>Medical</CategoryText>
                        </Category>
                        <Category>
                            <CategoryText>Urgent</CategoryText>
                        </Category>
                        <Category>
                            <CategoryText>Utilities</CategoryText>
                        </Category>
                    </CategoryRow>
                    <ListingTitle>Bobby, 60+</ListingTitle>
                    <ListingDescription>
                        I am looking for someone to bring me to the hospital on a weekly basis.
                    </ListingDescription>
                    <Row>
                        <Image 
                            source={require('../../assets/samples/bobby.jpg')} 
                            resizeMode="cover"
                            style={styles.profileImage}
                        />
                        <ChatButton>
                            <ChatButtonText>Chat now</ChatButtonText>
                        </ChatButton>
                    </Row>
                    <ApplyButton>
                        <ApplyButtonText>Apply now</ApplyButtonText>
                    </ApplyButton>
                </Card>
            </View>
        </SafeAreaViewContainer>
    )
}

export default SampleListing

const styles = StyleSheet.create({
    backgroundImage: {
        width: '100%',
        height: 500,
    },
    profileImage: {
        width: '12%',
        height: 40,
        borderRadius: 50,
    }
})
const Card = styled.View`
    background-color: #ffffff;
    height: 46%;
    width: 100%;
    position: absolute;
    bottom: 0px;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    overflow: hidden;
    padding-horizontal: 20px;
    padding-vertical: 20px;
`
const ApplyButton = styled.TouchableOpacity`
    background-color: #F2F2F2;
    border-radius: 24px;
    overflow: hidden;
    padding-horizontal: 14px;
    padding-vertical: 18px;
`
const ChatButton = styled.Pressable`
    background-color: #F2F2F2;
    border-radius: 24px;
    overflow: hidden;
    padding-horizontal: 6px;
    padding-vertical: 14px;
    width: 30%;
`
const Category = styled.Pressable`
    background-color: #F5F5F5;
    border-radius: 24px;
    overflow: hidden;
    padding-horizontal: 2px;
    padding-vertical: 8px;
    width: 20%;
    margin-right: 8px;
`
const IconContainer = styled.Pressable`
    background-color: #ffffff;
    border-radius: 50px;
    overflow: hidden;
    padding: 6px;
`
const ComponentText = styled.Text`
    align-self: center;
`
const ApplyButtonText = styled(ComponentText)`
    font-weight: 600;
    font-size: 20px;
`
const ChatButtonText = styled(ComponentText)`
    font-weight: 600;
    font-size: 14px;
`
const CategoryText = styled(ComponentText)`
    font-weight: 500;
    font-size: 12px;
`
const ListingTitle = styled.Text`
    font-weight: 600;
    font-size: 24px;
    margin-bottom: 14px;
`
const ListingDescription = styled.Text`
    font-weight: 400;
    font-size: 14px;
    color: #636363;
    margin-bottom: 40px;
    width: 95%;
`
const TopBar = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 70px;
    margin-horizontal: 20px;
`
const CategoryRow = styled.View`
    width: 100%;
    flex-direction: row;
    margin-bottom: 30px;
    align-items: center;
`
const Row = styled(CategoryRow)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`