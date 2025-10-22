import { Stack } from 'expo-router'

const CreateRequestStepsLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="step1" 
            />
            <Stack.Screen name="step2" 
            />
            <Stack.Screen name="step3" />
        </Stack>
    )
}

export default CreateRequestStepsLayout