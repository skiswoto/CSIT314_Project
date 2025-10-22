import { StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { useCreateListingStore } from "@/global/createListingStore";
import { StyleSheet } from "react-native";
import { styled } from "styled-components/native";
import CreateRequestFormTemplate from "../createRequestFormTemplate";


const Step3 = () => {
    const { streetAddress, unitLevel, buildingName, postCode, setStreetAddress, setUnitLevel, setBuildingName, setPostCode } = useCreateListingStore()
    return (
        <CreateRequestFormTemplate>
            <StepTitle>Where should we send help?</StepTitle>
            <StepSubTitle>Let us know the exact location; street address, building, and postal code.</StepSubTitle>
            <>
                <TopCard
                    placeholder="Street Address"
                    placeholderTextColor="#A8A8A8"
                    style={styles.cardText}
                    value={streetAddress}
                    onChangeText={(text) => setStreetAddress(text)}
                />
                <Card 
                    placeholder="Unit, level (if applicable)"
                    placeholderTextColor="#A8A8A8"
                    style={styles.cardText} 
                    value={unitLevel}
                    onChangeText={(text) => setUnitLevel(text)}
                />
                <Card3 
                    placeholder="Building name (if applicable)"
                    placeholderTextColor="#A8A8A8"
                    style={styles.cardText}
                    value={buildingName}
                    onChangeText={(text) => setBuildingName(text)}
                />
                <BottomCard 
                    placeholder="Postcode"
                    placeholderTextColor="#A8A8A8"
                    style={styles.cardText}
                    value={postCode}
                    onChangeText={(text) => setPostCode(text)}
                />
            </>
        </CreateRequestFormTemplate>
    )
}

export default Step3

const styles = StyleSheet.create({
    cardText: {
        fontSize: 16,
        fontWeight: 500,
    }
})

const Card = styled.TextInput`
    flex-direction: row;
    border-width: 1px;
    border-color: #ccc;
    padding-horizontal: 16px;
    padding-vertical: 20px;
    align-items: center;
    justify-content: space-between;
`
const TopCard = styled(Card)`
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    border-bottom-width: 0px;
`
const BottomCard = styled(Card)`
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    border-top-width: 0px;
`
const Card3 = styled(Card)`
    border-top-width: 0px;
`
