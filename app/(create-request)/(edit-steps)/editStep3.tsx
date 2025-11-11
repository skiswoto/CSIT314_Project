import { StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { useCreateListingStore } from "@/global/createListingStore";
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from "react-native";
import { styled } from "styled-components/native";
import EditRequestFormTemplate from "./EditRequestFormTemplate";

const EditStep3 = () => {
  const params = useLocalSearchParams();
  const listingData = params.listingData ? JSON.parse(params.listingData as string) : null;
  if (!listingData) return null;

  const { streetAddress, unitLevel, buildingName, postCode, setStreetAddress, setUnitLevel, setBuildingName, setPostCode } = useCreateListingStore();

  return (
    <EditRequestFormTemplate listingId={listingData.id} originalData={listingData}>
      <StepTitle>Where should we send help?</StepTitle>
      <StepSubTitle>Let us know the exact location; street address, building, and postal code.</StepSubTitle>

      <TopCard
        placeholder="Street Address"
        placeholderTextColor="#A8A8A8"
        style={styles.cardText}
        value={streetAddress}
        onChangeText={setStreetAddress}
      />
      <Card
        placeholder="Unit, level (if applicable)"
        placeholderTextColor="#A8A8A8"
        style={styles.cardText}
        value={unitLevel}
        onChangeText={setUnitLevel}
      />
      <Card3
        placeholder="Building name (if applicable)"
        placeholderTextColor="#A8A8A8"
        style={styles.cardText}
        value={buildingName}
        onChangeText={setBuildingName}
      />
      <BottomCard
        placeholder="Postcode"
        placeholderTextColor="#A8A8A8"
        style={styles.cardText}
        value={postCode}
        onChangeText={setPostCode}
      />
    </EditRequestFormTemplate>
  );
};

export default EditStep3;

const styles = StyleSheet.create({
  cardText: {
    fontSize: 16,
    fontWeight: '500' as any,
  },
});

const Card = styled.TextInput`
  flex-direction: row;
  border-width: 1px;
  border-color: #ccc;
  padding-horizontal: 16px;
  padding-vertical: 20px;
`;

const TopCard = styled(Card)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  border-bottom-width: 0px;
`;

const BottomCard = styled(Card)`
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  border-top-width: 0px;
`;

const Card3 = styled(Card)`
  border-top-width: 0px;
`;
