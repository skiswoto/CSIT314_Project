import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { submitRating } from '../../libs/(api)/ratings';
import { supabase } from '../../libs/supabase';

const RateService = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const { requestId, requestInfo, volunteerName, completedDate } = params;
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStarPress = (starIndex: number) => {
        setRating(starIndex);
    };

    const handleSubmit = async () => {
        // Validation
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Get current user ID
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                Alert.alert('Error', 'You must be logged in to submit a rating.');
                return;
            }

            // Submit rating to Supabase
            const { data, error } = await submitRating({
                request_id: Number(requestId),
                pin_user_id: user.id,
                volunteer_name: volunteerName as string,
                rating: rating,
                comment: comment.trim() || undefined,
            });

            if (error) {
                throw new Error(error);
            }

            Alert.alert(
                'Thank You!',
                'Your rating has been submitted successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error: any) {
            console.error('Rating submission error:', error);
            Alert.alert(
                'Submission Error',
                'Unable to submit review. Please try again later.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        Alert.alert(
            'Skip Rating',
            'Are you sure you want to skip rating this service?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Skip',
                    style: 'destructive',
                    onPress: () => {
                        router.back();
                    }
                }
            ]
        );
    };

    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
                        {/* Header */}
                        <Header>
                            <HeaderTitle>Rate Your Experience</HeaderTitle>
                            <HeaderSubtitle>
                                Help us improve by sharing your feedback
                            </HeaderSubtitle>
                        </Header>

                        {/* Service Info Card */}
                        <InfoCard>
                            <InfoLabel>Service Request</InfoLabel>
                            <InfoText>{requestInfo}</InfoText>
                            
                            <InfoLabel>Volunteer</InfoLabel>
                            <InfoText>{volunteerName}</InfoText>
                            
                            <InfoLabel>Completed On</InfoLabel>
                            <InfoText>{completedDate}</InfoText>
                        </InfoCard>

                        {/* Star Rating */}
                        <RatingSection>
                            <RatingLabel>How would you rate this service?</RatingLabel>
                            <StarsContainer>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => handleStarPress(star)}
                                        activeOpacity={0.7}
                                    >
                                        <Star
                                            size={48}
                                            color="#FCD34D"
                                            fill={star <= rating ? '#FCD34D' : 'transparent'}
                                            strokeWidth={2}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </StarsContainer>
                            {rating > 0 && (
                                <RatingText>
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </RatingText>
                            )}
                        </RatingSection>

                        {/* Comment Section */}
                        <CommentSection>
                            <CommentLabel>Additional Comments (Optional)</CommentLabel>
                            <CommentInput
                                placeholder="Share your experience with this volunteer..."
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <CharacterCount>{comment.length}/500</CharacterCount>
                        </CommentSection>

                        {/* Action Buttons */}
                        <ButtonsContainer>
                            <SubmitButton
                                onPress={handleSubmit}
                                disabled={isSubmitting || rating === 0}
                                opacity={isSubmitting || rating === 0 ? 0.5 : 1}
                            >
                                <ButtonText>
                                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                                </ButtonText>
                            </SubmitButton>

                            <SkipButton onPress={handleSkip} disabled={isSubmitting}>
                                <SkipButtonText>Skip for Now</SkipButtonText>
                            </SkipButton>
                        </ButtonsContainer>

                        {/* Disclaimer */}
                        <Disclaimer>
                            Note: Ratings cannot be edited after submission.
                        </Disclaimer>
                    </ScrollContainer>
                </KeyboardAvoidingView>
            </SafeAreaViewContainer>
        </>
    );
};

export default RateService;
// Styled Components
const Header = styled.View`
    margin-bottom: 24px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
`;

const HeaderSubtitle = styled.Text`
    font-size: 14px;
    color: #6B7280;
`;

const InfoCard = styled.View`
    background-color: #F9FAFB;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
`;

const InfoLabel = styled.Text`
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    text-transform: uppercase;
    margin-top: 12px;
    margin-bottom: 4px;
`;

const InfoText = styled.Text`
    font-size: 16px;
    font-weight: 500;
    color: #111827;
`;

const RatingSection = styled.View`
    align-items: center;
    margin-bottom: 32px;
`;

const RatingLabel = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 20px;
`;

const StarsContainer = styled.View`
    flex-direction: row;
    gap: 12px;
    margin-bottom: 12px;
`;

const RatingText = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #2B61A6;
`;

const CommentSection = styled.View`
    margin-bottom: 32px;
`;

const CommentLabel = styled.Text`
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
`;

const CommentInput = styled.TextInput`
    background-color: #FFFFFF;
    border-width: 1px;
    border-color: #D1D5DB;
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    color: #111827;
    min-height: 100px;
`;

const CharacterCount = styled.Text`
    font-size: 12px;
    color: #9CA3AF;
    text-align: right;
    margin-top: 4px;
`;

const ButtonsContainer = styled.View`
    gap: 12px;
    margin-bottom: 16px;
`;

const SubmitButton = styled.TouchableOpacity<{ opacity: number }>`
    background-color: #2B61A6;
    border-radius: 50px;
    padding-vertical: 14px;
    align-items: center;
    opacity: ${props => props.opacity};
`;

const ButtonText = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #FFFFFF;
`;

const SkipButton = styled.TouchableOpacity`
    background-color: transparent;
    border-width: 1px;
    border-color: #D1D5DB;
    border-radius: 50px;
    padding-vertical: 14px;
    align-items: center;
`;

const SkipButtonText = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #6B7280;
`;

const Disclaimer = styled.Text`
    font-size: 12px;
    color: #9CA3AF;
    text-align: center;
    font-style: italic;
`;