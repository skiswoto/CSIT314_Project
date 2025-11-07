import { userAuthStore } from '@/global/userAuthStore';
import { Tabs } from 'expo-router';
import { BarChart, FileUser, User, UserRoundSearch } from 'lucide-react-native';


export default function TabLayout() {
    const user = userAuthStore((s) => s.user);
    const userRole = user?.user_metadata?.role?.toLowerCase() as 'unregistered' | 'pin' | 'csr_rep' | 'platform_manager' | 'user_admin';

    const roleBasedTabs = {
        unregistered: ['home', 'profile'],
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

    const visibleTabs = roleBasedTabs[userRole] ?? roleBasedTabs['unregistered'];

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