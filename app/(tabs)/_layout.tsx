import { Tabs } from 'expo-router'
import { FileUser, User, UserRoundSearch } from 'lucide-react-native'

const TabLayout = (): React.ReactElement => {
    return (
        <Tabs>
            <Tabs.Screen 
                name="home"
                options={{
                    title:'Home',
                    headerShown: false, 
                    tabBarIcon: () => <UserRoundSearch />
                }}
            />
            <Tabs.Screen
                name="viewRequest"
                options={{
                    title:'View Request (CSR)',
                    headerShown: false, 
                    tabBarIcon: () => <FileUser />
                }}
            />
            <Tabs.Screen
                name="myListings"
                options={{
                    title:'View Own Request (PIN)',
                    headerShown: false, 
                    tabBarIcon: () => <FileUser />
                }}
            />
            <Tabs.Screen
                name="savedRequest"
                options={{
                    title:'Saved Requests',
                    headerShown: false, 
                    tabBarIcon: () => <FileUser />
                }}
            />
            <Tabs.Screen 
                name="profile"
                options={{
                    title:'Profile',
                    headerShown: false, 
                    tabBarIcon: () => <User />
                }}
            />
        </Tabs>
    )
}

export default TabLayout