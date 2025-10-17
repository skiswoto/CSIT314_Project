import { Stack } from "expo-router";

const AuthLayout = () => {
    return(
        <Stack>
            <Stack.Screen name="createCsrRepPage" />
            <Stack.Screen name="createPinPage" />
        </Stack>
    );
};

export default AuthLayout;