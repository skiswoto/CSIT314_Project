import { Link } from 'expo-router';
import { StatusBar, Text } from "react-native";
import { SafeAreaView, } from 'react-native-safe-area-context';

const Profile = () => {
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <Text>profile</Text>
                <Link href="../(modals)/loginForm" asChild>
                    <Text style={{color: 'blue'}}>Go to Login</Text>
                </Link>
            </SafeAreaView>
            
        </>
    )
}

export default Profile;

