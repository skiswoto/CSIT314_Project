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
    listingsCreated?: number
    listingsDone?: number;
}

interface ListingPerUser {
    name: string;
    quantity: number;
}

const UserActivity = () => {
    const router = useRouter()
    const [users, setUsers] = useState<UserProps[]>([])
    const [listings, setListings] = useState<ListingPerUser[]>([])

    const grabAllUsers = async () => {
        try {
            const { data: allUsers, error: allUsersErr } = await supabase
                .from('Profiles')
                .select('*')
                .order('email', { ascending: true });
            
            if (allUsersErr) {
                console.error(allUsersErr);
                setUsers([]);
                return;
            }
            
            setUsers(allUsers || []);
        } catch (err) {
            console.error("Unexpected error:", err);
            setUsers([]);
        }
    }

    const grabCreatedListingsPerUser = async() => {
        try {
            const {data: ListingsData, error: ListingsErr} = await supabase.rpc('compile_num_of_listing_created_per_user')

            if (ListingsErr) {
                console.error(ListingsErr)
                setListings([])
                return
            }
            setListings(ListingsData || [])
        } catch (err) {
            console.error("Unexpected error:", err);
            setListings([]);
        }
    }
    
    useEffect(() => {
        grabAllUsers();
        grabCreatedListingsPerUser()
    }, []);

    const mergedData = users.map((user) => {
        const listing = listings.find((l) => l.name === user.name); 
        return {
            ...user,
            listingsCreated: listing ? listing.quantity : 0, 
        };
    });

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
                {listings.length > 0 && 
                    mergedData.map((user) => (
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
                                {user.role === 'pin' ? 
                                    <>  
                                        <UserCardTextTitle># of Listings created: </UserCardTextTitle><UserCardTextData>{user.listingsCreated}</UserCardTextData>
                                    </>:
                                    <>  
                                        <UserCardTextTitle># of Listings completed: </UserCardTextTitle><UserCardTextData>{user.listingsDone || 0}</UserCardTextData>
                                    </>                            
                                }
                            </UserCardRow>
                            <UserCardRow>
                                <UserCardTextTitle>Created at: </UserCardTextTitle><UserCardTextData>{user.created_at}</UserCardTextData>
                            </UserCardRow>
                        </UserCard>
                    ))
                }
                {listings.length > 0 && listings.map((listing, index) => (
                    <UserCard key={index}>
                        <UserCardRow>
                            <UserCardTextTitle>Name: </UserCardTextTitle><UserCardTextData>{listing.name}</UserCardTextData>
                        </UserCardRow>
                        <UserCardRow>
                            <UserCardTextTitle># of Listings Created: </UserCardTextTitle><UserCardTextData>{listing.quantity}</UserCardTextData>
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