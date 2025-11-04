import { SafeAreaViewContainer, ScrollContainer } from '@/constants/GlobalStyles'
import { supabase } from '@/libs/supabase'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useRouter } from 'expo-router'
import { FileCheck2, MoveLeft, UserCheck2, UsersRound } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Dimensions, Pressable } from 'react-native'
import { BarChart } from "react-native-gifted-charts"
import { styled } from 'styled-components/native'

const SCREEN_WIDTH = Dimensions.get("screen").width

const GenerateReport = () => {
    const router = useRouter()
    const [range, setRange] = useState<number>(0)
    const [newListingStats, setNewListingStats] = useState<number>(0)
    
    useEffect(() => {
        const FetchData = async() => {
            try {
                switch (range) {
                    case 0: 
                        const { data: NumofNewDailyListings, error: DailyListingsErr } = await supabase.rpc('grab_num_of_new_listings')
                        if (DailyListingsErr) throw DailyListingsErr
                        if (NumofNewDailyListings) setNewListingStats(NumofNewDailyListings)
                        break
                    case 1: 
                        const { data: NumofNewWeeklyListings, error: WeeklyListingsErr } = await supabase.rpc('grab_num_of_new_listings', {
                            time_range: '7d'
                        })
                        if (WeeklyListingsErr) throw WeeklyListingsErr
                        if (NumofNewWeeklyListings) setNewListingStats(NumofNewWeeklyListings)
                        break
                    case 2: 
                        const { data: NumofNewMonthlyListings, error: MonthlyListingsErr } = await supabase.rpc('grab_num_of_new_listings', {
                            time_range: '30d'
                        })
                        if (MonthlyListingsErr) throw MonthlyListingsErr
                        if (NumofNewMonthlyListings) setNewListingStats(NumofNewMonthlyListings)
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

    const UrgencyData = [ {value: 50}, {value: 80}, {value: 90} ]
    const ServiceData = [ 
        {value: 50}, 
        {value: 80}, 
        {value: 90},
        {value: 50}, 
        {value: 80}, 
        {value: 90},
        {value: 65},
    ]

    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <Pressable 
                    onPress={() => router.back()}
                    style={{ marginBottom: 30 }}
                >
                    <MoveLeft size={26} />
                </Pressable>
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
                            <LongCardNumber>22</LongCardNumber>
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
                                <LongCardNumber>7</LongCardNumber>
                                <LongCardText>Matches made</LongCardText>
                            </CardTextColumn>
                        </CardRow>
                    </DefaultCard>
                </LongContainer>
                <GraphContainer>
                    <GraphTitle>Listings by Urgency</GraphTitle>
                    <BarChart 
                        data={UrgencyData} 
                        barBorderTopLeftRadius={8}
                        barBorderTopRightRadius={8}
                        spacing={30}
                        xAxisLabelTextStyle={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontWeight: '500'
                        }}
                        barWidth={60}
                        noOfSections={4}
                        disableScroll
                        xAxisLabelTexts={['High', 'Medium', 'Low']}
                        xAxisLength={300}
                    />
                </GraphContainer>
                <GraphContainer>
                    <GraphTitle>Listings by Services</GraphTitle>
                    <BarChart 
                        data={ServiceData} 
                        barBorderTopLeftRadius={8}
                        barBorderTopRightRadius={8}
                        spacing={16}
                        xAxisLabelTextStyle={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontWeight: '500'
                        }}
                        barWidth={30}
                        noOfSections={4}
                        xAxisLabelTexts={['Companionship', 'Medical', 'Meals', 'Transport', 'Groceries', 'Home care', 'Tech support']}
                    />
                </GraphContainer>
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
const LongPercentageContainer = styled.View`
    padding-horizontal: 8px;
    padding-vertical: 6px;
    border-radius: 20px;
    background-color: #10B981;
`
const LongPercentageText = styled.Text`
    font-weight: 600;
    font-size: 16px;
    color: #FFFFFF;
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
    padding-horizontal: 16px;
`
const GraphContainer = styled.View`
    background-color: #D0D0D0;
    align-self: center;
    width: 100%;
    height: 280px;
    border-radius: 14px;
    margin-vertical: 10px;
`