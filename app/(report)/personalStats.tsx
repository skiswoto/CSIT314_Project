import { SafeAreaViewContainer, ScrollContainer } from '@/constants/GlobalStyles';
import { getPinDashboardData } from '@/libs/supabaseHelper';
import { useRouter } from 'expo-router';
import { MoveLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styled } from 'styled-components/native';
import { ScreenTitleText, TopBar } from './userActivity';


const PersonalStats = () => {
    const router = useRouter()
    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <TopBar>
                    <Pressable 
                        onPress={() => router.back()}
                    >
                        <MoveLeft size={26} />
                    </Pressable>
                    <ScreenTitleText>Personal Statistics</ScreenTitleText>
                    <View></View>
                </TopBar>
                <PinDashboard />
                <CsrDashboard />
            </ScrollContainer>
        </SafeAreaViewContainer>
    )
}

export default PersonalStats


const PinDashboard = () => {
    // Always start with a safe, valid chart structure
    const emptyChart = { labels: [] as string[], datasets: [{ data: [] as number[] }] };

    const [clickData, setClickData] = useState(emptyChart);
    const [acceptData, setAcceptData] = useState(emptyChart);
    const [completeData, setCompleteData] = useState(emptyChart);
    const [loading, setLoading] = useState(true);
    const [hadError, setHadError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        setHadError(null);
        try {
            const data = await getPinDashboardData();
            console.log('PIN dashboard raw:', data);

            if (!Array.isArray(data) || data.length === 0) {
            setHadError('No valid data returned from Supabase');
            setLoading(false);
            return;
            }

            // Build arrays; coerce everything to numbers
            const months = data.map((it: any) => String(it.month ?? ''));
            const clicks = data.map((it: any) => Number(it.clicks ?? 0));
            const accepts = data.map((it: any) => Number(it.acceptances ?? 0));
            const completes = data.map((it: any) => Number(it.completions ?? 0));

            // If all zeros and all labels empty, treat as no data
            const allEmpty =
            months.every((m) => m === '') ||
            (clicks.length === 0 && accepts.length === 0 && completes.length === 0);

            if (allEmpty) {
            setHadError('No valid data returned from Supabase');
            setLoading(false);
            return;
            }

            setClickData({
            labels: months,
            datasets: [{ data: clicks}]
            // datasets: [{ data: clicks, strokeWidth: 3, color: () => `#FF6347` }],
            });

            setAcceptData({
            labels: months,
            datasets: [{ data: accepts}]
            // datasets: [{ data: accepts, strokeWidth: 3, color: () => `#32CD32` }],
            });

            setCompleteData({
            labels: months,
            datasets: [{ data: completes}]
            // datasets: [{ data: completes, strokeWidth: 3, color: () => `#1E90FF` }],
            });
        } catch (e) {
            console.error('Error fetching PIN dashboard:', e);
            setHadError('Failed to load data');
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, []);

    // Only render a chart when there is actual numeric data
    const hasData = (c: typeof clickData) => c.datasets?.[0]?.data?.length > 0;

    const chartConfig = {
        backgroundColor: '#1E2923',
        backgroundGradientFrom: '#08130D',
        backgroundGradientTo: '#1E2923',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
        style: { borderRadius: 16 },
    };

    return (
        <PinContainer>
        <Text>Your Request Stats:</Text>

        <Section>
            <Text>People Clicking:</Text>
            {hasData(clickData) ? (
            <LineChart
                data={clickData}
                width={Dimensions.get('window').width - 50}
                height={220}
                chartConfig={chartConfig}
                withDots
                withInnerLines={false}
                withOuterLines={false}
            />
            ) : (
            <Text style={{ opacity: 0.6 }}>{loading ? 'Loading…' : 'No data'}</Text>
            )}
        </Section>

        <Section>
            <Text>People Accepting:</Text>
            {hasData(acceptData) ? (
            <LineChart
                data={acceptData}
                width={Dimensions.get('window').width - 50}
                height={220}
                chartConfig={chartConfig}
                withDots
                withInnerLines={false}
                withOuterLines={false}
            />
            ) : (
            <Text style={{ opacity: 0.6 }}>{loading ? 'Loading…' : 'No data'}</Text>
            )}
        </Section>

        <Section>
            <Text>People Completing:</Text>
            {hasData(completeData) ? (
            <LineChart
                data={completeData}
                width={Dimensions.get('window').width - 50}
                height={220}
                chartConfig={chartConfig}
                withDots
                withInnerLines={false}
                withOuterLines={false}
            />
            ) : (
            <Text style={{ opacity: 0.6 }}>{loading ? 'Loading…' : 'No data'}</Text>
            )}
        </Section>

        {!!hadError && <Text style={{ color: '#d33', marginTop: 8 }}>{hadError}</Text>}
        </PinContainer>
    );
};

/** ----------- (stub) CSR dashboard so file compiles ----------- */
const CsrDashboard = () => <View />;

/* ---------------- styles ---------------- */
const Section = styled.View`
    margin-top: 10px;
    margin-bottom: 16px;
`;

const PinContainer = styled.View`
    margin-top: 20px;
    padding: 10px;
    background-color: #f0f0f0;
`;
