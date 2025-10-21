import { Stack } from "expo-router";

const AuthLayout = () => {
    return(
        <Stack>
            <Stack.Screen name="CreateCsrRepPage" />
            <Stack.Screen name="CreatePinPage" />
            <Stack.Screen
                name="signUp"
                options={{
                    title: 'Sign Up',
                    headerShown: false,
                    contentStyle: { borderRadius: 20 }
                }}
            />
            <Stack.Screen
                name="loginForm"
                options={{
                    title: 'Login',
                    headerShown: false,
                }}
            />
        </Stack>
    );
};

export default AuthLayout;