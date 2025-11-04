import { Card, CardTitle, SectionTitle, StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { useCreateListingStore } from "@/global/createListingStore";
import { Picker } from '@react-native-picker/picker';
import { FolderOpenDot } from 'lucide-react-native';
import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { styled } from "styled-components/native";
import CreateRequestFormTemplate from "../createRequestFormTemplate";

const URGENCIES = ['Low', 'Medium', 'High'] as const;


const Step1 = () => {
    const [showCategorySelection, setShowCategorySelection] = useState<boolean>(false)
    const { description, category, urgency, setDescription, setCategory, setUrgency } = useCreateListingStore()

    const handleSelectedCategory = () => [
        setShowCategorySelection(false)
    ]

    return (
        <CreateRequestFormTemplate>
            <StepTitle>What do you need help with?</StepTitle>
            <StepSubTitle>Tell us briefly what kind of help you need and select a category to continue.</StepSubTitle>
            <>
                <SectionTitle>Description</SectionTitle>
                <TextInput 
                    multiline
                    numberOfLines={5}
                    placeholder="Describe what you need help with"
                    placeholderTextColor="#878787"
                    style={styles.textArea}
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                />
                <Card onPress={() => setShowCategorySelection(true)}>
                    <CardTitle>{!category ? 'Category' : category}</CardTitle>
                    <FolderOpenDot size={28} color='#737373' />
                </Card>
                {showCategorySelection && 
                    <>
                        <PickerButton onPressIn={handleSelectedCategory}>
                            <PickerButtonText>Done</PickerButtonText>
                        </PickerButton>
                        <Picker
                            selectedValue={category}
                            onValueChange={(category) => 
                                setCategory(category)
                            }
                            itemStyle={{ color: 'black'}}
                        >
                            <Picker.Item label="Medical Assistance" value="medical" />
                            <Picker.Item label="Transportation" value="transport" />
                            <Picker.Item label="Household Support" value="household" />
                            <Picker.Item label="Meals & Groceries" value="groceries" />
                            <Picker.Item label="Emotional Support" value="emotional" />
                        </Picker>
                    </>
                }

                {/* Urgency Selection */}
                <UrgencySection>
                    <SectionHeader>
                        <SectionTitle>Urgency</SectionTitle>
                    </SectionHeader>
                    <OptionsContainer>
                        {URGENCIES.map(urgencyOption => (
                            <OptionButton
                                key={urgencyOption}
                                isSelected={urgency === urgencyOption}
                                onPress={() => setUrgency(urgencyOption)}
                            >
                                <OptionText isSelected={urgency === urgencyOption}>
                                    {urgencyOption}
                                </OptionText>
                            </OptionButton>
                        ))}
                    </OptionsContainer>
                </UrgencySection>
            </>
        </CreateRequestFormTemplate>
    )
}

export default Step1

const styles = StyleSheet.create({
    textArea: {
        height: 120,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        fontWeight: 300,
        marginBottom: 28
    }
})

const PickerButton = styled.Pressable`
    align-self: flex-end;
    right: 10px;
    background-color: #000000;
    border-radius: 6px;
    border-width: 1px;
    padding-horizontal: 12px;
    padding-vertical: 6px;
`
const PickerButtonText = styled.Text`
    color: #ffffff;
`
const UrgencySection = styled.View`
    margin-top: 10px;
    padding-horizontal: 0px;
`

const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-left: 2px;
`

const OptionsContainer = styled.View`
    flex-direction: row;
    gap: 12px;
`

const OptionButton = styled.Pressable<{ isSelected: boolean }>`
    flex: 1;
    padding-vertical: 12px;
    padding-horizontal: 16px;
    border-radius: 8px;
    border-width: 1px;
    border-color: ${props => props.isSelected ? '#111827' : '#d1d5db'};
    background-color: ${props => props.isSelected ? '#111827' : '#ffffff'};
    align-items: center;
`

const OptionText = styled.Text<{ isSelected: boolean }>`
    color: ${props => props.isSelected ? '#ffffff' : '#111827'};
    font-size: 14px;
    font-weight: 500;
`