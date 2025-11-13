// personalStats.tsx
import { userAuthStore } from '@/global/userAuthStore'; // ✅ NEW
import { getPinDashboardData } from '@/libs/supabaseHelper';
import { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styled } from 'styled-components/native';

const PersonalStats = () => {
  return (
    <>
      <PinDashboard />
      <CsrDashboard />
    </>
  );
};

export default PersonalStats;

const PinDashboard = () => {
  const emptyChart = { labels: [] as string[], datasets: [{ data: [] as number[] }] };

  const [clickData, setClickData] = useState(emptyChart);
  const [acceptData, setAcceptData] = useState(emptyChart);
  const [completeData, setCompleteData] = useState(emptyChart);
  const [loading, setLoading] = useState(true);
  const [hadError, setHadError] = useState<string | null>(null);

  // ✅ Get logged-in Supabase user (same store as Home)
  const user = userAuthStore((s) => s.user);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setHadError(null);

      // ✅ If no user (not logged in), show empty chart
      if (!user?.id) {
        setHadError('No user logged in');
        setLoading(false);
        return;
      }

      try {
        const data = await getPinDashboardData(user.id);   // ✅ pass profileId
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
          datasets: [{ data: clicks }],
        });

        setAcceptData({
          labels: months,
          datasets: [{ data: accepts }],
        });

        setCompleteData({
          labels: months,
          datasets: [{ data: completes }],
        });
      } catch (e) {
        console.error('Error fetching PIN dashboard:', e);
        setHadError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);   // ✅ refetch if logged-in user changes

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
      <Section>
        <SectionTitle>People Clicking:</SectionTitle>
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
        <SectionTitle>People Accepting:</SectionTitle>
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
        <SectionTitle>People Completing:</SectionTitle>
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

const CsrDashboard = () => <View />;

const Section = styled.View`
  margin-top: 10px;
  margin-bottom: 16px;
`;
const PinContainer = styled.View`
  align-self: center;
  background-color: #f0f0f0;
`;
const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
`;
