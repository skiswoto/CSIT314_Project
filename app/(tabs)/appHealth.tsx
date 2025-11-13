import { supabase } from '@/libs/supabase';
import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { styled } from 'styled-components/native';
import { H2, SafeAreaViewContainer } from '../../constants/GlobalStyles';


const AppHealth = () => {
    const [profileLatency, setProfileLatency] = useState<number>(0);
    const [listingLatency, setListingLatency] = useState<number>(0);
    const [pinDashboardLatency, setPinDashboardLatency] = useState<number>(0);
    
    const [allListingsDynamicLatency, setAllListingsDynamicLatency] = useState<number>(0);
    const [completedListingsLatency, setCompletedListingsLatency] = useState<number>(0);
    const [newListingsLatency, setNewListingsLatency] = useState<number>(0);
    const [newSignupsLatency, setNewSignupsLatency] = useState<number>(0);
    
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [isHealthy, setIsHealthy] = useState<boolean>(true);
    const [lastChecked, setLastChecked] = useState<number>(0);

    const checkInterval = 30000;
    const autoCheck = true;

    const updateLastChecked = useCallback(() => {
        setLastChecked(Date.now());
    }, []);

    // Table API Calls
    const profileApiCall = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .from('Profiles')
                .select('id')
                .limit(1)
                .maybeSingle();
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setProfileLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setProfileLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const listingApiCall = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .from('Listings')
                .select('id')
                .limit(1)
                .maybeSingle();
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setListingLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setListingLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const pinDashboardApiCall = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .from('pindashboard')
                .select('id')
                .limit(1)
                .maybeSingle();
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setPinDashboardLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setPinDashboardLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const allListingsDynamicRpc = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .rpc('grab_all_listings_dynamic', {
                });
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setAllListingsDynamicLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setAllListingsDynamicLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const completedListingsRpc = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .rpc('grab_num_of_completed_listings');
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setCompletedListingsLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setCompletedListingsLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const newListingsRpc = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .rpc('grab_num_of_new_listings');
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setNewListingsLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setNewListingsLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const newSignupsRpc = useCallback(async() => {
        const startTime = Date.now();
        try {
            const { error } = await supabase
                .rpc('grab_num_of_new_signups');
            if (error) throw error;

            const responseTime = Date.now() - startTime;
            setNewSignupsLatency(responseTime);
            updateLastChecked();
            return responseTime;
        } catch {
            const responseTime = Date.now() - startTime;
            setNewSignupsLatency(responseTime);
            updateLastChecked();
            return responseTime;
        }
    }, [updateLastChecked]);

    const handleAllApiCalls = async () => {
        setIsChecking(true);
        try {
            await Promise.all([
                // Tables
                profileApiCall(),
                listingApiCall(),
                pinDashboardApiCall(),
                // RPC functions
                allListingsDynamicRpc(),
                completedListingsRpc(),
                newListingsRpc(),
                newSignupsRpc(),
            ]);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (!autoCheck) return;
        handleAllApiCalls();
        const interval = setInterval(handleAllApiCalls, checkInterval);
        return () => clearInterval(interval);
    }, [autoCheck, checkInterval]);

    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <H2>Platform Health</H2>
                <TopBar>
                    <TopBarHeader>
                        {isHealthy ? '✓ All Systems Operational' : '⚠ Issues Detected'}
                    </TopBarHeader>
                    <TopBarSubHeader>
                        Last check: {lastChecked ? new Date(lastChecked).toLocaleTimeString() : 'Never'}
                    </TopBarSubHeader>
                </TopBar>

                {/* Database Tables */}
                <SectionHeader>Database Tables</SectionHeader>
                <ApiContainer>
                    <HeaderRow>
                        <RowHeaderText>Table</RowHeaderText>
                        <RowHeaderText>Response Time</RowHeaderText>
                    </HeaderRow>
                    <DataRow>
                        <Text>Profiles</Text>
                        <Text>{profileLatency ? `${profileLatency} ms` : '...'}</Text>
                    </DataRow>
                    <DataRow>
                        <Text>Listings</Text>
                        <Text>{listingLatency ? `${listingLatency} ms` : '...'}</Text>
                    </DataRow>
                    <DataRow>
                        <Text>Pin Dashboard</Text>
                        <Text>{pinDashboardLatency ? `${pinDashboardLatency} ms` : '...'}</Text>
                    </DataRow>
                </ApiContainer>

                {/* RPC Functions */}
                <SectionHeader>RPC Functions</SectionHeader>
                <ApiContainer>
                    <HeaderRow>
                        <RowHeaderText>Function</RowHeaderText>
                        <RowHeaderText>Response Time</RowHeaderText>
                    </HeaderRow>
                    <DataRow>
                        <Text>All Listings Dynamic</Text>
                        <Text>{allListingsDynamicLatency ? `${allListingsDynamicLatency} ms` : '...'}</Text>
                    </DataRow>
                    <DataRow>
                        <Text>Completed Listings</Text>
                        <Text>{completedListingsLatency ? `${completedListingsLatency} ms` : '...'}</Text>
                    </DataRow>
                    <DataRow>
                        <Text>New Listings</Text>
                        <Text>{newListingsLatency ? `${newListingsLatency} ms` : '...'}</Text>
                    </DataRow>
                    <DataRow>
                        <Text>New Signups</Text>
                        <Text>{newSignupsLatency ? `${newSignupsLatency} ms` : '...'}</Text>
                    </DataRow>
                </ApiContainer>
            </ScrollContainer>
            
            <CheckButton 
                onPress={handleAllApiCalls}
                disabled={isChecking}
            >
                <CheckButtonText>
                    {isChecking ? "Checking..." : "Check All APIs"}
                </CheckButtonText>
            </CheckButton>
        </SafeAreaViewContainer>
    );
};

export default AppHealth

const ScrollContainer = styled.ScrollView`
    margin-horizontal: 20px;
    padding-top: 90px;
    flex: 1;
`
const SectionHeader = styled.Text`
    font-weight: 600;
    font-size: 20px;
    margin-vertical: 10px;
    margin-horizontal: 6px;
`
const TopBar = styled.View`
    margin-vertical: 20px;
    align-self: center;
    flex: 1;
    justify-content: center;
    align-items: center;
`
const TopBarHeader = styled.Text`
    font-weight: 600;
    font-size: 20px;
`
const TopBarSubHeader = styled.Text`
    font-weight: 400;
    font-size: 16px;
    margin-top: 6px;
    color: #8A8A8A;
`
const ApiContainer = styled.View`
    flex-direction: column;
    background-color: #D0D0D0;
    border-radius: 10px;
    padding-vertical: 14px;
    padding-horizontal: 8px;
    width: 93%;
    align-self: center;
    margin-bottom: 26px;
`
const DataRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    padding-horizontal: 12px;
    margin-bottom: 6px;
`
const HeaderRow = styled(DataRow)`
    margin-bottom: 10px;
`
const RowHeaderText = styled.Text`
    font-weight: 700;
    font-size: 14px;
`
const CheckButton = styled.Pressable`
    background-color: #D0D0D0;
    border-radius: 12px;
    align-self: center;
    position: absolute;
    bottom: 50px;
    width: 80%;
`
const CheckButtonText = styled.Text`
    font-weight: 500;
    font-size: 16px;
    padding-vertical: 18px;
    padding-horizontal: 10px;
    align-self: center;
`