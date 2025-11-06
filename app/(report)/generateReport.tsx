import { SafeAreaViewContainer, ScrollContainer } from '@/constants/GlobalStyles'
import { supabase } from '@/libs/supabase'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useRouter } from 'expo-router'
import { FileCheck2, MoveLeft, UserCheck2, UsersRound } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import { BarChart } from "react-native-gifted-charts"
import { styled } from 'styled-components/native'
import { Listing } from '../../services/listings'
import { ScreenTitleText, TopBar } from './userActivity'


const SCREEN_WIDTH = Dimensions.get("screen").width

const GenerateReport = () => {
    const router = useRouter()
    const [range, setRange] = useState<number>(0)
    const [newListingStats, setNewListingStats] = useState<number>(0)
    const [newSignUpStats, setNewSignUpStats] = useState<number>(0)
    const [completedListings, setCompletedListings] = useState<number>(0)
    const [allListings, setAllListings] = useState<Listing[]>([])
    const totalListings = allListings?.length || 0

    const categoryCounts = allListings?.reduce((acc, listing) => {
        acc[listing.category] = (acc[listing.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const urgencyCounts = allListings?.reduce((acc, listing) => {
        acc[listing.urgency as string] = (acc[listing.urgency as string] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const UrgencyData = Object.values(urgencyCounts).map(value => ({ value }));

    useEffect(() => {
        const FetchData = async() => {
            try {
                switch (range) {
                    case 0: 
                        const { data: DailyNewListings, error: DailyListingsErr } = await supabase.rpc('grab_num_of_new_listings', { range: '24h' })
                        const { data: DailyNewSignUps, error: DailySignUpsErr } = await supabase.rpc('grab_num_of_new_signups', { range: '24h' })
                        const { data: DailyCompletedListings, error: DailyCompletedListingsError } = await supabase.rpc('grab_num_of_completed_listings', { range: '24h' })
                        const { data: DailyAllListings, error: DailyAllListingsErr } = await supabase.rpc('grab_all_listings_dynamic', { range: '24h' })
                    
                        if (DailyListingsErr || DailySignUpsErr || DailyCompletedListingsError || DailyAllListingsErr) throw {DailyListingsErr, DailySignUpsErr, DailyCompletedListingsError, DailyAllListingsErr}

                        if (DailyNewListings !== null) setNewListingStats(DailyNewListings)
                        if (DailyNewSignUps !== null) setNewSignUpStats(DailyNewSignUps)
                        if (DailyCompletedListings !== null) setCompletedListings(DailyCompletedListings)
                        if (DailyAllListings !== null) setAllListings(DailyAllListings) 

                        break
                    case 1: 
                        const { data: WeeklyNewListings, error: WeeklyListingsErr } = await supabase.rpc('grab_num_of_new_listings', { range: '7d' })
                        const { data: WeeklyNewSignUps, error: WeeklySignUpsErr } = await supabase.rpc('grab_num_of_new_signups', { range: '7d' })
                        const { data: WeeklyCompletedListings, error: WeeklyCompletedListingsError } = await supabase.rpc('grab_num_of_completed_listings', { range: '7d' })
                        const { data: WeeklyAllListings, error: WeeklyAllListingsErr } = await supabase.rpc('grab_all_listings_dynamic', { range: '7d' })

                        if (WeeklyListingsErr || WeeklySignUpsErr || WeeklyCompletedListingsError || WeeklyAllListingsErr) throw {WeeklyListingsErr, WeeklySignUpsErr, WeeklyCompletedListingsError, WeeklyAllListingsErr}
                        
                        if (WeeklyNewListings !== null) setNewListingStats(WeeklyNewListings)
                        if (WeeklyNewSignUps !== null) setNewSignUpStats(WeeklyNewSignUps)
                        if (WeeklyCompletedListings !== null) setCompletedListings(WeeklyCompletedListings)
                        if (WeeklyAllListings !== null) setAllListings(WeeklyAllListings) 

                        break
                    case 2: 
                        const { data: MonthlyNewListings, error: MonthlyListingsErr } = await supabase.rpc('grab_num_of_new_listings', { range: '30d' })
                        const { data: MonthlyNewSignUps, error: MonthlySignUpsErr } = await supabase.rpc('grab_num_of_new_signups', { range: '30d' })
                        const { data: MonthlyCompletedListings, error: MonthlyCompletedListingsError } = await supabase.rpc('grab_num_of_completed_listings', { range: '30d' })
                        const { data: MonthlyAllListings, error: MonthlyAllListingsErr } = await supabase.rpc('grab_all_listings_dynamic', { range: '30d' })

                        
                        if (MonthlySignUpsErr || MonthlyListingsErr || MonthlyCompletedListingsError || MonthlyAllListingsErr) throw {MonthlySignUpsErr, MonthlyListingsErr, MonthlyAllListingsErr, MonthlyCompletedListingsError}

                        if (MonthlyNewListings !== null) setNewListingStats(MonthlyNewListings)
                        if (MonthlyNewSignUps !== null) setNewSignUpStats(MonthlyNewSignUps)
                        if (MonthlyCompletedListings !== null) setCompletedListings(MonthlyCompletedListings)
                        if (MonthlyAllListings !== null) setAllListings(MonthlyAllListings) 

                        break
                    default: 
                        console.error('Date range invalid')
                }
            } catch(e) {
                console.error("Error message: ", e)
            }
        }
        FetchData()
    }, [range])

    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <TopBar>
                    <Pressable 
                        onPress={() => router.back()}
                    >
                        <MoveLeft size={26} />
                    </Pressable>
                    <ScreenTitleText>Platform Statistics</ScreenTitleText>
                    <View></View>
                </TopBar>
                <SegmentedControl
                    values={['Day', 'Week', 'Month']}
                    tintColor='#000000'
                    fontStyle={{ fontWeight: '500', fontSize: 15, color: '#6B7280' }}
                    activeFontStyle={{ fontWeight: '600', fontSize: 16 }}
                    selectedIndex={range}
                    onChange={(event) => {
                        setRange(event.nativeEvent.selectedSegmentIndex)
                    }}
                    style= {{ marginBottom: 14 }}
                />
                <LongContainer>
                    <LongCard $primary>
                        <LongCardRow>
                            <LongCardIcon $index={1}>
                                <UserCheck2 size={46} color={'#ffffff'}/>
                            </LongCardIcon>
                        </LongCardRow>
                        <LongCardRow>
                            <LongCardText>Sign ups</LongCardText>
                        </LongCardRow>
                        <LongCardRow>
                            <LongCardNumber>{newSignUpStats}</LongCardNumber>
                        </LongCardRow>
                    </LongCard>
                    <LongCard>
                        <LongCardRow>
                            <LongCardIcon $index={2}>
                                <FileCheck2 size={46} color={'#ffffff'}/>
                            </LongCardIcon>
                        </LongCardRow>
                        <LongCardRow>
                            <LongCardText>Listings created</LongCardText>
                        </LongCardRow>
                        <LongCardRow>
                            <LongCardNumber>{newListingStats}</LongCardNumber>
                        </LongCardRow>
                    </LongCard>
                </LongContainer>
                <LongContainer>
                    <DefaultCard>
                        <CardRow>
                            <LongCardIcon $index={3}>
                                <UsersRound size={40} color={'#ffffff'}/>
                            </LongCardIcon>
                            <CardTextColumn>
                                <LongCardNumber>{completedListings}</LongCardNumber>
                                <LongCardText>Completed listings</LongCardText>
                            </CardTextColumn>
                        </CardRow>
                    </DefaultCard>
                </LongContainer>
                <GraphContainer>
                    <GraphTitle>Listings by Urgency</GraphTitle>
                    <BarChart 
                        data={UrgencyData}
                        frontColor={"#1861F0"} 
                        barBorderTopLeftRadius={8}
                        barBorderTopRightRadius={8}
                        spacing={30}
                        xAxisLabelTextStyle={{
                            color: '#000000',
                            fontSize: 12,
                            fontWeight: '500'
                        }}
                        barWidth={60}
                        noOfSections={4}
                        disableScroll
                        xAxisLabelTexts={['High', 'Medium', 'Low']}
                        xAxisLength={300}
                        showValuesAsTopLabel={true}
                        maxValue={100}
                    />
                </GraphContainer>
                <ServicesContainer>
                    <GraphTitle>Listings by Services ({totalListings})</GraphTitle>
                    {Object.entries(categoryCounts).map(([category, count]) => (
                        <BarItem key={category}>
                        <BarLabel>{category}</BarLabel>
                        <BarContainer>
                            <BarFill 
                                width={`${(count / totalListings) * 100 * 1.5}%`}
                            >
                            <BarCount>{count}</BarCount>
                            </BarFill>
                        </BarContainer>
                        </BarItem>
                    ))}
                </ServicesContainer>
            </ScrollContainer>
        </SafeAreaViewContainer>
    )
}

export default GenerateReport

const LongContainer = styled.View`
    flex-direction: row;
    margin-top: 10px;
    justify-content: space-between;
    align-contents: center;
    flex-wrap: wrap;
`
const DefaultCard = styled.View`
    flex-direction: column;
    padding-vertical: 14px;
    padding-horizontal: 14px;
    justify-content: space-between;
    background-color: #000000;
    width: 100%;
    height: 100px;
    border-radius: 20px;
`
const LongCard = styled(DefaultCard)<{ $primary?: boolean}>`
    width: ${SCREEN_WIDTH / 2.3}px;
    height: 190px;
    background-color: ${props => props.$primary? "#4F46E5" : "#0A5913"};
`
const LongCardRow = styled.View`
    flex-direction: row;
    align-items: flex-start;
`
const LongCardText = styled.Text`
    font-weight: 700;
    font-size: 18px;
    color: #E5E7EB;
`
const LongCardNumber = styled.Text`
    font-weight: 700;
    font-size: 34px;
    color: #FFFFFF;
`
const LongCardIcon = styled.View<{ $index?: number}>`
    background-color: ${(props) => {
        switch (props.$index) {
            case 1:
                return "#6366F1"
            case 2:
                return "#3E8543"
            default:
                return "#333232"
        }
    }};
    padding: 14px;
    border-radius: 50px;
    margin-right: 14px;
`
const CardTextColumn = styled.View`
    flex-direction: column;
`
const CardRow = styled.View`
    flex-direction: row;
    align-items: center;
`
const GraphTitle = styled.Text`
    font-size: 20px;
    font-weight: 700;
    padding-vertical: 10px;
    margin-bottom: 10px;
`
const GraphContainer = styled.View`
    background-color: #D0D0D0;
    align-self: center;
    width: 100%;
    height: 300px;
    border-radius: 14px;
    margin-top: 10px;
    padding-horizontal: 10px;
`
const ServicesContainer = styled.View`
    background-color: #D0D0D0;
    align-self: center;
    width: 100%;
    height: 570px;
    border-radius: 14px;
    margin-vertical: 10px;
    padding-horizontal: 10px;
`
const BarItem = styled.View`
    margin-bottom: 16px;
`;
const BarLabel = styled.Text`
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
`;
const BarContainer = styled.View`
    height: 32px;
    background-color: #F3F4F6;
    border-radius: 8px;
    overflow: hidden;
`;
const BarFill = styled.View<{ width: string }>`
    height: 100%;
    width: ${props => props.width};   
    background-color: #1861F0;
    justify-content: center;
    padding-horizontal: 12px;
`;

const BarCount = styled.Text`
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
`;

