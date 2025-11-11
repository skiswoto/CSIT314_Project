import { SafeAreaViewContainer } from '@/constants/GlobalStyles';
import { supabase } from '@/libs/supabase';
import { sendListingStatusEmail } from '@/services/emailNotifications';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';

type EditRequestFormTemplateProps = {
  listingData: any;
};

const EditRequestFormTemplate = ({ listingData }: EditRequestFormTemplateProps) => {
  const router = useRouter();
  
  // Local state for form fields
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [listingDate, setListingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [unitLevel, setUnitLevel] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [postCode, setPostCode] = useState('');
  
  // Store original data for comparison
  const [originalData, setOriginalData] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (listingData) {
      // Store original data
      setOriginalData(listingData);
      
      // Pre-fill form
      setDescription(listingData.description || '');
      setCategory(listingData.category || '');
      setUrgency(listingData.urgency || '');
      setListingDate(listingData.listing_date || '');
      setStartTime(listingData.start_time || '');
      setDuration(listingData.duration || '');
      setStreetAddress(listingData.street_address || '');
      setUnitLevel(listingData.unit_level || '');
      setBuildingName(listingData.building_name || '');
      setPostCode(listingData.post_code || '');
    }
  }, [listingData]);

  // Track what changed
  const getChanges = (original: any, updated: any) => {
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
    
    if (original.description !== updated.description) {
      changes.push({ 
        field: 'Description', 
        oldValue: original.description || 'N/A', 
        newValue: updated.description || 'N/A' 
      });
    }
    if (original.category !== updated.category) {
      changes.push({ 
        field: 'Category', 
        oldValue: original.category || 'N/A', 
        newValue: updated.category || 'N/A' 
      });
    }
    if (original.urgency !== updated.urgency) {
      changes.push({ 
        field: 'Urgency', 
        oldValue: original.urgency || 'N/A', 
        newValue: updated.urgency || 'N/A' 
      });
    }
    if (original.street_address !== updated.street_address) {
      changes.push({ 
        field: 'Address', 
        oldValue: original.street_address || 'N/A', 
        newValue: updated.street_address || 'N/A' 
      });
    }
    if (original.start_time !== updated.start_time) {
      changes.push({ 
        field: 'Start Time', 
        oldValue: original.start_time || 'N/A', 
        newValue: updated.start_time || 'N/A' 
      });
    }
    if (original.duration !== updated.duration) {
      changes.push({ 
        field: 'Duration', 
        oldValue: original.duration || 'N/A', 
        newValue: updated.duration || 'N/A' 
      });
    }
    
    return changes;
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      // Validate listing ID exists
      if (!listingData?.id) {
        Alert.alert('Error', 'Invalid listing ID');
        return;
      }

      // Prepare the updated listing data
      const updatedListingData = {
        description: description || '',
        category: category || '',
        urgency: urgency || '',
        listing_date: listingDate || '',
        start_time: startTime || '',
        duration: duration || '',
        street_address: streetAddress || '',
        unit_level: unitLevel || '',
        building_name: buildingName || '',
        post_code: postCode || '',
      };

      console.log('Updating listing ID:', listingData.id);
      console.log('Update data:', updatedListingData);

      // Update the listing in database
      const { data: updateResult, error: updateError } = await supabase
        .from('Listings')
        .update(updatedListingData)
        .eq('id', Number(listingData.id))
        .select();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Update successful:', updateResult);

      // Track changes
      const changes = getChanges(originalData, updatedListingData);

      // Send email notification if there were changes
      if (changes.length > 0) {
        try {
          await sendListingStatusEmail({
            listingId: String(listingData.id),
            category: updatedListingData.category,
            description: updatedListingData.description,
            address: updatedListingData.street_address,
            startTime: updatedListingData.start_time,
            duration: updatedListingData.duration || 'N/A',
            emailType: 'edited',
            recipientEmail: 'monasterypin@gmail.com',
            changes: changes
          });
          
          console.log('✅ Edit notification email sent');
        } catch (emailError) {
          console.error('❌ Failed to send edit notification email:', emailError);
          // Don't fail the update if email fails
        }
      }

      Alert.alert(
        'Success', 
        'Listing updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    } catch (e: any) {
      console.error('Update error:', e);
      Alert.alert('Error', e?.message || 'Failed to update listing. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <Container>
          <Header>
            <BackButton onPress={handleCancel}>
              <ArrowLeft size={24} color="#111827" />
            </BackButton>
            <HeaderTitle>Edit Listing</HeaderTitle>
            <Spacer />
          </Header>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <FormSection>
              <SectionTitle>Basic Information</SectionTitle>
              
              <FieldLabel>Description *</FieldLabel>
              <FieldInput 
                value={description} 
                onChangeText={setDescription}
                placeholder="Describe the request" 
                multiline 
                numberOfLines={4}
              />

              <FieldLabel>Category *</FieldLabel>
              <FieldInput 
                value={category} 
                onChangeText={setCategory}
                placeholder="medical, transport, household, groceries, emotional" 
              />

              <FieldLabel>Urgency *</FieldLabel>
              <FieldInput 
                value={urgency} 
                onChangeText={setUrgency}
                placeholder="High, Medium, Low" 
              />
            </FormSection>

            <FormSection>
              <SectionTitle>Schedule</SectionTitle>
              
              <FieldLabel>Start Date *</FieldLabel>
              <FieldInput 
                value={listingDate} 
                onChangeText={setListingDate}
                placeholder="YYYY-MM-DD" 
              />

              <FieldLabel>Start Time *</FieldLabel>
              <FieldInput 
                value={startTime} 
                onChangeText={setStartTime}
                placeholder="HH:MM:SS or HH:MM" 
              />

              <FieldLabel>Duration</FieldLabel>
              <FieldInput 
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 60 minutes or 2 hours" 
              />
            </FormSection>

            <FormSection>
              <SectionTitle>Location</SectionTitle>
              
              <FieldLabel>Street Address *</FieldLabel>
              <FieldInput 
                value={streetAddress} 
                onChangeText={setStreetAddress}
                placeholder="Street Address" 
              />

              <FieldLabel>Unit Level</FieldLabel>
              <FieldInput 
                value={unitLevel} 
                onChangeText={setUnitLevel}
                placeholder="Unit Level (optional)" 
              />

              <FieldLabel>Building Name</FieldLabel>
              <FieldInput 
                value={buildingName} 
                onChangeText={setBuildingName}
                placeholder="Building Name (optional)" 
              />

              <FieldLabel>Post Code *</FieldLabel>
              <FieldInput 
                value={postCode} 
                onChangeText={setPostCode}
                placeholder="Post Code" 
                keyboardType="numeric"
              />
            </FormSection>
          </ScrollView>

          <ButtonContainer>
            <CancelButton onPress={handleCancel}>
              <CancelButtonText>Cancel</CancelButtonText>
            </CancelButton>
            
            <UpdateButton onPress={handleUpdate} disabled={isUpdating}>
              <UpdateButtonText>
                {isUpdating ? 'Updating...' : 'Update Listing'}
              </UpdateButtonText>
            </UpdateButton>
          </ButtonContainer>
        </Container>
      </SafeAreaViewContainer>
    </>
  );
};

export default EditRequestFormTemplate;

const Container = styled.View`
  flex: 1;
  background-color: #FCFCFC;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #FFFFFF;
  border-bottom-width: 1px;
  border-bottom-color: #E5E7EB;
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const Spacer = styled.View`
  width: 40px;
`;

const FormSection = styled.View`
  background-color: #FFFFFF;
  padding: 20px;
  margin: 16px 20px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
`;

const FieldLabel = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  margin-top: 8px;
`;

const FieldInput = styled.TextInput`
  border-width: 1px;
  border-color: #D1D5DB;
  border-radius: 8px;
  padding: 12px;
  min-height: 48px;
  color: #111827;
  background-color: #F9FAFB;
  font-size: 14px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  padding: 16px 20px;
  background-color: #FFFFFF;
  border-top-width: 1px;
  border-top-color: #E5E7EB;
  gap: 12px;
`;

const CancelButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #F3F4F6;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
`;

const CancelButtonText = styled.Text`
  color: #374151;
  font-size: 16px;
  font-weight: 600;
`;

const UpdateButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  flex: 2;
  background-color: ${props => props.disabled ? '#9CA3AF' : '#111827'};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
`;

const UpdateButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
`;