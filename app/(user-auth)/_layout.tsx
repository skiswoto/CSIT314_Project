import { Stack } from 'expo-router';
import React from 'react';

const AuthLayout = (): React.ReactElement => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
        {/* <Tabs.Screen
                name="welcome"
                options={{
                    title:'Welcome',
                    headerShown: false,
                }}
                /> */}
        <Stack.Screen
        name="login"
        options={{
            title: 'Login',
            headerShown: false,
        }}
        />
        {/* <Tabs.Screen
        name="signup"
        options={{
            title: 'Sign Up',
            headerShown: false,
        }}
        />   */}
    </Stack>
    );
};

export default AuthLayout;