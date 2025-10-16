import { Stack } from 'expo-router'

const CreateRequestStepsLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="step1" />
        </Stack>
    )
}

export default CreateRequestStepsLayout