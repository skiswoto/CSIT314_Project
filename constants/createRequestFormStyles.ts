import { styled } from "styled-components/native";

export const StepTitle = styled.Text`
    font-weight: 600;
    font-size: 30px;
    margin-bottom: 8px;
    max-width: 90%;
`
export const StepSubTitle = styled.Text`
    font-weight: 400;
    font-size: 16px;
    color: #615F5F;
    margin-bottom: 40px;
    max-width: 95%;
`
export const SectionTitle = styled.Text`
    font-weight: 600;
    font-size: 18px;
    color: #333;
    margin-bottom: 10px;
`
export const Card = styled.Pressable`
    flex-direction: row;
    border-width: 1px;
    border-radius: 12px;
    border-color: #ccc;
    padding-horizontal: 22px;
    padding-vertical: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`
export const CardTitle = styled.Text<{ $hasValue?: boolean }>`
	font-weight: 500;
	font-size: 18px;
	color: ${({ $hasValue }) => ($hasValue ? '#000000' : '#878787')};
	margin-bottom: 4px;
	right: 4px;
`