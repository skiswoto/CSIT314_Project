import { Stack } from 'expo-router'

const ReportLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="generateReport" />
            <Stack.Screen name="userActivity" />
            <Stack.Screen name="personalStats" />
        </Stack>
    )
}

export default ReportLayout