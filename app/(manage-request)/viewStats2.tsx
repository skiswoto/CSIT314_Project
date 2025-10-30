import React from 'react';
import { StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, MousePointerClick, TrendingUp } from 'lucide-react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { LineChart } from 'recharts';

const screenWidth = Dimensions.get('window').width;

// Sample stats data
const statsData = {
    totalClicks: 245,
    profileVisits: 189,
    clickTrend: '+12%',
    visitTrend: '+8%',
};

// Sample graph data for the past 7 days
const chartData = [
    { day: 'Mon', clicks: 30, visits: 25 },
    { day: 'Tue', clicks: 45, visits: 35 },
    { day: 'Wed', clicks: 35, visits: 28 },
    { day: 'Thu', clicks: 50, visits: 42 },
    { day: 'Fri', clicks: 40, visits: 30 },
    { day: 'Sat', clicks: 25, visits: 18 },
    { day: 'Sun', clicks: 20, visits: 11 },
];

const ViewStats = () => {
    const router = useRouter();

    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <ScrollContainer contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <Header>
                        <BackButton onPress={() => router.back()}>
                            <ArrowLeft size={26} color="#1F2937" />
                        </BackButton>
                        <HeaderTitle>Request Statistics</HeaderTitle>
                        <Spacer />
                    </Header>

                    {/* Stats Cards */}
                    <StatsContainer>
                        {/* Total Clicks Card */}
                        <StatCard>
                            <IconCircle backgroundColor="#3B82F6">
                                <MousePointerClick size={24} color="#FFFFFF" />
                            </IconCircle>
                            <StatInfo>
                                <StatLabel>Total Listing Clicks</StatLabel>
                                <StatValue>{statsData.totalClicks}</StatValue>
                                <TrendContainer>
                                    <TrendingUp size={16} color="#10B981" />
                                    <TrendText positive>{statsData.clickTrend} from last week</TrendText>
                                </TrendContainer>
                            </StatInfo>
                        </StatCard>

                        {/* Profile Visits Card */}
                        <StatCard>
                            <IconCircle backgroundColor="#8B5CF6">
                                <Eye size={24} color="#FFFFFF" />
                            </IconCircle>
                            <StatInfo>
                                <StatLabel>Profile Visits</StatLabel>
                                <StatValue>{statsData.profileVisits}</StatValue>
                                <TrendContainer>
                                    <TrendingUp size={16} color="#10B981" />
                                    <TrendText positive>{statsData.visitTrend} from last week</TrendText>
                                </TrendContainer>
                            </StatInfo>
                        </StatCard>
                    </StatsContainer>

                    {/* Graph Section */}
                    <GraphSection>
                        <SectionTitle>Weekly Overview</SectionTitle>
                        <GraphCard>
                            <LegendContainer>
                                <LegendItem>
                                    <LegendDot color="#3B82F6" />
                                    <LegendText>Clicks</LegendText>
                                </LegendItem>
                                <LegendItem>
                                    <LegendDot color="#8B5CF6" />
                                    <LegendText>Visits</LegendText>
                                </LegendItem>
                            </LegendContainer>

                            {/* Simple Bar Chart Visualization */}
                            <ChartContainer>
                                {chartData.map((data, index) => (
                                    <DayColumn key={index}>
                                        <BarsContainer>
                                            <Bar 
                                                height={(data.clicks / 50) * 100} 
                                                color="#3B82F6"
                                            >
                                                <BarValue>{data.clicks}</BarValue>
                                            </Bar>
                                            <Bar 
                                                height={(data.visits / 50) * 100} 
                                                color="#8B5CF6"
                                            >
                                                <BarValue>{data.visits}</BarValue>
                                            </Bar>
                                        </BarsContainer>
                                        <DayLabel>{data.day}</DayLabel>
                                    </DayColumn>
                                ))}
                            </ChartContainer>
                        </GraphCard>
                    </GraphSection>

                    {/* Summary Section */}
                    <SummarySection>
                        <SectionTitle>Summary</SectionTitle>
                        <SummaryCard>
                            <SummaryText>
                                Your request has been performing well this week with steady engagement. 
                                The click-through rate has increased by {statsData.clickTrend} and profile 
                                visits are up by {statsData.visitTrend} compared to last week.
                            </SummaryText>
                        </SummaryCard>
                    </SummarySection>
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    );
};

export default ViewStats;

const Header = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
`;

const BackButton = styled.TouchableOpacity`
    background-color: #F3F4F6;
    border-radius: 50px;
    padding: 8px;
`;

const HeaderTitle = styled.Text`
    font-size: 20px;
    font-weight: 600;
    color: #1F2937;
`;

const Spacer = styled.View`
    width: 42px;
`;

const StatsContainer = styled.View`
    gap: 16px;
    margin-bottom: 32px;
`;

const StatCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    border-width: 1px;
    border-color: #E5E7EB;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.05;
    shadow-radius: 4px;
    elevation: 2;
`;

const IconCircle = styled.View<{ backgroundColor: string }>`
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background-color: ${props => props.backgroundColor};
    align-items: center;
    justify-content: center;
`;

const StatInfo = styled.View`
    flex: 1;
`;

const StatLabel = styled.Text`
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 4px;
`;

const StatValue = styled.Text`
    font-size: 32px;
    font-weight: 700;
    color: #1F2937;
    margin-bottom: 4px;
`;

const TrendContainer = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 4px;
`;

const TrendText = styled.Text<{ positive?: boolean }>`
    font-size: 13px;
    color: ${props => props.positive ? '#10B981' : '#EF4444'};
    font-weight: 500;
`;

const GraphSection = styled.View`
    margin-bottom: 32px;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 12px;
`;

const GraphCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    border-width: 1px;
    border-color: #E5E7EB;
`;

const LegendContainer = styled.View`
    flex-direction: row;
    gap: 20px;
    margin-bottom: 24px;
`;

const LegendItem = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const LegendDot = styled.View<{ color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background-color: ${props => props.color};
`;

const LegendText = styled.Text`
    font-size: 14px;
    color: #6B7280;
    font-weight: 500;
`;

const ChartContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    padding-horizontal: 4px;
`;

const DayColumn = styled.View`
    flex: 1;
    align-items: center;
    gap: 8px;
`;

const BarsContainer = styled.View`
    flex-direction: row;
    align-items: flex-end;
    gap: 4px;
    height: 180px;
`;

const Bar = styled.View<{ height: number; color: string }>`
    width: 20px;
    height: ${props => Math.max(props.height, 10)}%;
    background-color: ${props => props.color};
    border-radius: 4px;
    justify-content: flex-start;
    align-items: center;
    padding-top: 4px;
`;

const BarValue = styled.Text`
    font-size: 10px;
    font-weight: 600;
    color: #FFFFFF;
`;

const DayLabel = styled.Text`
    font-size: 12px;
    color: #6B7280;
    font-weight: 500;
`;

const SummarySection = styled.View`
    margin-bottom: 20px;
`;

const SummaryCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    border-width: 1px;
    border-color: #E5E7EB;
`;

const SummaryText = styled.Text`
    font-size: 15px;
    color: #4B5563;
    line-height: 24px;
`;