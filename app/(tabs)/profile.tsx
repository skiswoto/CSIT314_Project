import { Link } from 'expo-router';
import { styled } from 'styled-components/native';
import { H1, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';


const Profile = () => {
    return (
        <>
            <SafeAreaViewContainer>
                <ScrollContainer>
                    <H1>profile</H1>
                    <Link href="../(user-auth)/signUp" asChild>
                        <LoginButton>
                            <LoginButtonText>Log in or sign up</LoginButtonText>
                        </LoginButton>
                    </Link>
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    )
}

export default Profile;

const LoginButton = styled.Pressable`
    background-color: #000000;
    border-radius: 14px;
    overflow: hidden;
    width: 95%;
    align-self: center;
    margin-top: 30px;
`
const LoginButtonText = styled.Text`
    color: #ffffff;
    font-weight: 600;
    font-size: 18px;
    padding-vertical: 16px;
    align-self: center;
`