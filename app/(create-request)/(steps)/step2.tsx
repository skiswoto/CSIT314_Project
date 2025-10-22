import { Card, CardTitle, StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { CalendarFold, Clock2, Clock5, Hourglass } from 'lucide-react-native';
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import CreateRequestFormTemplate from '../createRequestFormTemplate';


const Step2 = () => {
    const [date, setDate] = useState<Date | undefined >()
    const [time, setTime] = useState<Date | undefined>()
    const [duration, setDuration] = useState<Date | undefined>()

    const [showDatePickerModal, setShowDatePickerModal]  = useState<boolean>(false)
    const [showStartTimePicker, setShowStartTimePicker]  = useState<boolean>(false)
    const [showDurationModal, setShowDurationModal]  = useState<boolean>(false)
    
    const CURRENT_DATE = new Date();
    const MINIMUM_DATE = new Date(CURRENT_DATE)
    MINIMUM_DATE.setDate(MINIMUM_DATE.getDate() + 1)

    const formatDuration = (date: Date): string => {
        if (!date) return 'Duration';
        
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        if (hours === 0 && minutes === 0) return '0 minutes';
        if (hours === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
        
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    const calculateEndTime = (startTime: Date, duration: Date): string => {
        if (!startTime || !duration) return 'End Time'

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + duration.getHours());
        endTime.setMinutes(endTime.getMinutes() + duration.getMinutes());

        return endTime.toLocaleTimeString();
    }
    return (
        <CreateRequestFormTemplate>
            <StepTitle>When do you need help?</StepTitle>
            <StepSubTitle>Pick when you&apos;d like the volunteer(s) to help and the expected duration</StepSubTitle>
            <>
                <Card onPress={() => setShowDatePickerModal(true)}>
                    <CardTitle $hasValue={!!date}>{date ? date.toLocaleDateString() : 'Date'}</CardTitle>
                    <CalendarFold size={26}/>
                </Card>
                <Card onPress={() => setShowStartTimePicker(true)}>
                    <CardTitle $hasValue={!!time}>{time ? time.toLocaleTimeString() : 'Start Time'}</CardTitle>
                    <Clock2 size={26}/>
                </Card>
                <Card onPress={() => setShowDurationModal(true)}>
                    <CardTitle $hasValue={!!duration}>{duration ? formatDuration(duration) : 'Duration'}</CardTitle>
                    <Hourglass size={26}/>
                </Card>
                <Card>
                    <CardTitle $hasValue={!!time && !!duration}>{time && duration ? calculateEndTime(time, duration) : 'End Time'}</CardTitle>
                    <Clock5 size={26}/>
                </Card>
            </>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDatePickerModal}
                onRequestClose={() => {
                    setShowDatePickerModal(false)
                }}
                backdropColor={'white'}
            >
                <Pressable style={styles.overlay} onPress={() => setShowDatePickerModal(false)}>
                    <View style={styles.modalContent}>
                        <RNDateTimePicker 
                            mode='date'
                            value={date || MINIMUM_DATE}
                            onChange={(_, selectedDate) => {
                                if (selectedDate) setDate(selectedDate)
                            }}
                            display='inline'
                            minimumDate={MINIMUM_DATE}
                            accentColor="black"
                            themeVariant="light"
                        />
                    </View>
                </Pressable>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showStartTimePicker}
                onRequestClose={() => {
                    setShowStartTimePicker(false)
                }}
                backdropColor={'white'}
            >
                <Pressable style={styles.overlay} onPress={() => setShowStartTimePicker(false)}>
                    <View style={styles.modalContent}>
                        <RNDateTimePicker 
                            mode='time'
                            value={time || MINIMUM_DATE}
                            onChange={(_, selectedTime) => {
                                if (selectedTime) setTime(selectedTime)
                            }}
                            display='spinner'
                            themeVariant="light"
                        />
                    </View>
                </Pressable>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDurationModal}
                onRequestClose={() => {
                    setShowDurationModal(false)
                }}
                backdropColor={'white'}
            >
                <Pressable style={styles.overlay} onPress={() => setShowDurationModal(false)}>
                    <View style={styles.modalContent}>
                        <RNDateTimePicker 
                            mode='countdown'
                            value={duration || MINIMUM_DATE}
                            onChange={(_, selectedDuration) => {
                                if (selectedDuration) setDuration(selectedDuration)
                            }}
                            display='spinner'
                            themeVariant="light"
                            minuteInterval={30}
                        />
                    </View>
                </Pressable>
            </Modal>
        </CreateRequestFormTemplate>
    )
}

export default Step2

const styles = StyleSheet.create({
    modalContent: {
        width: '100%',           
        maxHeight: 500,         
        backgroundColor: '#F0F0F0',
        borderRadius: 30,
        paddingVertical: 30,
        paddingHorizontal: 12,
        alignItems: 'center',   
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
})
