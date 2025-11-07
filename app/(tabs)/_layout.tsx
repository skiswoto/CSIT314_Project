// import { userAuthStore } from '@/global/userAuthStore';
// import { Tabs } from 'expo-router';
// import { BarChart3, FileUser, User, UserRoundSearch } from 'lucide-react-native';


// const TabLayout = (): React.ReactElement => {
//     const user = userAuthStore((s) => s.user);
//     const userRole = user?.user_metadata.role;

//     const getAccessibleScreens = () => {
//         const baseScreens = {
//             Home: HomeScreen,
//             Profile: ProfileScreen,
//         }  

//         const roleBasedScreens = {
//             'pin': {},
//             'csr_rep': {},
//             'platform_manager': {},
//             'user_admin': {},
//         }
//         return {...baseScreens, ...roleBasedScreens[user?.userRole]}
//     }

//     const screens = getAccessibleScreens()

//     return (
//         // <Tabs>
//         //     <Tabs.Screen 
//         //         name="home"
//         //         options={{
//         //             title:'Home',
//         //             headerShown: false, 
//         //             tabBarIcon: () => <UserRoundSearch />
//         //         }}
//         //     />
//         //     <Tabs.Screen
//         //         name="myListings"
//         //         options={{
//         //             title:'View Own Request (PIN)',
//         //             headerShown: false, 
//         //             tabBarIcon: () => <FileUser />
//         //         }}
//         //     />
//         //     <Tabs.Screen
//         //         name="savedRequest"
//         //         options={{
//         //             title:'Saved Requests',
//         //             headerShown: false, 
//         //             tabBarIcon: () => <FileUser />
//         //         }}
//         //     />
//         //     <Tabs.Screen 
//         //         name="analytics"
//         //         options={{
//         //             headerShown: false, 
//         //             tabBarIcon: ({ color}) => <BarChart3 size={24} color={color} />,
//         //             tabBarLabel: 'Analytics',
//         //         }}
//         //     />
//         //     <Tabs.Screen 
//         //         name="profile"
//         //         options={{
//         //             title:'Profile',
//         //             headerShown: false, 
//         //             tabBarIcon: () => <User />
//         //         }}
//         //     /> 
//         // </Tabs>
//         <Tabs>
//             {Object.entries(screens).map(([name, component]) => (
//                 <Tabs.Screen key={name} name={name} component={component} />
//             ))}
//         </Tabs>
//     )
// }

// export default TabLayout;


// import { userAuthStore } from '@/global/userAuthStore';
// import { Tabs } from 'expo-router';
// import { FileUser, User, UserRoundSearch } from 'lucide-react-native';
// import Analytics from './analytics';
// import Home from './home';
// import MyListings from './myListings';
// import Profile from './profile';
// import SavedRequests from './savedRequest';


// export default function TabLayout() {
//     const user = userAuthStore((s) => s.user)
//     // const userRole = user?.user_metadata?.role
//     const userRole = user?.user_metadata?.role?.toLowerCase() as keyof typeof roleBasedTabs;

//     const roleBasedTabs = {
//         pin: [
//             {
//                 name: 'home',
//                 component: Home,
//                 options: { title: 'Home', headerShown: false, tabBarIcon: () => <UserRoundSearch /> },
//             },
//             {
//                 name: 'myListings',
//                 component: MyListings,
//                 options: { title: 'View Own Request (PIN)', headerShown: false, tabBarIcon: () => <FileUser /> },
//             },
//             {
//                 name: 'profile',
//                 component: Profile,
//                 options: { title: 'Profile', headerShown: false, tabBarIcon: () => <User /> },
//             },
//         ],
//         csr_rep: [
//             {
//                 name: 'home',
//                 options: { title: 'Home', headerShown: false, tabBarIcon: () => <UserRoundSearch /> },
//             },
//             {
//                 name: 'savedRequest',
//                 options: { title: 'Saved Requests', headerShown: false, tabBarIcon: () => <FileUser /> },
//             },
//             {
//                 name: 'analytics',
//                 options: { title: 'Analystics', headerShown: false,  },
//             },
//             {
//                 name: 'profile',
//                 options: { title: 'Profile', headerShown: false, tabBarIcon: () => <User /> },
//             },
//         ],
//         platform_manager: [
//             {
//                 name: 'home',
//                 options: { title: 'Home', headerShown: false, tabBarIcon: () => <UserRoundSearch /> },
//             },
//             {
//                 name: 'profile',
//                 options: { title: 'Profile', headerShown: false, tabBarIcon: () => <User /> },
//             },
//             {
//                 name: 'analytics',
//                 options: { title: 'Analystics', headerShown: false,  },
//             },
//             // platformAnalytics: PlatformAnalytics
//         ],
//         user_admin: [
//             {
//                 name: 'home',
//                 component: Home,
//                 options: { title: 'Home', headerShown: false, tabBarIcon: () => <UserRoundSearch /> },
//             },
//             {
//                 name: 'profile',
//                 component: Profile,
//                 options: { title: 'Profile', headerShown: false, tabBarIcon: () => <User /> },
//             },
//             {
//                 name: 'analytics',
//                 component: Analytics,
//                 options: { title: 'Analystics', headerShown: false,  },
//             },
//             // userActivity: UserActivity
//         ],
//     } as const

//     const tabs = roleBasedTabs[userRole] ?? roleBasedTabs['pin']
//     return (
//         <Tabs>
//             {!user ? (
//                 <Tabs.Screen name="profile" options={{ headerShown: false }} />
//             ) : (
//                 tabs.map(tab => (
//                     <Tabs.Screen
//                         key={tab.name}
//                         name={tab.name}
//                         options={tab.options}
//                     />
//                 ))
//             )}
//         </Tabs>
//     );
// }

import { userAuthStore } from '@/global/userAuthStore';
import { Tabs } from 'expo-router';
import { BarChart, FileUser, User, UserRoundSearch } from 'lucide-react-native';


export default function TabLayout() {
    const user = userAuthStore((s) => s.user);
    const userRole = user?.user_metadata?.role?.toLowerCase() as 'pin' | 'csr_rep' | 'platform_manager' | 'user_admin';

    const roleBasedTabs = {
        pin: ['home', 'myListings', 'profile'],
        csr_rep: ['home', 'savedRequest', 'analytics', 'profile'],
        platform_manager: ['home', 'analytics', 'profile'],
        user_admin: ['home', 'analytics', 'profile'],
    } as const;

    const tabConfig = {
        home: {
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <UserRoundSearch color={color} size={size} />
            ),
        },
        myListings: {
            title: 'View Own Request (PIN)',
            headerShown: false,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <FileUser color={color} size={size} />
            ),
        },
        savedRequest: {
            title: 'Saved Requests',
            headerShown: false,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <FileUser color={color} size={size} />
            ),
        },
        analytics: {
            title: 'Analytics',
            headerShown: false,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <BarChart color={color} size={size} />
            ),
        },
        profile: {
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <User color={color} size={size} />
            ),
        },
    };

    const visibleTabs = roleBasedTabs[userRole] ?? roleBasedTabs['pin'];
    
    type TabName = keyof typeof tabConfig;
    const isTabVisible = (tabName: TabName): boolean => {
        return (visibleTabs as readonly TabName[]).includes(tabName);
    }

    return (
        <Tabs>
            <Tabs.Screen
                name="home"
                options={{
                    ...tabConfig.home,
                    href: isTabVisible('home') ? '/home' : null,
                }}
            />
            <Tabs.Screen
                name="myListings"
                options={{
                    ...tabConfig.myListings,
                    href: isTabVisible('myListings') ? '/myListings' : null,
                }}
            />
            <Tabs.Screen
                name="savedRequest"
                options={{
                    ...tabConfig.savedRequest,
                    href: isTabVisible('savedRequest') ? '/savedRequest' : null,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    ...tabConfig.analytics,
                    href: isTabVisible('analytics') ? '/analytics' : null,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={tabConfig.profile}
            />
        </Tabs>
    );
}