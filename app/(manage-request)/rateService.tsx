import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { supabase } from '../../libs/supabase';
import { submitRating } from '../../services/ratings';

const RateService = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const { listingId, category } = params;
    
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStarPress = (starIndex: number) => {
        setRating(starIndex);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                Alert.alert('Error', 'You must be logged in to submit a rating.');
                return;
            }

            const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
            
            if (!normalizedListingId) {
                Alert.alert('Error', 'Invalid listing ID');
                return;
            }

            // Fetch the listing to get the CSR Rep who completed it
            const { data: listing, error: listingError } = await supabase
                .from('Listings')
                .select('completed_by')
                .eq('id', Number(normalizedListingId))
                .single();

            if (listingError || !listing?.completed_by) {
                Alert.alert('Error', 'Unable to find the CSR Rep who completed this service.');
                return;
            }

            console.log('Submitting rating:', {
                listing_id: Number(normalizedListingId),
                rater_id: user.id,
                csr_rep_id: listing.completed_by,
                rating: rating,
            });

            const { data, error } = await submitRating({
                listing_id: Number(normalizedListingId),
                rater_id: user.id,
                rater_email: user.email || '',
                csr_rep_id: listing.completed_by, // ✅ Added this
                rating: rating,
            });

            if (error) {
                throw new Error(error);
            }

            Alert.alert('Thank You!', 'Your rating has been submitted successfully.', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error: any) {
            console.error('Rating submission error:', error);
            Alert.alert('Submission Error', error.message || 'Unable to submit review. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
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
                                How was the {category || 'service'}?
                            </HeaderSubtitle>
                        </Header>

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

                        {/* Action Button */}
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
                        </ButtonsContainer>
                    </ScrollContainer>
                </KeyboardAvoidingView>
            </SafeAreaViewContainer>
        </>
    );
};

export default RateService;

/* Styled Components - unchanged */
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

const ButtonsContainer = styled.View`
    gap: 12px;
    margin-bottom: 16px;
`;

const SubmitButton = styled.TouchableOpacity<{ opacity: number }>`
    background-color: #2B61A6;
    border-radius: 50px;
    padding-vertical: 14px;
    align-items: center;
    opacity: ${(props) => props.opacity};
`;

const ButtonText = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
`;