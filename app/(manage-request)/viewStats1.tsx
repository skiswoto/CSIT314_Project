import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StatusBar, View, Alert, Modal, Animated, Dimensions } from 'react-native';
import { styled } from 'styled-components/native';
import { SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';
import { useEffect, useRef } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sample request data
const requestData = {
    id: 1,
    pinName: 'Emily Wong',
    pinProfile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 
    requestInfo: 'Need assistance with grocery shopping',
    dateCreated: '20 Oct 2025',
    location: 'Jurong West',
    description: 'I need help with grocery shopping this weekend. Looking for someone who can accompany me to the supermarket and help carry bags.',
};

const ViewRequest = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        // Slide up animation when component mounts
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 10,
        }).start();
    }, []);

    const handleClose = () => {
        // Slide down animation before going back
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    const handleDeleteRequest = () => {
        Alert.alert(
            'Delete Request',
            'Are you sure you want to delete this request?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        handleClose();
                    },
                },
            ]
        );
    };

    const handleEditRequest = () => {
        // Navigate to edit request screen
    };

    const handleViewStats = () => {
        // Navigate to stats screen
        router.push('/(manage-request)/viewStats2');
    };

    return (
        <>
            <StatusBar />
            <SafeAreaViewContainer>
                {/* Top Bar - Fixed */}
                <TopBar>
                    <IconContainer onPress={handleClose}>
                        <ArrowLeft size={26} color="#1F2937" />
                    </IconContainer>
                    <EditButton onPress={handleEditRequest}>
                        <EditButtonText>Edit Request</EditButtonText>
                    </EditButton>
                </TopBar>

                {/* Overlay */}
                <Overlay onPress={handleClose} activeOpacity={1} />

                {/* Sliding Modal Content */}
                <AnimatedModalContent style={{ transform: [{ translateY: slideAnim }] }}>
                    <ModalHandle />
                    
                    <ScrollContainer contentContainerStyle={{ paddingBottom: 100 }}>
                        {/* Profile Section */}
                        <ProfileSection>
                            <ProfileImage source={{ uri: requestData.pinProfile }} resizeMode="cover" />
                            <ProfileInfo>
                                <PinName>{requestData.pinName}</PinName>
                                <DateText>Created on {requestData.dateCreated}</DateText>
                            </ProfileInfo>
                        </ProfileSection>

                        {/* View Request Stats Button */}
                        <StatsButton onPress={handleViewStats}>
                            <StatsButtonText>View Request Stats</StatsButtonText>
                        </StatsButton>

                        {/* Request Details */}
                        <SectionTitle>Request Details</SectionTitle>
                        <DetailsCard>
                            <RequestTitle>{requestData.requestInfo}</RequestTitle>
                            <RequestDescription>{requestData.description}</RequestDescription>
                        </DetailsCard>

                        {/* Delete Button */}
                        <DeleteButton onPress={handleDeleteRequest}>
                            <DeleteButtonText>Delete Request</DeleteButtonText>
                        </DeleteButton>
                    </ScrollContainer>
                </AnimatedModalContent>
            </SafeAreaViewContainer>
        </>
    );
};

export default ViewRequest;

const TopBar = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-top: 70px; 
    padding-horizontal: 20px;
    margin-bottom: 24px;
    z-index: 10;
`;

const IconContainer = styled.Pressable`
    background-color: #F3F4F6;
    border-radius: 50px;
    padding: 8px;
`;

const EditButton = styled.TouchableOpacity`
    background-color: #2B61A6;
    border-radius: 10px;
    padding-horizontal: 20px;
    padding-vertical: 12px;
`;

const EditButtonText = styled.Text`
    color: #FFFFFF;
    font-size: 15px;
    font-weight: 600;
`;

const Overlay = styled.TouchableOpacity`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 75%;
    background-color: #F9FAFB;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 20px;
    padding-top: 8px;
`;

const AnimatedModalContent = Animated.createAnimatedComponent(ModalContent);

const ModalHandle = styled.View`
    width: 40px;
    height: 5px;
    background-color: #D1D5DB;
    border-radius: 3px;
    align-self: center;
    margin-bottom: 20px;
`;

const ProfileSection = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
`;

const ProfileImage = styled.Image`
    width: 80px;
    height: 80px;
    border-radius: 40px;
    border-width: 2px;
    border-color: #E5E7EB;
`;

const ProfileInfo = styled.View`
    flex: 1;
`;

const PinName = styled.Text`
    font-size: 24px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 4px;
`;

const DateText = styled.Text`
    font-size: 14px;
    color: #6B7280;
`;

const StatsButton = styled.TouchableOpacity`
    background-color: #059669;
    border-radius: 10px;
    padding-vertical: 14px;
    align-items: center;
    margin-bottom: 24px;
`;

const StatsButtonText = styled.Text`
    color: #FFFFFF;
    font-size: 16px;
    font-weight: 600;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 12px;
`;

const DetailsCard = styled.View`
    background-color: #FFFFFF;
    border-radius: 10px;
    border-width: 1px;
    border-color: #E5E7EB;
    padding: 20px;
    margin-bottom: 32px;
`;

const RequestTitle = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 12px;
`;

const RequestDescription = styled.Text`
    font-size: 15px;
    color: #6B7280;
    line-height: 22px;
`;

const DeleteButton = styled.TouchableOpacity`
    background-color: #DC2626;
    border-radius: 10px;
    padding-vertical: 18px;
    align-items: center;
    margin-bottom: 20px;
`;

const DeleteButtonText = styled.Text`
    color: #FFFFFF;
    font-size: 17px;
    font-weight: 600;
`;