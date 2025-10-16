import { Stack } from "expo-router";

const WelcomePage = () => {
    return(
        <Stack>
            <Stack.Screen name="login" />
            <Stack.Screen name="createCsrRepPage" />
            <Stack.Screen name="createPinPage" />
        </Stack>
    );
};

export default WelcomePage;