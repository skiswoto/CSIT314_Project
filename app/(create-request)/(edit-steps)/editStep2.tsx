import { Card, CardTitle, StepSubTitle, StepTitle } from "@/constants/createRequestFormStyles";
import { useCreateListingStore } from "@/global/createListingStore";
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { CalendarFold, Clock2, Clock5, Hourglass } from 'lucide-react-native';
import { useEffect, useState } from "react"; // Added useEffect
import { Modal, Pressable, StyleSheet, View } from "react-native";
import EditRequestFormTemplate from './EditRequestFormTemplate';

const EditStep2 = () => {
  const params = useLocalSearchParams();
  const listingData = params.listingData ? JSON.parse(params.listingData as string) : null;

  const { date, time, duration, setDate, setTime, setDuration } = useCreateListingStore();
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  // Initialize store with existing listing data
  useEffect(() => {
    if (listingData) {
      // Parse existing date from listing data
      if (listingData.date) {
        setDate(new Date(listingData.date));
      }
      
      // Parse existing time from listing data
      if (listingData.start_time) {
        setTime(new Date(listingData.start_time));
      }
      
      // Parse existing duration from listing data
      if (listingData.duration) {
        // Convert duration string (e.g., "02:30:00") to Date object
        const [hours, minutes] = listingData.duration.split(':').map(Number);
        const durationDate = new Date();
        durationDate.setHours(hours, minutes, 0, 0);
        setDuration(durationDate);
      }
    }
  }, [listingData, setDate, setTime, setDuration]);

  if (!listingData) return null;

  const CURRENT_DATE = new Date();
  const MINIMUM_DATE = new Date(CURRENT_DATE);
  MINIMUM_DATE.setDate(MINIMUM_DATE.getDate() + 1);

  // Create default time that matches the listing data
  const getDefaultTime = () => {
    if (time) return time;
    if (listingData.start_time) return new Date(listingData.start_time);
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    return defaultTime;
  };

  // Create default duration that matches the listing data
  const getDefaultDuration = () => {
    if (duration) return duration;
    if (listingData.duration) {
      const [hours, minutes] = listingData.duration.split(':').map(Number);
      const durationDate = new Date();
      durationDate.setHours(hours, minutes, 0, 0);
      return durationDate;
    }
    const defaultDuration = new Date();
    defaultDuration.setHours(1, 0, 0, 0);
    return defaultDuration;
  };

  const formatDuration = (date: Date): string => {
    if (!date) return 'Duration';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours === 0 && minutes === 0) return '0 minutes';
    if (hours === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const calculateEndTime = (startTime: Date, duration: Date): string => {
    if (!startTime || !duration) return 'End Time';
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + duration.getHours());
    endTime.setMinutes(endTime.getMinutes() + duration.getMinutes());
    return endTime.toLocaleTimeString();
  };

  return (
    <EditRequestFormTemplate listingId={listingData.id} originalData={listingData}>
      <StepTitle>When do you need help?</StepTitle>
      <StepSubTitle>Pick when you&apos;td like the volunteer(s) to help and the expected duration</StepSubTitle>

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
        <CardTitle $hasValue={!!time && !!duration}>
          {time && duration ? calculateEndTime(time, duration) : 'End Time'}
        </CardTitle>
        <Clock5 size={26}/>
      </Card>

      {/* Date Picker */}
      <Modal visible={showDatePickerModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowDatePickerModal(false)}>
          <View style={styles.modalContent}>
            <RNDateTimePicker
              mode="date"
              value={date || MINIMUM_DATE}
              onChange={(_, selectedDate) => selectedDate && setDate(selectedDate)}
              display="inline"
              minimumDate={MINIMUM_DATE}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Start Time Picker */}
      <Modal visible={showStartTimePicker} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowStartTimePicker(false)}>
          <View style={styles.modalContent}>
            <RNDateTimePicker
              mode="time"
              value={time || getDefaultTime()} // Use the actual listing time
              onChange={(_, selectedTime) => selectedTime && setTime(selectedTime)}
              display="spinner"
            />
          </View>
        </Pressable>
      </Modal>

      {/* Duration Picker */}
      <Modal visible={showDurationModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowDurationModal(false)}>
          <View style={styles.modalContent}>
            <RNDateTimePicker
              mode="countdown"
              value={duration || getDefaultDuration()} // Use the actual listing duration
              onChange={(_, selectedDuration) => selectedDuration && setDuration(selectedDuration)}
              display="spinner"
              minuteInterval={30}
            />
          </View>
        </Pressable>
      </Modal>
    </EditRequestFormTemplate>
  );
};

export default EditStep2;

const styles = StyleSheet.create({
  modalContent: {
    width: '100%',
    maxHeight: 500,
    backgroundColor: '#F0F0F0',
    borderRadius: 30,
    paddingVertical: 30,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});