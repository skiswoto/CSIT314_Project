import { useCreateListingStore } from '@/global/createListingStore';
import { supabase } from '@/libs/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { styled } from 'styled-components/native';

const EditListingPage = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    setDescription,
    setCategory,
    setUrgency,
    setDate,
    setTime,
    setDuration,
    setStreetAddress,
    setUnitLevel,
    setBuildingName,
    setPostCode,
    setSupportingDocuments,
    setStep
  } = useCreateListingStore();

  useEffect(() => {
    const fetchAndLoadListing = async () => {
      if (!id) {
        Alert.alert('Error', 'No listing ID provided');
        router.back();
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch the listing
        const { data, error } = await supabase
          .from('Listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error('Error fetching listing:', error);
          Alert.alert('Error', 'Failed to load the listing data.');
          router.back();
          return;
        }

        console.log('📥 Fetched listing data:', data);

        // Pre-fill the store with existing data
        setDescription(data.description || '');
        setCategory(data.category || undefined);
        setUrgency(data.urgency || undefined);
        
        // Parse date from listing_date
        if (data.listing_date) {
          const listingDate = new Date(data.listing_date);
          setDate(listingDate);
          console.log('📅 Parsed date:', listingDate.toLocaleDateString());
        }
        
        if (data.start_time) {
          let timestampString = data.start_time;
          
          // Clean up the timestamp and ensure it's treated as UTC
          // Handle different formats from Supabase:
          // - "2025-11-20T10:30:00" (no Z)
          // - "2025-11-20T10:30:00Z" (with Z)
          // - "2025-11-20 10:30:00" (space instead of T)
          // - "2025-11-20 10:30:00+00" (with timezone)
          
          // Replace space with T if needed
          timestampString = timestampString.replace(' ', 'T');
          
          // Remove timezone offset if present (e.g., +00, +08:00)
          timestampString = timestampString.replace(/([+-]\d{2}):?(\d{2})?$/, '');
          
          // Add Z if not present (tells JS it's UTC)
          if (!timestampString.endsWith('Z')) {
            timestampString = timestampString.split('.')[0] + 'Z'; // Remove microseconds and add Z
          }
          
          const utcDate = new Date(timestampString);
          
          console.log('🕐 DB timestamp (raw):', data.start_time);
          console.log('🕐 Cleaned timestamp:', timestampString);
          console.log('🕐 Parsed UTC:', utcDate.toISOString());
          console.log('🕐 Local display:', utcDate.toLocaleString());
          console.log('🕐 Local time:', utcDate.toLocaleTimeString());
          console.log('🕐 Hours (local):', utcDate.getHours());
          
          setTime(utcDate);
        }
        
        // Parse duration from interval
        if (data.duration) {
          console.log('⏱️ Raw duration from DB:', data.duration);
          
          let totalMinutes = 0;
          
          // Handle "XXX minutes" format
          if (typeof data.duration === 'string' && data.duration.includes('minutes')) {
            const match = data.duration.match(/(\d+)\s*minutes?/);
            if (match) {
              totalMinutes = parseInt(match[1]);
            }
          } 
          // Handle "HH:MM:SS" format
          else if (typeof data.duration === 'string' && data.duration.includes(':')) {
            const parts = data.duration.split(':');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            totalMinutes = hours * 60 + minutes;
          }
          // Handle object format
          else if (typeof data.duration === 'object' && data.duration !== null) {
            const durationObj = data.duration as any;
            totalMinutes = (durationObj.hours || 0) * 60 + (durationObj.minutes || 0);
          }
          
          console.log('⏱️ Parsed total minutes:', totalMinutes);
          
          if (totalMinutes > 0) {
            const durationDate = new Date();
            durationDate.setHours(Math.floor(totalMinutes / 60));
            durationDate.setMinutes(totalMinutes % 60);
            durationDate.setSeconds(0);
            setDuration(durationDate);
            console.log('⏱️ Duration set to:', `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`);
          }
        }
        
        // Set address fields
        setStreetAddress(data.street_address || '');
        setUnitLevel(data.unit_level || '');
        setBuildingName(data.building_name || '');
        setPostCode(data.post_code || '');
        
        // Reset step to 0 (start from editStep1)
        setStep(0);
        
        setIsLoading(false);
        
        // Navigate to editStep1 with the listing data
        router.replace({
          pathname: '/(create-request)/(edit-steps)/editStep1',
          params: { listingData: JSON.stringify(data) }
        });

      } catch (e) {
        console.error('Error loading listing:', e);
        Alert.alert('Error', 'There was an error loading your listing.');
        setIsLoading(false);
        router.back();
      }
    };

    fetchAndLoadListing();
  }, [id]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#2B61A6" />
        <LoadingText>Loading listing...</LoadingText>
      </LoadingContainer>
    );
  }

  return null;
};

export default EditListingPage;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FCFCFC;
`;

const LoadingText = styled.Text`
  margin-top: 16px;
  font-size: 16px;
  color: #6B7280;
`;