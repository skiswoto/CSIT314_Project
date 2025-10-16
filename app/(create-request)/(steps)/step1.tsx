import { Card, CardTitle, SectionTitle, StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { Picker } from '@react-native-picker/picker';
import { FolderOpenDot } from 'lucide-react-native';
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import styled from "styled-components/native";
import CreateRequestFormTemplate from "../createRequestFormTemplate";

const Step1 = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
    const [showCategorySelection, setShowCategorySelection] = useState<boolean>(false)
    const handleSelectedCategory = () => [
        setShowCategorySelection(false)
    ]

    return (
        <CreateRequestFormTemplate>
            <StepTitle>What do you need help with?</StepTitle>
            <StepSubTitle>Tell us briefly what kind of help you need and select a category to continue.</StepSubTitle>
            <View>
                <SectionTitle>Description</SectionTitle>
                <TextInput 
                    multiline
                    numberOfLines={5}
                    placeholder="Describe what you need help with"
                    placeholderTextColor="#878787"
                    style={styles.textArea}
                />
                <Card onPress={() => setShowCategorySelection(true)}>
                    <CardTitle>Category</CardTitle>
                    <FolderOpenDot size={28} color='#737373' />
                </Card>
                {showCategorySelection && 
                    <>
                        <PickerButton onPressIn={handleSelectedCategory}>
                            <PickerButtonText>Done</PickerButtonText>
                        </PickerButton>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={(itemValue) => 
                                setSelectedCategory(itemValue)
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
            </View>
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
