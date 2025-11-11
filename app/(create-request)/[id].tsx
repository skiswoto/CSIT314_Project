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

        // Pre-fill the store with existing data
        setDescription(data.description || '');
        setCategory(data.category || undefined);
        setUrgency(data.urgency || undefined);
        
        // Parse date
        if (data.listing_date) {
          setDate(new Date(data.listing_date));
        }
        
        // Parse time
        if (data.start_time) {
          const [hours, minutes, seconds] = data.start_time.split(':');
          const timeDate = new Date();
          timeDate.setHours(parseInt(hours) || 0);
          timeDate.setMinutes(parseInt(minutes) || 0);
          timeDate.setSeconds(parseInt(seconds) || 0);
          setTime(timeDate);
        }
        
        // Parse duration
        if (data.duration) {
          const totalMinutes = parseInt(data.duration);
          const durationDate = new Date();
          durationDate.setHours(Math.floor(totalMinutes / 60));
          durationDate.setMinutes(totalMinutes % 60);
          setDuration(durationDate);
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