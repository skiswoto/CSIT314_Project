import { userAuthStore } from '@/global/userAuthStore';
import { supabase } from '@/libs/supabase';
import { Link, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { styled } from 'styled-components/native';
import { H1, H3, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';


const Profile = () => {
    const router = useRouter()
    const user = userAuthStore((s) => s.user);
    const userName = user?.user_metadata.name; 
    const userRole = user?.user_metadata.role;

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error
            userAuthStore.getState().clearUser()
            router.navigate('/(user-auth)/loginForm')
            Alert.alert(
                'Log out Succesful',
                'See you again!',
                [
                    {
                        text: 'Continue',
                        style: 'cancel',
                    },
                ],
                { cancelable: true, },
                )
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                {user ? 
                    <>
                        <H1>Hi {userName}!</H1> 
                        <H3>User role: {userRole}</H3>
                    </>
                    : 
                    <H1>profile</H1>
                }
                {!user ? 
                <Link href="../(user-auth)/signUp" asChild>
                    <AuthButton $login>
                        <AuthButtonText $login>Log in or sign up</AuthButtonText>
                    </AuthButton>
                </Link>
                : 
                <AuthButton $login={false} onPress={handleLogout}>
                    <AuthButtonText $login={false}>Logout</AuthButtonText>
                </AuthButton>
                }
            </ScrollContainer>
        </SafeAreaViewContainer>
    );
};

const AuthButton = styled.Pressable<{ $login: boolean}>`
    background-color: ${props => props.$login? "#000000" : "#ff6347"};
    padding-vertical: 16px;
    border-radius: 10px;
    margin-top: 20px;
    width: 95%;
    align-self: center;
`
const AuthButtonText = styled.Text<{ $login: boolean}>`
    color: #ffffff;
    color: ${props => props.$login? "#ffffff" : "#000000"};
    font-size: 18px;
    font-weight: 600;
    align-self: center;
`
export default Profile;
