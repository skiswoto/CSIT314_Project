import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { supabase } from '../../libs/supabase';
import { canUserRateListing, submitRating } from '../../services/ratings';

const RateService = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

<<<<<<< HEAD
  console.log('Received params:', params);

  // ✅ keep this — you need listingId below
  const { listingId } = params as { listingId?: string | string[] };

  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
=======
    console.log('Received params:', params);
    
    const { listingId, requestInfo, category } = params;
    
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canRate, setCanRate] = useState(true);
    const [ratingMessage, setRatingMessage] = useState('');
    const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);

    useEffect(() => {
        checkRatingEligibility();
    }, [listingId]);

    const checkRatingEligibility = async () => {
        try {
            setIsCheckingEligibility(true);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setCanRate(false);
                setRatingMessage('You must be logged in to rate');
                return;
            }

            const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
            
            if (!normalizedListingId || normalizedListingId === 'undefined') {
                setCanRate(false);
                setRatingMessage('Invalid listing ID');
                return;
            }

            const { canRate: eligible, reason } = await canUserRateListing(
                Number(normalizedListingId),
                user.id
            );

            setCanRate(eligible);
            if (!eligible && reason) {
                setRatingMessage(reason);
            }
        } catch (error) {
            console.error('Error checking eligibility:', error);
            setCanRate(false);
            setRatingMessage('Error checking rating eligibility');
        } finally {
            setIsCheckingEligibility(false);
        }
    };

    const handleStarPress = (starIndex: number) => {
        if (canRate) {
            setRating(starIndex);
        }
    };

    const handleSubmit = async () => {
        if (!canRate) {
            Alert.alert('Cannot Rate', ratingMessage);
            return;
        }

        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }
>>>>>>> 65f96ca13e0b1a9d1076abf1d7ff262442795d96

  const handleStarPress = (starIndex: number) => setRating(starIndex);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedListingId = Array.isArray(listingId) ? listingId[0] : listingId;

      if (!normalizedListingId || normalizedListingId === 'undefined') {
        Alert.alert('Error', 'Invalid listing ID. Please try again.');
        return;
      }

      console.log('Submitting rating:', {
        listing_id: Number(normalizedListingId),
        rating,
      });

      const { error } = await submitRating({
        listing_id: Number(normalizedListingId),
        rating,
      });

<<<<<<< HEAD
      if (error) throw new Error(error);

      Alert.alert('Thank You!', 'Your rating has been submitted successfully.', [
        { text: 'OK', onPress: () => router.back() },
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
            <Header>
              <HeaderTitle>Rate Your Experience</HeaderTitle>
              <HeaderSubtitle>How was this service?</HeaderSubtitle>
            </Header>

            <RatingSection>
              <RatingLabel>How would you rate this service?</RatingLabel>
              <StarsContainer>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleStarPress(star)} activeOpacity={0.7}>
                    <Star size={48} color="#FCD34D" fill={star <= rating ? '#FCD34D' : 'transparent'} strokeWidth={2} />
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

            <ButtonsContainer>
              <SubmitButton onPress={handleSubmit} disabled={isSubmitting || rating === 0} opacity={isSubmitting || rating === 0 ? 0.5 : 1}>
                <ButtonText>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</ButtonText>
              </SubmitButton>
            </ButtonsContainer>
          </ScrollContainer>
        </KeyboardAvoidingView>
      </SafeAreaViewContainer>
    </>
  );
=======
    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
                        {/* Back Button Header */}
                        <HeaderContainer>
                            <BackButton onPress={() => router.back()}>
                                <ArrowLeft size={24} color="#111827" />
                            </BackButton>
                            <HeaderTitleRow>
                                <HeaderTitle>Rate Your Experience</HeaderTitle>
                            </HeaderTitleRow>
                        </HeaderContainer>

                        <HeaderSubtitle>How was this service?</HeaderSubtitle>

                        {/* Loading State */}
                        {isCheckingEligibility && (
                            <LoadingContainer>
                                <LoadingText>Checking eligibility...</LoadingText>
                            </LoadingContainer>
                        )}

                        {/* Cannot Rate Message */}
                        {!isCheckingEligibility && !canRate && (
                            <WarningContainer>
                                <WarningIcon>⚠️</WarningIcon>
                                <WarningTitle>Cannot Rate Service</WarningTitle>
                                <WarningMessage>{ratingMessage}</WarningMessage>
                                <BackButtonAlt onPress={() => router.back()}>
                                    <BackButtonAltText>Go Back</BackButtonAltText>
                                </BackButtonAlt>
                            </WarningContainer>
                        )}

                        {/* Rating Form */}
                        {!isCheckingEligibility && canRate && (
                            <>
                                {/* Star Rating */}
                                <RatingSection>
                                    <RatingLabel>How would you rate this service?</RatingLabel>
                                    <StarsContainer>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => handleStarPress(star)}
                                                activeOpacity={0.7}
                                                disabled={!canRate}
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
                                        disabled={isSubmitting || rating === 0 || !canRate}
                                        opacity={isSubmitting || rating === 0 || !canRate ? 0.5 : 1}
                                    >
                                        <ButtonText>
                                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                                        </ButtonText>
                                    </SubmitButton>
                                    
                                    <CancelButton onPress={() => router.back()}>
                                        <CancelButtonText>Cancel</CancelButtonText>
                                    </CancelButton>
                                </ButtonsContainer>

                                <InfoText>
                                    ℹ️ Ratings cannot be edited once submitted
                                </InfoText>
                            </>
                        )}
                    </ScrollContainer>
                </KeyboardAvoidingView>
            </SafeAreaViewContainer>
        </>
    );
>>>>>>> 65f96ca13e0b1a9d1076abf1d7ff262442795d96
};

export default RateService;

<<<<<<< HEAD
const Header = styled.View`
  margin-bottom: 24px;
=======
const HeaderContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
    gap: 12px;
`;

const BackButton = styled.TouchableOpacity`
    padding: 8px;
    background-color: #F3F4F6;
    border-radius: 12px;
`;

const HeaderTitleRow = styled.View`
    flex: 1;
>>>>>>> 65f96ca13e0b1a9d1076abf1d7ff262442795d96
`;
const HeaderTitle = styled.Text`
<<<<<<< HEAD
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
=======
    font-size: 24px;
    font-weight: 700;
    color: #111827;
>>>>>>> 65f96ca13e0b1a9d1076abf1d7ff262442795d96
`;
const HeaderSubtitle = styled.Text`
<<<<<<< HEAD
  font-size: 14px;
  color: #6b7280;
=======
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 24px;
`;

const LoadingContainer = styled.View`
    padding: 40px 20px;
    align-items: center;
    justify-content: center;
`;

const LoadingText = styled.Text`
    font-size: 16px;
    color: #6B7280;
`;

const WarningContainer = styled.View`
    background-color: #FEF3C7;
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
    border-width: 2px;
    border-color: #FBBF24;
    align-items: center;
`;

const WarningIcon = styled.Text`
    font-size: 48px;
    margin-bottom: 12px;
`;

const WarningTitle = styled.Text`
    font-size: 20px;
    font-weight: 700;
    color: #92400E;
    margin-bottom: 8px;
    text-align: center;
`;

const WarningMessage = styled.Text`
    font-size: 16px;
    color: #92400E;
    text-align: center;
    margin-bottom: 20px;
`;

const BackButtonAlt = styled.TouchableOpacity`
    background-color: #92400E;
    padding: 12px 24px;
    border-radius: 12px;
`;

const BackButtonAltText = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #FFFFFF;
>>>>>>> 65f96ca13e0b1a9d1076abf1d7ff262442795d96
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
  color: #2b61a6;
`;
const ButtonsContainer = styled.View`
  gap: 12px;
  margin-bottom: 16px;
`;
const SubmitButton = styled.TouchableOpacity<{ opacity: number }>`
  background-color: #2b61a6;
  border-radius: 50px;
  padding-vertical: 14px;
  align-items: center;
  opacity: ${(props) => props.opacity};
`;
const ButtonText = styled.Text`
<<<<<<< HEAD
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;
=======
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
`;

const CancelButton = styled.TouchableOpacity`
    background-color: #F3F4F6;
    border-radius: 50px;
    padding-vertical: 14px;
    align-items: center;
`;

const CancelButtonText = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #6B7280;
`;

const InfoText = styled.Text`
    text-align: center;
    font-size: 14px;
    color: #6B7280;
    font-style: italic;
`;
>>>>>>> 65f96ca13e0b1a9d1076abf1d7ff262442795d96
