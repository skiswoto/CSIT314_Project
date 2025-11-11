import { SafeAreaViewContainer } from '@/constants/GlobalStyles';
import { useCreateListingStore } from '@/global/createListingStore';
import { userAuthStore } from '@/global/userAuthStore';
import { supabase } from '@/libs/supabase';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';

type EditRequestFormTemplateProps = {
  listingData: any; // Accept the entire listing data as a prop
};

const EditRequestFormTemplate = ({ listingData }: EditRequestFormTemplateProps) => {
  const { setFormFields, description, category, urgency, date, time, duration, streetAddress, unitLevel, buildingName, postCode, currentStep, nextStep, previousStep, cancelProgress } = useCreateListingStore();
  const { user } = userAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (listingData) {
      // Pre-fill form with existing listing data
      setFormFields({
        description: listingData.description || '',
        category: listingData.category || '',
        urgency: listingData.urgency || '',
        date: listingData.listing_date ? new Date(listingData.listing_date) : (listingData.date ? new Date(listingData.date) : null),
        time: listingData.start_time ? new Date(listingData.start_time) : (listingData.time ? new Date(listingData.time) : null),
        duration: listingData.duration || '',
        streetAddress: listingData.street_address || '',
        unitLevel: listingData.unit_level || '',
        buildingName: listingData.building_name || '',
        postCode: listingData.post_code || '',
      });
    }
  }, [listingData, setFormFields]);

  const stepsArray = [
    '/(create-request)/(steps)/step1',
    '/(create-request)/(steps)/step2',
    '/(create-request)/(steps)/step3',
    '/(create-request)/(steps)/step4',
  ] as const;

  const isLastStep = currentStep >= stepsArray.length - 1;

  const handleNextStep = async () => {
    const lastIndex = stepsArray.length - 1;
    if (currentStep >= lastIndex) {
      try {
        const durationInterval = duration
          ? (() => {
              const hours = duration.getHours();
              const minutes = duration.getMinutes();
              const totalMinutes = hours * 60 + minutes;
              return totalMinutes > 0 ? `${totalMinutes} minutes` : null;
            })()
          : null;

        // Prepare the listing data to be updated
        const listingData = {
          description: description || '',
          category: category || '',
          urgency: urgency || '',
          listing_date: date?.toISOString().split('T')[0] || '',
          start_time: time?.toISOString() || '',
          duration: durationInterval,
          street_address: streetAddress || '',
          unit_level: unitLevel || '',
          building_name: buildingName || '',
          post_code: postCode || '',
          created_by: user?.id,
        };

        const { error: updateError } = await supabase
          .from('Listings')
          .update(listingData)
          .eq('id', listingData.id);

        if (updateError) {
          throw updateError;
        }

        Alert.alert('Success', 'Listing updated successfully!');
        router.push('/(tabs)/home');
        cancelProgress();
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to update listing. Please try again.');
      }
      return;
    }

    const nextIndex = Math.min(currentStep + 1, lastIndex);
    nextStep();
    router.push(stepsArray[nextIndex]);
  };

  const handlePreviousStep = () => {
    if (currentStep <= 0) return;
    previousStep();
    router.back();
  };

  const handleCancel = () => {
    cancelProgress();
    router.replace('/(tabs)/home');
  };

  return (
    <>
      <StatusBar />
      <SafeAreaViewContainer>
        <ScreenContainer>
          <TopSection onPress={handleCancel}>
            <X size={30} />
          </TopSection>
          <Content>
            <FieldLabel>Description</FieldLabel>
            <FieldInput value={description} onChangeText={(text) => setFormFields({ description: text })} placeholder="Describe the request" multiline />

            <FieldLabel>Category</FieldLabel>
            <FieldInput value={category} onChangeText={(text) => setFormFields({ category: text })} placeholder="Category" />

            <FieldLabel>Urgency</FieldLabel>
            <FieldInput value={urgency} onChangeText={(text) => setFormFields({ urgency: text })} placeholder="Urgency" />

            <FieldLabel>Start Date</FieldLabel>
            <FieldInput value={date ? date.toISOString().split('T')[0] : ''} onChangeText={(text) => setFormFields({ date: new Date(text) })} placeholder="Start Date" />

            <FieldLabel>Start Time</FieldLabel>
            <FieldInput value={time ? time.toISOString() : ''} onChangeText={(text) => setFormFields({ time: new Date(text) })} placeholder="Start Time" />

            <FieldLabel>Duration</FieldLabel>
            <FieldInput value={duration} onChangeText={(text) => setFormFields({ duration: text })} placeholder="Duration" />

            <FieldLabel>Street Address</FieldLabel>
            <FieldInput value={streetAddress} onChangeText={(text) => setFormFields({ streetAddress: text })} placeholder="Street Address" />

            <FieldLabel>Unit Level</FieldLabel>
            <FieldInput value={unitLevel} onChangeText={(text) => setFormFields({ unitLevel: text })} placeholder="Unit Level" />

            <FieldLabel>Building Name</FieldLabel>
            <FieldInput value={buildingName} onChangeText={(text) => setFormFields({ buildingName: text })} placeholder="Building Name" />

            <FieldLabel>Post Code</FieldLabel>
            <FieldInput value={postCode} onChangeText={(text) => setFormFields({ postCode: text })} placeholder="Post Code" />
          </Content>
          <BottomSection>
            <Previous onPress={handlePreviousStep}>
              <PreviousText>back</PreviousText>
            </Previous>
            <Next onPress={handleNextStep}>
              <NextText>{isLastStep ? 'Submit' : 'Next'}</NextText>
            </Next>
          </BottomSection>
        </ScreenContainer>
      </SafeAreaViewContainer>
    </>
  );
};

export default EditRequestFormTemplate;

const TopSection = styled.Pressable`
  justify-content: flex-start;
  width: 20%;
`;

const BottomSection = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const ScreenContainer = styled.View`
  flex: 1;
  padding-top: 80px;
  padding-bottom: 50px;
  padding-horizontal: 26px;
  background-color: #FCFCFC;
`;

const Content = styled.ScrollView`
  padding-vertical: 40px;
`;

const Previous = styled.Pressable`
  padding-right: 20px;
`;

const Next = styled.Pressable`
  background-color: #000000;
  padding-horizontal: 18px;
  padding-vertical: 10px;
  border-radius: 10px;
  overflow: hidden;
`;

const PreviousText = styled.Text`
  font-weight: 400;
  font-size: 18px;
  text-decoration-line: underline;
`;

const NextText = styled(PreviousText)`
  text-decoration-line: none;
  color: #ffffff;
`;

const FieldLabel = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #111827;
`;

const FieldInput = styled.TextInput`
  border-width: 1px;
  border-color: #E5E7EB;
  border-radius: 10px;
  padding: 10px;
  min-height: 70px;
  color: #111827;
  margin-bottom: 16px;
`;
