<<<<<<< HEAD
import { Tabs } from 'expo-router'
import { BarChart3, FileUser, User, UserRoundSearch } from 'lucide-react-native'

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
                name="analytics"
                options={{
                tabBarIcon: ({ color}) => <BarChart3 size={24} color={color} />,
                tabBarLabel: 'Analytics',
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
=======
import { userAuthStore } from '@/global/userAuthStore'; // Import the userAuthStore
import { Tabs } from 'expo-router';
import { FileUser, User, UserRoundSearch } from 'lucide-react-native';

const TabLayout = (): React.ReactElement => {
  const user = userAuthStore(s => s.user);  // Get the logged-in user data
  const userRole = user?.user_metadata.role; // Extract the role

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
      {/* Render CSR-specific View Request tab only if user is CSR */}
      {userRole === 'csr_rep' && (
        <Tabs.Screen
          name="viewRequest"
          options={{
            title:'View Request (CSR)',
            headerShown: false, 
            tabBarIcon: () => <FileUser />
          }}
        />
      )}
      {/* Render PIN-specific View Own Request tab only if user is PIN */}
      {userRole === 'pin' && (
        <Tabs.Screen
          name="myListings"
          options={{
            title:'View Own Request (PIN)',
            headerShown: false, 
            tabBarIcon: () => <FileUser />
          }}
        />
      )}
      {/* Render Saved Requests tab only if user is CSR */}
      {userRole === 'csr_rep' && (
        <Tabs.Screen
          name="savedRequest"
          options={{
            title:'Saved Requests',
            headerShown: false, 
            tabBarIcon: () => <FileUser />
          }}
        />
      )}
      {/* Always render the Profile tab */}
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
>>>>>>> userstory62
}

export default TabLayout;
