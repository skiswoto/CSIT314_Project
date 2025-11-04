import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, FileText, MapPin, Table, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer } from '../../constants/GlobalStyles';
import { exportAnalyticsJSON, exportToCSV, exportToText } from '../../services/export';
import { getAllListings } from '../../services/listings';

const Analytics = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch completed listings
  const { data: completedListings, isLoading } = useQuery({
    queryKey: ['analytics-completed'],
    queryFn: () => getAllListings({ 
      locations: [],
      serviceTypes: [],
      urgencies: [],
      dateRange: { start: null, end: null },
      status: 'completed' 
    }),
  });

  // Calculate statistics
  const totalCompleted = completedListings?.length || 0;
  
  const categoryCounts = completedListings?.reduce((acc, listing) => {
    acc[listing.category] = (acc[listing.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const mostCommonCategory = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const totalHours = completedListings?.reduce((sum, listing) => 
    sum + (parseInt(listing.duration as string) || 0), 0
  ) || 0;

  const locationCounts = completedListings?.reduce((acc, listing) => {
    const location = listing.street_address.split(',')[0]; // Get first part of address
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topLocations = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // Export handlers
  const handleExportText = async () => {
    if (!completedListings || completedListings.length === 0) {
      Alert.alert('No data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportToText(completedListings);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!completedListings || completedListings.length === 0) {
      Alert.alert('No data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportToCSV(completedListings);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!completedListings || completedListings.length === 0) {
      Alert.alert('No data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportAnalyticsJSON(completedListings, {
        totalCompleted,
        totalHours,
        categoryCounts,
        locationCounts,
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaViewContainer>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#2563EB" />
          <LoadingText>Loading analytics...</LoadingText>
        </LoadingContainer>
      </SafeAreaViewContainer>
    );
  }

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <HeaderSection>
          <PageTitle>Service Analytics</PageTitle>
          <PageSubtitle>Track your volunteer impact</PageSubtitle>
        </HeaderSection>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          <ContentContainer>
            {/* Summary Cards */}
            <SummarySection>
              <SummaryCard backgroundColor="#DBEAFE">
                <CardIcon>
                  <BarChart3 size={28} color="#1E40AF" />
                </CardIcon>
                <CardValue>{totalCompleted}</CardValue>
                <CardLabel>Completed Services</CardLabel>
              </SummaryCard>

              <SummaryCard backgroundColor="#FEF3C7">
                <CardIcon>
                  <TrendingUp size={28} color="#92400E" />
                </CardIcon>
                <CardValue>{totalHours}h</CardValue>
                <CardLabel>Total Hours</CardLabel>
              </SummaryCard>
            </SummarySection>

            {/* Most Common Category */}
            <InsightSection>
              <SectionHeader>
                <SectionTitle>Most Common Service</SectionTitle>
              </SectionHeader>
              <HighlightCard>
                <HighlightValue>{mostCommonCategory}</HighlightValue>
                <HighlightLabel>
                  {categoryCounts[mostCommonCategory] || 0} service{(categoryCounts[mostCommonCategory] || 0) !== 1 ? 's' : ''}
                </HighlightLabel>
              </HighlightCard>
            </InsightSection>

            {/* Services by Category */}
            <InsightSection>
              <SectionHeader>
                <SectionTitle>Services by Category</SectionTitle>
              </SectionHeader>
              {Object.entries(categoryCounts).map(([category, count]) => (
                <BarItem key={category}>
                  <BarLabel>{category}</BarLabel>
                  <BarContainer>
                    <BarFill 
                      width={`${(count / totalCompleted) * 100}%`}
                    >
                      <BarCount>{count}</BarCount>
                    </BarFill>
                  </BarContainer>
                </BarItem>
              ))}
            </InsightSection>

            {/* Top Locations */}
            <InsightSection>
              <SectionHeader>
                <MapPin size={20} color="#111827" />
                <SectionTitle>Top Locations Served</SectionTitle>
              </SectionHeader>
              {topLocations.map(([location, count], index) => (
                <LocationItem key={location}>
                  <LocationRank>#{index + 1}</LocationRank>
                  <LocationName>{location}</LocationName>
                  <LocationCount>{count} service{count !== 1 ? 's' : ''}</LocationCount>
                </LocationItem>
              ))}
              {topLocations.length === 0 && (
                <EmptyText>No location data available</EmptyText>
              )}
            </InsightSection>

            {/* Export Options */}
            <ExportSection>
              <SectionHeader>
                <Download size={20} color="#111827" />
                <SectionTitle>Export Data</SectionTitle>
              </SectionHeader>
              
              <ExportOptionsGrid>
                <ExportOptionCard 
                  onPress={handleExportText}
                  disabled={isExporting || !completedListings || completedListings.length === 0}
                >
                  <ExportIconContainer backgroundColor="#DBEAFE">
                    <FileText size={24} color="#1E40AF" />
                  </ExportIconContainer>
                  <ExportOptionLabel>Text Report</ExportOptionLabel>
                  <ExportOptionDescription>Formatted report</ExportOptionDescription>
                </ExportOptionCard>

                <ExportOptionCard 
                  onPress={handleExportCSV}
                  disabled={isExporting || !completedListings || completedListings.length === 0}
                >
                  <ExportIconContainer backgroundColor="#DCFCE7">
                    <Table size={24} color="#166534" />
                  </ExportIconContainer>
                  <ExportOptionLabel>CSV Export</ExportOptionLabel>
                  <ExportOptionDescription>Excel compatible</ExportOptionDescription>
                </ExportOptionCard>

                <ExportOptionCard 
                  onPress={handleExportJSON}
                  disabled={isExporting || !completedListings || completedListings.length === 0}
                >
                  <ExportIconContainer backgroundColor="#FEF3C7">
                    <BarChart3 size={24} color="#92400E" />
                  </ExportIconContainer>
                  <ExportOptionLabel>JSON Data</ExportOptionLabel>
                  <ExportOptionDescription>With analytics</ExportOptionDescription>
                </ExportOptionCard>
              </ExportOptionsGrid>

              {isExporting && (
                <ExportingIndicator>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <ExportingText>Preparing export...</ExportingText>
                </ExportingIndicator>
              )}
            </ExportSection>
          </ContentContainer>
        </ScrollView>
      </SafeAreaViewContainer>
    </>
  );
};

export default Analytics;

// Styled Components
const HeaderSection = styled.View`
  padding: 20px;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #E5E7EB;
`;

const PageTitle = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const PageSubtitle = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

const ContentContainer = styled.View`
  padding: 20px;
`;

const SummarySection = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.View<{ backgroundColor: string }>`
  flex: 1;
  background-color: ${props => props.backgroundColor};
  border-radius: 16px;
  padding: 20px;
  align-items: center;
`;

const CardIcon = styled.View`
  margin-bottom: 12px;
`;

const CardValue = styled.Text`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const CardLabel = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  text-align: center;
`;

const InsightSection = styled.View`
  margin-bottom: 24px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const HighlightCard = styled.View`
  background-color: #F3F4F6;
  border-radius: 12px;
  padding: 24px;
  align-items: center;
`;

const HighlightValue = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const HighlightLabel = styled.Text`
  font-size: 14px;
  color: #6B7280;
`;

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
  background-color: #2563EB;
  justify-content: center;
  padding-horizontal: 12px;
`;

const BarCount = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const LocationItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background-color: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const LocationRank = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #2563EB;
  width: 40px;
`;

const LocationName = styled.Text`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`;

const LocationCount = styled.Text`
  font-size: 12px;
  color: #6B7280;
`;

const ExportSection = styled.View`
  margin-top: 24px;
`;

const ExportOptionsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const ExportOptionCard = styled.TouchableOpacity<{ disabled?: boolean }>`
  flex: 1;
  min-width: 30%;
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  align-items: center;
  border-width: 1px;
  border-color: #E5E7EB;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const ExportIconContainer = styled.View<{ backgroundColor: string }>`
  width: 56px;
  height: 56px;
  background-color: ${props => props.backgroundColor};
  border-radius: 28px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const ExportOptionLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 4px;
`;

const ExportOptionDescription = styled.Text`
  font-size: 12px;
  color: #6B7280;
  text-align: center;
`;

const ExportingIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background-color: #F3F4F6;
  border-radius: 8px;
`;

const ExportingText = styled.Text`
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 12px;
  font-size: 14px;
  color: #6B7280;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: #9CA3AF;
  text-align: center;
  padding: 20px;
`;