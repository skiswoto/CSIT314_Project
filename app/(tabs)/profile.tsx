import { userAuthStore } from '@/global/userAuthStore';
import { supabase } from '@/libs/supabase';
import { getPinDashboardData } from '@/libs/supabaseHelper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import styled from 'styled-components/native';
import { H1, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';

const Profile = () => {
  const user = userAuthStore((s) => s.user);
  const userName = user?.user_metadata.name;
  const userRole = user?.user_metadata.role;
  const router = useRouter();

<<<<<<< HEAD
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      userAuthStore.setState({ user: null });
      router.push('/(user-auth)/signUp');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
=======
    return (
        <>
            <SafeAreaViewContainer>
                <ScrollContainer>
                    {user ? 
                        <H1>Hi {userName}!</H1> 
                        : 
                        <H1>profile</H1>
                    }
                    <Link href="../(user-auth)/signUp" asChild>
                        <LoginButton>
                            <LoginButtonText>Log in or sign up</LoginButtonText>
                        </LoginButton>
                    </Link>
                    <Link href="../(report)/generateReport" asChild>
                        <ViewStatsButton>
                            <ViewStatsButtonText>View Stats as (PM)</ViewStatsButtonText>
                        </ViewStatsButton>
                    </Link>
                </ScrollContainer>
            </SafeAreaViewContainer>
        </>
    )
}
>>>>>>> origin/dev

  const handleLogin = () => router.push('/(user-auth)/signUp');

  return (
    <SafeAreaViewContainer>
      <ScrollContainer>
        {user ? <H1>Hi {userName}!</H1> : <H1>Profile</H1>}
        {userRole === 'pin' ? (
          <PinDashboard />
        ) : userRole === 'csr_rep' ? (
          <CsrDashboard />
        ) : (
          <Text>Please log in to view your dashboard</Text>
        )}

        {user && (
          <LogoutButton onPress={handleLogout}>
            <LogoutButtonText>Log Out</LogoutButtonText>
          </LogoutButton>
        )}

        {!user && (
          <LoginButton onPress={handleLogin}>
            <LoginButtonText>Log In</LoginButtonText>
          </LoginButton>
        )}
      </ScrollContainer>
    </SafeAreaViewContainer>
  );
};

/** ---------------- PIN DASHBOARD ---------------- */
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
          datasets: [{ data: clicks, strokeWidth: 3, color: () => `#FF6347` }],
        });

        setAcceptData({
          labels: months,
          datasets: [{ data: accepts, strokeWidth: 3, color: () => `#32CD32` }],
        });

        setCompleteData({
          labels: months,
          datasets: [{ data: completes, strokeWidth: 3, color: () => `#1E90FF` }],
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

const LogoutButton = styled.Pressable`
  background-color: #ff6347;
  padding: 10px;
  border-radius: 10px;
  margin-top: 20px;
  width: 95%;
  align-self: center;
`;

const LoginButton = styled.Pressable`
  background-color: #000;
  padding: 10px;
  border-radius: 10px;
  margin-top: 20px;
  width: 95%;
  align-self: center;
`;

const LogoutButtonText = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  align-self: center;
`;

const LoginButtonText = styled.Text`
<<<<<<< HEAD
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  align-self: center;
`;

export default Profile;
=======
    color: #ffffff;
    font-weight: 600;
    font-size: 18px;
    padding-vertical: 16px;
    align-self: center;
`
const ViewStatsButton = styled(LoginButton)`
    background-color: #D0D0D0;
    width: 55%;
`
const ViewStatsButtonText = styled(LoginButtonText)`
    color: #000000;
`
>>>>>>> origin/dev
