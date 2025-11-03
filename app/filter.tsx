import { AlertCircle, Briefcase, Calendar, ChevronDown, ChevronUp, MapPin, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { styled } from 'styled-components/native';


// Types
interface FilterState {
  locations: string[];
  serviceTypes: string[];
  urgencies: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters?: FilterState;
  availableLocations?: string[]; // Dynamic locations from database
}

// Styled Components
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const BottomSheetContainer = styled.View`
  background-color: #ffffff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 85%;
  padding-bottom: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom-width: 1px;
  border-bottom-color: #E5E7EB;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ContentScroll = styled.ScrollView`
  padding: 0 24px;
`;

const FilterSection = styled.View`
  margin-top: 24px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-left: 8px;
`;

const DropdownButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
  background-color: #F9FAFB;
`;

const DropdownText = styled.Text<{ hasSelection: boolean }>`
  font-size: 14px;
  color: ${props => props.hasSelection ? '#111827' : '#9CA3AF'};
  font-weight: ${props => props.hasSelection ? '500' : '400'};
`;

const DropdownContent = styled.View`
  margin-top: 8px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
  background-color: #ffffff;
  max-height: 200px;
`;

const DropdownScrollView = styled.ScrollView`
  padding: 4px;
`;

const DropdownOption = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${props => props.isSelected ? '#F3F4F6' : 'transparent'};
`;

const CheckBox = styled.View<{ isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border-width: 2px;
  border-color: ${props => props.isSelected ? '#111827' : '#D1D5DB'};
  background-color: ${props => props.isSelected ? '#111827' : 'transparent'};
  margin-right: 12px;
  align-items: center;
  justify-content: center;
`;

const CheckMark = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
`;

const DropdownOptionText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  color: ${props => props.isSelected ? '#111827' : '#374151'};
  font-weight: ${props => props.isSelected ? '500' : '400'};
`;

const OptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const OptionButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding: 10px 16px;
  border-radius: 20px;
  background-color: ${props => props.isSelected ? '#111827' : '#F3F4F6'};
  border-width: 1px;
  border-color: ${props => props.isSelected ? '#111827' : '#E5E7EB'};
`;

const OptionText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isSelected ? '#ffffff' : '#374151'};
`;

const DateRangeContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
`;

const DateInputButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
  background-color: #F9FAFB;
`;

const DateLabel = styled.Text`
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
`;

const DateText = styled.Text<{ hasValue: boolean }>`
  font-size: 14px;
  color: ${props => props.hasValue ? '#111827' : '#9CA3AF'};
  font-weight: ${props => props.hasValue ? '500' : '400'};
`;

const CalendarContainer = styled.View`
  margin-top: 12px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #E5E7EB;
  background-color: #ffffff;
  padding: 12px;
  padding-bottom: 8px;
`;

const CalendarHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CalendarTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const CalendarNav = styled.TouchableOpacity`
  padding: 4px;
`;

const WeekdaysRow = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const WeekdayText = styled.Text`
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
`;

const DaysGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const DayButton = styled.TouchableOpacity<{ isSelected: boolean; isInRange: boolean; isToday: boolean; isDisabled: boolean }>`
  width: 14.28%;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: ${props => 
    props.isSelected ? '#111827' : 
    props.isInRange ? '#F3F4F6' : 
    'transparent'};
  opacity: ${props => props.isDisabled ? 0.3 : 1};
`;

const DayText = styled.Text<{ isSelected: boolean; isToday: boolean }>`
  font-size: 14px;
  color: ${props => 
    props.isSelected ? '#ffffff' : 
    props.isToday ? '#111827' : 
    '#374151'};
  font-weight: ${props => props.isSelected || props.isToday ? '600' : '400'};
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  padding: 20px 24px 0;
`;

const ResetButton = styled.TouchableOpacity`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background-color: #F3F4F6;
  align-items: center;
`;

const ResetButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`;

const ApplyButton = styled.TouchableOpacity`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background-color: #111827;
  align-items: center;
`;

const ApplyButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

// Filter Options Data
const LOCATIONS = [
  'Ang Mo Kio',
  'Bedok',
  'Bishan',
  'Bukit Batok',
  'Bukit Merah',
  'Bukit Panjang',
  'Bukit Timah',
  'Choa Chu Kang',
  'Clementi',
  'Geylang',
  'Hougang',
  'Jurong East',
  'Jurong West',
  'Kallang',
  'Marine Parade',
  'Pasir Ris',
  'Punggol',
  'Queenstown',
  'Sembawang',
  'Sengkang',
  'Serangoon',
  'Tampines',
  'Toa Payoh',
  'Woodlands',
  'Yishun'
];

const SERVICE_TYPES = [
  'Companionship', 'Medical', 'Meals', 'Transport',
  'Groceries', 'Home Care', 'Tech Support'
];

const URGENCIES = ['High', 'Medium', 'Low'];

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableLocations = [] // Pass this from your database
}) => {
  const [filters, setFilters] = useState<FilterState>(
    currentFilters || {
      locations: [],
      serviceTypes: [],
      urgencies: [],
      dateRange: { start: null, end: null }
    }
  );

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const toggleLocation = (location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(item => item !== location)
        : [...prev.locations, location]
    }));
  };

  const toggleOption = (
    category: 'serviceTypes' | 'urgencies',
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleDateSelect = (date: Date) => {
    if (datePickerMode === 'start') {
      setFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, start: date }
      }));
    } else if (datePickerMode === 'end') {
      setFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, end: date }
      }));
    }
    setDatePickerMode(null);
  };

  const handleReset = () => {
    setFilters({
      locations: [],
      serviceTypes: [],
      urgencies: [],
      dateRange: { start: null, end: null }
    });
    setLocationDropdownOpen(false);
    setDatePickerMode(null);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-SG', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getLocationDisplayText = () => {
    if (filters.locations.length === 0) return 'Select locations';
    if (filters.locations.length === 1) return filters.locations[0];
    return `${filters.locations.length} locations selected`;
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isDateInRange = (date: Date) => {
    if (!filters.dateRange.start || !filters.dateRange.end) return false;
    return date >= filters.dateRange.start && date <= filters.dateRange.end;
  };

  const isDateSelected = (date: Date) => {
    const start = filters.dateRange.start;
    const end = filters.dateRange.end;
    if (!start && !end) return false;
    
    if (datePickerMode === 'start') {
      return start?.toDateString() === date.toDateString();
    } else if (datePickerMode === 'end') {
      return end?.toDateString() === date.toDateString();
    }
    return false;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(calendarMonth);
    const today = new Date();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<DayButton key={`empty-${i}`} isSelected={false} isInRange={false} isToday={false} isDisabled={true} disabled />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = isDateSelected(date);
      const inRange = isDateInRange(date);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <DayButton
          key={day}
          isSelected={isSelected}
          isInRange={inRange}
          isToday={isToday}
          isDisabled={isPast}
          disabled={isPast}
          onPress={() => !isPast && handleDateSelect(date)}
        >
          <DayText isSelected={isSelected} isToday={isToday}>{day}</DayText>
        </DayButton>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <BottomSheetContainer>
          <Header>
            <HeaderTitle>Filter Listings</HeaderTitle>
            <CloseButton onPress={onClose}>
              <X size={24} color="#374151" />
            </CloseButton>
          </Header>

          <ContentScroll showsVerticalScrollIndicator={false}>
            {/* Location Dropdown Filter */}
            <FilterSection>
              <SectionHeader>
                <MapPin size={20} color="#111827" />
                <SectionTitle>Location</SectionTitle>
              </SectionHeader>
              <DropdownButton onPress={() => setLocationDropdownOpen(!locationDropdownOpen)}>
                <DropdownText hasSelection={filters.locations.length > 0}>
                  {getLocationDisplayText()}
                </DropdownText>
                {locationDropdownOpen ? 
                  <ChevronUp size={20} color="#6B7280" /> : 
                  <ChevronDown size={20} color="#6B7280" />
                }
              </DropdownButton>
              
              {locationDropdownOpen && (
                <DropdownContent>
                  <DropdownScrollView>
                    {availableLocations.map(location => (
                      <DropdownOption
                        key={location}
                        isSelected={filters.locations.includes(location)}
                        onPress={() => toggleLocation(location)}
                      >
                        <CheckBox isSelected={filters.locations.includes(location)}>
                          {filters.locations.includes(location) && <CheckMark>✓</CheckMark>}
                        </CheckBox>
                        <DropdownOptionText isSelected={filters.locations.includes(location)}>
                          {location}
                        </DropdownOptionText>
                      </DropdownOption>
                    ))}
                  </DropdownScrollView>
                </DropdownContent>
              )}
            </FilterSection>

            {/* Service Type Filter */}
            <FilterSection>
              <SectionHeader>
                <Briefcase size={20} color="#111827" />
                <SectionTitle>Service Type</SectionTitle>
              </SectionHeader>
              <OptionsContainer>
                {SERVICE_TYPES.map(service => (
                  <OptionButton
                    key={service}
                    isSelected={filters.serviceTypes.includes(service)}
                    onPress={() => toggleOption('serviceTypes', service)}
                  >
                    <OptionText isSelected={filters.serviceTypes.includes(service)}>
                      {service}
                    </OptionText>
                  </OptionButton>
                ))}
              </OptionsContainer>
            </FilterSection>

            {/* Urgency Filter */}
            <FilterSection>
              <SectionHeader>
                <AlertCircle size={20} color="#111827" />
                <SectionTitle>Urgency</SectionTitle>
              </SectionHeader>
              <OptionsContainer>
                {URGENCIES.map(urgency => (
                  <OptionButton
                    key={urgency}
                    isSelected={filters.urgencies.includes(urgency)}
                    onPress={() => toggleOption('urgencies', urgency)}
                  >
                    <OptionText isSelected={filters.urgencies.includes(urgency)}>
                      {urgency}
                    </OptionText>
                  </OptionButton>
                ))}
              </OptionsContainer>
            </FilterSection>

            {/* Date Range Filter */}
            <FilterSection>
              <SectionHeader>
                <Calendar size={20} color="#111827" />
                <SectionTitle>Date Range</SectionTitle>
              </SectionHeader>
              <DateRangeContainer>
                <DateInputButton 
                  onPress={() => setDatePickerMode(datePickerMode === 'start' ? null : 'start')}
                >
                  <DateLabel>From</DateLabel>
                  <DateText hasValue={filters.dateRange.start !== null}>
                    {formatDate(filters.dateRange.start)}
                  </DateText>
                </DateInputButton>
                <DateInputButton
                  onPress={() => setDatePickerMode(datePickerMode === 'end' ? null : 'end')}
                >
                  <DateLabel>To</DateLabel>
                  <DateText hasValue={filters.dateRange.end !== null}>
                    {formatDate(filters.dateRange.end)}
                  </DateText>
                </DateInputButton>
              </DateRangeContainer>

              {/* Calendar Picker */}
              {datePickerMode && (
                <CalendarContainer>
                  <CalendarHeader>
                    <CalendarNav onPress={() => navigateMonth('prev')}>
                      <ChevronDown size={20} color="#374151" style={{ transform: [{ rotate: '90deg' }] }} />
                    </CalendarNav>
                    <CalendarTitle>
                      {calendarMonth.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })}
                    </CalendarTitle>
                    <CalendarNav onPress={() => navigateMonth('next')}>
                      <ChevronDown size={20} color="#374151" style={{ transform: [{ rotate: '-90deg' }] }} />
                    </CalendarNav>
                  </CalendarHeader>
                  
                  <WeekdaysRow>
                    <WeekdayText>S</WeekdayText>
                    <WeekdayText>M</WeekdayText>
                    <WeekdayText>T</WeekdayText>
                    <WeekdayText>W</WeekdayText>
                    <WeekdayText>T</WeekdayText>
                    <WeekdayText>F</WeekdayText>
                    <WeekdayText>S</WeekdayText>
                  </WeekdaysRow>
                  
                  <DaysGrid>
                    {renderCalendar()}
                  </DaysGrid>
                </CalendarContainer>
              )}
            </FilterSection>
          </ContentScroll>

          <ButtonsContainer>
            <ResetButton onPress={handleReset}>
              <ResetButtonText>Reset</ResetButtonText>
            </ResetButton>
            <ApplyButton onPress={handleApply}>
              <ApplyButtonText>Apply Filters</ApplyButtonText>
            </ApplyButton>
          </ButtonsContainer>
        </BottomSheetContainer>
      </ModalOverlay>
    </Modal>
  );
};

export default FilterBottomSheet;