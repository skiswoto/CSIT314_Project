import { Stack } from 'expo-router'

const ReportLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="generateReport" />
        </Stack>
    )
}

export default ReportLayout