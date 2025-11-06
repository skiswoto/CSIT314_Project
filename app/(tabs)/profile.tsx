import { userAuthStore } from '@/global/userAuthStore';
import { supabase } from '@/libs/supabase';
import { Link, useRouter } from 'expo-router';
import { styled } from 'styled-components/native';
import { H1, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';

const Profile = () => {
    const user = userAuthStore((s) => s.user);
    const userName = user?.user_metadata.name;
    // const userRole = user?.user_metadata.role;
    const router = useRouter();

    const handleLogout = async () => {
        try {
        await supabase.auth.signOut();
        userAuthStore.setState({ user: null });
        router.push('/(user-auth)/signUp');
        } catch (error) {
        console.error('Error logging out:', error);
        }
    };

    const handleLogin = () => router.push('/(user-auth)/signUp');

    return (
        // <SafeAreaViewContainer>
        // <ScrollContainer>
        //     {user ? <H1>Hi {userName}!</H1> : <H1>Profile</H1>}
        //     {userRole === 'pin' ? (
        //     <PinDashboard />
        //     ) : userRole === 'csr_rep' ? (
        //     <CsrDashboard />
        //     ) : (
        //     <Text>Please log in to view your dashboard</Text>
        //     )}

        //     {user && (
        //     <LogoutButton onPress={handleLogout}>
        //         <LogoutButtonText>Log Out</LogoutButtonText>
        //     </LogoutButton>
        //     )}

        //     {!user && (
        //     <LoginButton onPress={handleLogin}>
        //         <LoginButtonText>Log In</LoginButtonText>
        //     </LoginButton>
        //     )}
        // </ScrollContainer>
        // </SafeAreaViewContainer>
        <SafeAreaViewContainer>
        <ScrollContainer>
            {user ? 
                <H1>Hi {userName}!</H1> 
                : 
                <H1>profile</H1>
            }
            <Link href="../(user-auth)/signUp" asChild>
                <LoginButton>
                    <LoginButtonText>Log in or sign up</LoginButtonText>
                </LoginButton>
            </Link>
            <Link href="../(report)/generateReport" asChild>
                <ViewStatsButton>
                    <ViewStatsButtonText>View Stats as (PM)</ViewStatsButtonText>
                </ViewStatsButton>
            </Link>
            <Link href="../(report)/userActivity" asChild>
                <ViewStatsButton>
                    <ViewStatsButtonText>View User Log as (UA)</ViewStatsButtonText>
                </ViewStatsButton>
            </Link>
            <Link href="../(report)/personalStats" asChild>
                <ViewStatsButton>
                    <ViewStatsButtonText>View Personal Stats as (PIN)</ViewStatsButtonText>
                </ViewStatsButton>
            </Link>
        </ScrollContainer>
    </SafeAreaViewContainer>
    );
};

const LogoutButton = styled.Pressable`
    background-color: #ff6347;
    padding: 10px;
    border-radius: 10px;
    margin-top: 20px;
    width: 95%;
    align-self: center;
`;

const LoginButton = styled.Pressable`
    background-color: #000;
    padding: 10px;
    border-radius: 10px;
    margin-top: 20px;
    width: 95%;
    align-self: center;
`;

const LogoutButtonText = styled.Text`
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    align-self: center;
`;

const LoginButtonText = styled.Text`
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    align-self: center;
`;
const ViewStatsButton = styled.Pressable`
    background-color: #D0D0D0;
    border-radius: 12px;
    padding-vertical: 10px;
    padding-horizontal: 10px;
    align-self: center;
    margin-vertical: 10px;
`
const ViewStatsButtonText = styled.Text`
    font-size: 14px;
`

export default Profile;
