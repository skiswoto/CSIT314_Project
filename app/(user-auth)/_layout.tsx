import { Stack } from "expo-router";

const AuthLayout = () => {
    return(
        <Stack>
            <Stack.Screen 
                name="CreateCsrRepPage" 
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="CreatePinPage"
                options={{
                    headerShown: false,
                }}    
            />
            <Stack.Screen
                name="signUp"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="loginForm"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="createPMForm"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="createUAForm"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
};

export default AuthLayout;