import { SafeAreaViewContainer, ScrollContainer } from '@/constants/GlobalStyles'
import { supabase } from '@/libs/supabase'
import { useRouter } from 'expo-router'
import { MoveLeft } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { styled } from 'styled-components/native'

interface UserProps {
    id: string;
    created_at: string;
    email: string;
    name: string;
    role: string;
}

const UserActivity = () => {
    const router = useRouter()

    const [users, setUsers] = useState<UserProps[]>([])

    const grabAllUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('Profiles')
                .select('*')
                .order('email', { ascending: true });
            
            if (error) {
                console.error(error);
                setUsers([]);
                return;
            }
            
            setUsers(data || []);
        } catch (err) {
            console.error("Unexpected error:", err);
            setUsers([]);
        }
    }

    useEffect(() => {
        grabAllUsers();
    }, []);

    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <TopBar>
                    <Pressable 
                        onPress={() => router.back()}
                    >
                        <MoveLeft size={26} />
                    </Pressable>
                    <ScreenTitleText>User Activity Logs</ScreenTitleText>
                    <View></View>
                </TopBar>
                {users.map((user) => (
                    <UserCard key={user.id}>
                        <UserCardRow>
                            <UserCardTextTitle>Name: </UserCardTextTitle><UserCardTextData>{user.name}</UserCardTextData>
                        </UserCardRow>
                        <UserCardRow>
                            <UserCardTextTitle>Email: </UserCardTextTitle><UserCardTextData>{user.email}</UserCardTextData>
                        </UserCardRow>
                        <UserCardRow>
                            <UserCardTextTitle>Role: </UserCardTextTitle><UserCardTextData>{user.role}</UserCardTextData>
                        </UserCardRow>
                        <UserCardRow>
                            <UserCardTextTitle>Created at: </UserCardTextTitle><UserCardTextData>{user.created_at}</UserCardTextData>
                        </UserCardRow>
                    </UserCard>
                ))}
            </ScrollContainer>
        </SafeAreaViewContainer>
    )
}

export default UserActivity

const UserCard = styled.View`
    border-radius: 16px;
    background-color: #D0D0D0;
    padding-vertical: 10px;
    padding-horizontal: 12px;
    margin-vertical: 4px;
`
const UserCardRow = styled.View`
    flex-direction: row;
    padding-vertical: 2px;
`
const UserCardTextTitle = styled.Text`
    font-weight: 600;
    font-size: 16px;
`
const UserCardTextData = styled.Text`
    font-size: 16px;
    width: 200px;
`
export const TopBar = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 30px;
    justify-content: space-between;
`
export const ScreenTitleText = styled.Text`
    font-weight: 700;
    font-size: 24px;
`