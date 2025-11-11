import { supabase } from '@/libs/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import EditRequestFormTemplate from './EditRequestFormTemplate';

const EditListingPage = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [listingData, setListingData] = useState(null);

  useEffect(() => {
    const fetchListingData = async () => {
      if (!id) return; // Ensure there's an id
      try {
        const { data, error } = await supabase
          .from('Listings')
          .select('*')
          .eq('id', id)
          .single(); // Fetch the listing with the provided ID

        if (error || !data) {
          console.error('Error fetching listing:', error); // Log the error
          Alert.alert('Error', 'Failed to load the listing data.');
          return;
        }

        setListingData(data); // Set fetched data to state
      } catch (e) {
        console.error('Error fetching listing data:', e); // Log the error
        Alert.alert('Error', 'There was an error loading your listing.');
      }
    };

    fetchListingData();
  }, [id]);

  if (!listingData) {
    return <ActivityIndicator />; // Show a loading indicator while data is being fetched
  }

  return <EditRequestFormTemplate listingData={listingData} />; // Pass the data to your form
};

export default EditListingPage;
