import { SectionTitle, StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles"
import { TextInput, View } from "react-native"
import CreateRequestFormTemplate from "../createRequestFormTemplate"


const Step1 = () => {
    return (
        <CreateRequestFormTemplate>
            <StepTitle>What do you need help with?</StepTitle>
            <StepSubTitle>Tell us briefly what kind of help you need and select a category to continue.</StepSubTitle>
            <View>
                <SectionTitle>Request Title</SectionTitle>
                <TextInput 
                    placeholder="e.g. Need help getting to medical appointment"
                />
                <SectionTitle>Description</SectionTitle>
                <TextInput 
                    multiline
                    numberOfLines={5}
                    placeholder="Describe what you need help with"
                    style={{
                        height: 120,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 16,
                    }}
                />
                <SectionTitle>Category</SectionTitle>
            </View>
        </CreateRequestFormTemplate>
    )
}

export default Step1
