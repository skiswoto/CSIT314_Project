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
                name="myListings"
                options={{
                    title:'MyListings',
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