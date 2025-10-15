import { Tabs } from 'expo-router'


const TabLayout = (): React.ReactElement => {
    return (
        <Tabs>
            <Tabs.Screen 
                name="home"
                options={{
                    title:'Home',
                    headerShown: false, 
                }}
            />
            <Tabs.Screen
                name="myListings"
                options={{
                    title:'MyListings',
                    headerShown: false, 
                }}
            />
            <Tabs.Screen 
                name="profile"
                options={{
                    title:'Profile',
                    headerShown: false, 
                }}
            />
        </Tabs>
    )
}

export default TabLayout