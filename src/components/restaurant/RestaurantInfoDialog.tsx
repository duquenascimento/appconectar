import React, { forwardRef, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button, Input, ScrollView, Text, View } from 'tamagui';
import { useDeliveryDate } from '../../contexts/deliveryDate.context';
import { useRestaurantContext } from '../../contexts/restaurant.context';
import { Restaurant } from '../../types/restaurantTypes';
import { getBrazilDateTime, getBrazilJSDate, getBrazilJSDateTomorrow } from '../../utils/dateUtils';
import { campoString } from '../../utils/formatCampos';
import { useResponsiveness } from '../hooks/useResponsiveness';
import LoadingActivityIndicator from '../loading/loadingActivityIndicator';
import CustomAlert from '../modais/CustomAlert';
import { setStorageRestaurant } from '@/src/utils/restaurantUtils';

// Conditional DatePicker import for web platform
const getDatePicker = (): any =>
  Platform.OS === 'web' ? require('react-datepicker').default : null;

const MAX_DAYS_FOR_RETROACTIVE_DATE = 60;

// Custom DatePicker input to match DropDownPicker style
const CustomDateInput = forwardRef<any, { value?: string; onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <TouchableOpacity
      onPress={onClick}
      style={{
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 15,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text fontSize={14} color="black">
        {value || 'Selecione a data'}
      </Text>
    </TouchableOpacity>
  ),
);

interface RestaurantInfoDialogProps {
  visible: boolean;
  onClose: () => void;
  handleLoadPrices: (restaurant: Restaurant) => Promise<void>;
}

export const RestaurantInfoDialog: React.FC<RestaurantInfoDialogProps> = ({
  visible,
  onClose,
  handleLoadPrices,
}) => {
  const {
    selectedRestaurant,
    handleRestaurantChange,
    restaurants: allRestaurants,
    updateRestaurant,
  } = useRestaurantContext();
  const [draftSelectedRestaurant, setDraftSelectedRestaurant] = useState<Restaurant | null>(null);

  // Form state
  const [city, setCity] = useState<string>();
  const [zipCode, setZipCode] = useState<string>();
  const [localType, setLocalType] = useState<string>();
  const [street, setStreet] = useState<string>();
  const [localNumber, setLocalNumber] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>();
  const [streetComplete, setStreetComplete] = useState<string>('');
  const [responsibleReceivingName, setResponsibleReceivingName] = useState<string>();
  const [responsibleReceivingPhoneNumber, setResponsibleReceivingPhoneNumber] = useState<string>();
  const [deliveryInformation, setDeliveryInformation] = useState<string>();
  const [complement, setComplement] = useState<string>();

  // Time state
  const [minhours, setMinhours] = useState<string[]>([]);
  const [maxhours, setMaxhours] = useState<string[]>([]);
  const [minHour, setMinHour] = useState<string>('');
  const [maxHour, setMaxHour] = useState<string>('');

  // UI state
  const [dialogLoading, setDialogLoading] = useState<boolean>(false);
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [minHourOpen, setMinHourOpen] = useState(false);
  const [maxHourOpen, setMaxHourOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);

  const { isLargeScreen } = useResponsiveness();

  const {
    deliveryDate,
    initializeDeliveryDates,
    canChangeDeliveryDate,
    deliveryDatesDropdownOptions,
    setDropdownDeliveryDate,
    setDeliveryDate,
    isRetroactiveDate,
    loading: areDeliveryDatesLoading,
  } = useDeliveryDate();

  // Load form data when selected restaurant or draft changes
  useEffect(() => {
    const restaurant = draftSelectedRestaurant || selectedRestaurant;
    if (!restaurant) return;

    const addressInfo = restaurant.addressInfos?.[0];
    if (!addressInfo) return;

    setNeighborhood(addressInfo.neighborhood);
    setCity(addressInfo.city);
    setLocalType(addressInfo.localType);
    setLocalNumber(addressInfo.localNumber || '');
    setResponsibleReceivingName(addressInfo.responsibleReceivingName);
    setResponsibleReceivingPhoneNumber(addressInfo.responsibleReceivingPhoneNumber);
    setZipCode(addressInfo.zipCode?.replace(/\D/g, '')?.replace(/(\d{5})(\d{3})/, '$1-$2'));
    setStreet(addressInfo.address);
    setComplement(addressInfo.complement);
    setDeliveryInformation(addressInfo.deliveryInformation);
    setMinHour(addressInfo.initialDeliveryTime?.substring(11, 16));
    setMaxHour(addressInfo.finalDeliveryTime?.substring(11, 16));
    setStreetComplete(`${addressInfo.localType ?? ''} ${addressInfo.address ?? ''}`.trim());
  }, [draftSelectedRestaurant, selectedRestaurant]);

  // Generate hour options
  useEffect(() => {
    const hours = [];
    for (let hour = 0; hour < 22; hour++) {
      hours.push(`${String(hour).padStart(2, '0')}:00`);
      hours.push(`${String(hour).padStart(2, '0')}:30`);
    }
    hours.push('22:00');
    setMinhours(hours);
  }, []);

  // Update maxhours when minHour changes
  useEffect(() => {
    if (minHour) {
      const [minHourValue, minMinuteValue] = minHour.split(':').map(Number);
      const [currentMaxHourValue, currentMaxMinuteValue] = maxHour
        ? maxHour.split(':').map(Number)
        : [0, 0];

      let hour = minHourValue + 1;
      let minute = minMinuteValue + 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      const newMaxInMinutes = hour * 60 + minute;
      const currentMaxInMinutes = currentMaxHourValue * 60 + currentMaxMinuteValue;

      if (currentMaxInMinutes < newMaxInMinutes) {
        const updatedMaxHour = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        setMaxHour(updatedMaxHour);
      }

      const maxOptions = [];
      hour = minHourValue + 1;
      minute = minMinuteValue + 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      while (hour < 24) {
        maxOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        minute += 30;
        if (minute >= 60) {
          minute -= 60;
          hour += 1;
        }
      }

      setMaxhours(maxOptions);
    } else {
      setMaxhours([]);
    }
  }, [minHour, maxHour]);

  const validateFields = () => {
    const fieldLabels: { [key: string]: string } = {
      zipCode: 'CEP',
      localNumber: 'Número',
      street: 'Rua',
      responsibleReceivingName: 'Nome do responsável',
      responsibleReceivingPhoneNumber: 'Telefone do responsável',
      localType: 'Logradouro',
      city: 'Cidade',
      neighborhood: 'Bairro',
    };

    const fields: Record<string, string | undefined> = {
      zipCode,
      localNumber,
      street,
      responsibleReceivingName,
      responsibleReceivingPhoneNumber,
      localType,
      city,
      neighborhood,
    };

    const requiredFields = Object.values(fields);
    const isValid = requiredFields.every((field) => field?.trim());

    if (!isValid) {
      const emptyFields = Object.keys(fields).filter((key) => !fields[key]?.trim());
      setMissingFields(emptyFields.map((key) => fieldLabels[key]));
      setIsAlertVisible(true);
    }

    return isValid;
  };

  const isDateSelectionDisabled = () => {
    const restaurant = draftSelectedRestaurant || selectedRestaurant;
    return !canChangeDeliveryDate && !restaurant?.allowRetroactiveQuotation;
  };

  const handleDeliveryDateDropdownPress = () => {
    if (isDateSelectionDisabled()) return;

    const restaurant = draftSelectedRestaurant || selectedRestaurant;

    if (restaurant?.allowRetroactiveQuotation) {
      setShowDatePicker(!showDatePicker);
      return;
    }

    setDeliveryDateOpen(!deliveryDateOpen);
  };

  const handleDatePickerConfirm = (date: Date | null) => {
    if (!date) return;

    // Format date as yyyy-MM-dd
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setDeliveryDate(formattedDate);
    setShowDatePicker(false);
  };

  const handleNativeDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativeDatePicker(false);

      if (event.type === 'set' && selectedDate) {
        // Check if date is excluded
        const restaurant = draftSelectedRestaurant || selectedRestaurant;
        const isExcluded = isDateExcluded(selectedDate, restaurant?.allowEmergencyOrder);

        if (isExcluded) {
          const excludedDateName = restaurant?.allowEmergencyOrder ? 'amanhã' : 'hoje';
          Alert.alert('Data inválida', `A data ${excludedDateName} não pode ser selecionada.`, [
            { text: 'OK' },
          ]);
          return;
        }

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setDeliveryDate(formattedDate);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDate) {
        setTempSelectedDate(selectedDate);
      }
    }
  };

  const isDateExcluded = (date: Date, allowEmergencyOrder?: boolean): boolean => {
    const today = getBrazilJSDate();
    const tomorrow = getBrazilJSDateTomorrow();

    // Normalize dates to compare only year, month, day
    const normalizeDate = (d: Date) => {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    const selectedTime = normalizeDate(date);
    const todayTime = normalizeDate(today);
    const tomorrowTime = normalizeDate(tomorrow);

    if (allowEmergencyOrder) {
      // If emergency order is allowed, exclude tomorrow
      return selectedTime === tomorrowTime;
    } else {
      // If emergency order is not allowed, exclude today
      return selectedTime === todayTime;
    }
  };

  const handleConfirmDatePicker = () => {
    if (tempSelectedDate) {
      // Check if date is excluded before confirming
      const restaurant = draftSelectedRestaurant || selectedRestaurant;
      const isExcluded = isDateExcluded(tempSelectedDate, restaurant?.allowEmergencyOrder);

      if (isExcluded) {
        const excludedDateName = restaurant?.allowEmergencyOrder ? 'amanhã' : 'hoje';
        Alert.alert('Data inválida', `A data ${excludedDateName} não pode ser selecionada.`, [
          { text: 'OK' },
        ]);
        setShowNativeDatePicker(false);
        setTempSelectedDate(null);
        return;
      }

      const year = tempSelectedDate.getFullYear();
      const month = String(tempSelectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(tempSelectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setDeliveryDate(formattedDate);
    }
    setShowNativeDatePicker(false);
    setTempSelectedDate(null);
  };

  const handleCancelDatePicker = () => {
    setShowNativeDatePicker(false);
    setTempSelectedDate(null);
  };

  const handleDatePickerPress = () => {
    if (Platform.OS === 'web') {
      setShowDatePicker(!showDatePicker);
    } else {
      // Initialize temp date with current delivery date
      setTempSelectedDate(getBrazilJSDate(deliveryDate));
      setShowNativeDatePicker(true);
    }
  };

  if (!visible) return null;

  const handleCepChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');

    if (formatted.length === 9) {
      setDialogLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const result = await response.json();
      if (response.ok && !result.erro) {
        const rawStreet = campoString(result.logradouro);
        const [streetType, ...streetNameParts] = rawStreet.trim().split(' ');

        setCity(campoString(result.localidade));
        setNeighborhood(campoString(result.bairro));
        setLocalType(streetType?.toUpperCase() || '');
        setStreet(streetNameParts.join(' '));
        setStreetComplete(rawStreet);
        setLocalNumber('');
      }
      setDialogLoading(false);
    }

    setZipCode(formatted);
  };

  const handleStreetChange = (value: string) => {
    const formattedValue = value.replace(/[^A-Za-z\s]/g, '');
    const parts = formattedValue.trim().split(' ');
    const localType = parts[0]?.toUpperCase() || '';
    const streetName = parts.slice(1).join(' ');
    setLocalType(localType);
    setStreet(streetName);
    setStreetComplete(formattedValue);
  };

  const handlePhoneChange = (value: string) => {
    let onlyNums = value.replace(/\D/g, '');

    if (onlyNums.length > 10) {
      onlyNums = onlyNums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (onlyNums.length > 6) {
      onlyNums = onlyNums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (onlyNums.length > 2) {
      onlyNums = onlyNums.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else if (onlyNums.length > 0) {
      onlyNums = onlyNums.replace(/(\d{0,2})/, '($1');
    }

    setResponsibleReceivingPhoneNumber(onlyNums);
  };

  const handleSavePress = async () => {
    if (!validateFields()) return;

    setDialogLoading(true);

    const changeRestaurant = draftSelectedRestaurant ?? selectedRestaurant;

    const restaurant: Restaurant = JSON.parse(JSON.stringify(changeRestaurant));
    const addressInfo = restaurant.addressInfos[0];

    addressInfo.neighborhood = neighborhood ?? '';
    addressInfo.city = city ?? '';
    addressInfo.localType = localType ?? '';
    addressInfo.localNumber = localNumber;
    addressInfo.responsibleReceivingName = responsibleReceivingName ?? '';
    addressInfo.responsibleReceivingPhoneNumber = responsibleReceivingPhoneNumber ?? '';
    addressInfo.zipCode = zipCode?.replaceAll(' ', '').replace('-', '') ?? '';
    addressInfo.address = street ?? '';
    addressInfo.complement = complement ?? '';
    addressInfo.deliveryInformation = deliveryInformation ?? '';
    addressInfo.finalDeliveryTime = `1970-01-01T${maxHour}:00.000Z`;
    addressInfo.initialDeliveryTime = `1970-01-01T${minHour}:00.000Z`;

    if (draftSelectedRestaurant) {
      await setStorageRestaurant(restaurant);
      await handleRestaurantChange(restaurant);
    } else {
      await updateRestaurant(restaurant);
      handleLoadPrices(restaurant);
    }

    setDraftSelectedRestaurant(null);
    setDialogLoading(false);
    onClose();
  };

  const handleCancelPress = () => {
    onClose();
    setDraftSelectedRestaurant(null);
    setDialogLoading(false);
  };

  const handleRestaurantDropdownChange = (restaurantName?: string) => {
    const restaurant = allRestaurants.find((r) => r.name === restaurantName);

    if (!restaurant) return;

    setDraftSelectedRestaurant(restaurant);
    initializeDeliveryDates(restaurant.id);
  };

  const isSaveButtonEnabled =
    zipCode?.length === 9 &&
    localNumber?.length &&
    street?.length &&
    responsibleReceivingName?.length &&
    responsibleReceivingPhoneNumber?.length &&
    localType?.length &&
    city?.length;

  return (
    <View flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
      <Modal transparent={true} animationType={isLargeScreen ? 'fade' : 'slide'}>
        <View flex={1} backgroundColor="rgba(0, 0, 0, 0.9)">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              ...(isLargeScreen && { justifyContent: 'center', alignItems: 'center' }),
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              paddingBottom={15}
              paddingHorizontal={15}
              paddingTop={isLargeScreen ? 40 : 60}
              width={isLargeScreen ? '40%' : '100%'}
              minHeight={isLargeScreen ? undefined : '100%'}
              backgroundColor="white"
              borderRadius={isLargeScreen ? 10 : 0}
              zIndex={101}
              style={{ overflow: 'visible' }}
              {...(isLargeScreen && { alignSelf: 'center' })}
            >
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={{ overflow: 'visible' }}
                  contentContainerStyle={{
                    overflow: 'visible',
                    paddingBottom: isLargeScreen ? 0 : 20,
                  }}
                  showsVerticalScrollIndicator={!isLargeScreen}
                >
                  <Text paddingLeft={5} fontSize={12} color="gray">
                    Restaurante
                  </Text>
                  {allRestaurants.length > 0 ? (
                    <DropDownPicker
                      listMode="SCROLLVIEW"
                      value={draftSelectedRestaurant?.name ?? selectedRestaurant?.name ?? ''}
                      style={{
                        borderWidth: 1,
                        borderColor: 'lightgray',
                        borderRadius: 5,
                        flex: 1,
                        marginBottom: Platform.OS === 'web' ? 0 : isLargeScreen ? 35 : 5,
                      }}
                      {...(!isLargeScreen && {
                        zIndex: 5000,
                        zIndexInverse: 5000,
                      })}
                      setValue={() => {}}
                      items={allRestaurants.map((item) => ({
                        label: item?.name,
                        value: item?.name,
                      }))}
                      multiple={false}
                      open={restOpen}
                      setOpen={setRestOpen}
                      placeholder=""
                      onSelectItem={(value) => {
                        handleRestaurantDropdownChange(value.value);
                      }}
                    />
                  ) : (
                    <Text>Carregando...</Text>
                  )}

                  <View
                    paddingTop={isLargeScreen ? 10 : 5}
                    gap={10}
                    marginBottom={Platform.OS === 'web' ? 0 : isLargeScreen ? 35 : 0}
                    justifyContent="space-between"
                    flexDirection="row"
                    zIndex={100}
                    style={{ overflow: 'visible' }}
                  >
                    <View
                      flex={1}
                      {...(!isLargeScreen && {
                        marginRight: 5,
                      })}
                      style={{ overflow: 'visible' }}
                    >
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        Data de entrega
                      </Text>
                      {(draftSelectedRestaurant || selectedRestaurant)
                        ?.allowRetroactiveQuotation ? (
                        <View style={{ position: 'relative', zIndex: 9999, overflow: 'visible' }}>
                          {Platform.OS === 'web' ? (
                            (() => {
                              const DatePicker = getDatePicker();
                              return DatePicker ? (
                                <DatePicker
                                  selected={getBrazilJSDate(deliveryDate)}
                                  onSelect={handleDatePickerConfirm}
                                  onChange={handleDatePickerConfirm}
                                  customInput={<CustomDateInput />}
                                  dateFormat="dd/MM/yyyy"
                                  allowSameDay={
                                    (draftSelectedRestaurant || selectedRestaurant)
                                      ?.allowEmergencyOrder
                                  }
                                  minDate={getBrazilDateTime()
                                    .minus({ days: MAX_DAYS_FOR_RETROACTIVE_DATE })
                                    .toJSDate()}
                                  excludeDates={
                                    (draftSelectedRestaurant || selectedRestaurant)
                                      ?.allowEmergencyOrder
                                      ? [getBrazilJSDateTomorrow()]
                                      : [getBrazilJSDate()]
                                  }
                                  maxDate={getBrazilJSDate(
                                    deliveryDatesDropdownOptions()[
                                      deliveryDatesDropdownOptions().length - 1
                                    ]?.value,
                                  )}
                                  popperProps={{
                                    strategy: 'fixed',
                                  }}
                                  popperPlacement="bottom-start"
                                />
                              ) : null;
                            })()
                          ) : (
                            <>
                              <TouchableOpacity
                                onPress={handleDatePickerPress}
                                style={{
                                  borderWidth: 1,
                                  borderColor: 'lightgray',
                                  borderRadius: 5,
                                  paddingHorizontal: 12,
                                  paddingVertical: 15,
                                  backgroundColor: 'white',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Text fontSize={14} color="black">
                                  {deliveryDate
                                    ? getBrazilJSDate(deliveryDate).toLocaleDateString('pt-BR')
                                    : 'Selecione a data'}
                                </Text>
                              </TouchableOpacity>
                              {showNativeDatePicker && Platform.OS === 'ios' && (
                                <Modal transparent animationType="slide">
                                  <View
                                    flex={1}
                                    justifyContent="flex-end"
                                    backgroundColor="rgba(0, 0, 0, 0.5)"
                                  >
                                    <View
                                      backgroundColor="white"
                                      borderTopLeftRadius={20}
                                      borderTopRightRadius={20}
                                    >
                                      <View
                                        flexDirection="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        paddingHorizontal={20}
                                        paddingTop={15}
                                        paddingBottom={10}
                                        borderBottomWidth={1}
                                        borderBottomColor="#e0e0e0"
                                      >
                                        <Button
                                          onPress={handleCancelDatePicker}
                                          backgroundColor="transparent"
                                          pressStyle={{ opacity: 0.5 }}
                                        >
                                          <Text color="#007AFF" fontSize={17}>
                                            Cancelar
                                          </Text>
                                        </Button>
                                        <Text fontSize={17} fontWeight="600">
                                          Selecionar Data
                                        </Text>
                                        <Button
                                          onPress={handleConfirmDatePicker}
                                          backgroundColor="transparent"
                                          pressStyle={{ opacity: 0.5 }}
                                        >
                                          <Text color="#007AFF" fontSize={17} fontWeight="600">
                                            Confirmar
                                          </Text>
                                        </Button>
                                      </View>
                                      <View paddingHorizontal={'12%'}>
                                        <DateTimePicker
                                          value={tempSelectedDate || getBrazilJSDate(deliveryDate)}
                                          mode="date"
                                          display="spinner"
                                          onChange={handleNativeDateChange}
                                          minimumDate={getBrazilDateTime()
                                            .minus({ days: MAX_DAYS_FOR_RETROACTIVE_DATE })
                                            .toJSDate()}
                                          maximumDate={getBrazilJSDate(
                                            deliveryDatesDropdownOptions()[
                                              deliveryDatesDropdownOptions().length - 1
                                            ]?.value,
                                          )}
                                          style={{ height: 200 }}
                                        />
                                      </View>
                                    </View>
                                  </View>
                                </Modal>
                              )}
                              {showNativeDatePicker && Platform.OS === 'android' && (
                                <DateTimePicker
                                  value={getBrazilJSDate(deliveryDate)}
                                  mode="date"
                                  display="default"
                                  onChange={handleNativeDateChange}
                                  minimumDate={getBrazilDateTime()
                                    .minus({ days: MAX_DAYS_FOR_RETROACTIVE_DATE })
                                    .toJSDate()}
                                  maximumDate={getBrazilJSDate(
                                    deliveryDatesDropdownOptions()[
                                      deliveryDatesDropdownOptions().length - 1
                                    ]?.value,
                                  )}
                                />
                              )}
                            </>
                          )}
                        </View>
                      ) : (
                        <DropDownPicker
                          value={deliveryDate}
                          zIndex={2}
                          disabled={isDateSelectionDisabled()}
                          {...(isLargeScreen && { loading: areDeliveryDatesLoading })}
                          style={{
                            borderWidth: 1,
                            borderColor: 'lightgray',
                            borderRadius: 5,
                            flex: 1,
                          }}
                          textStyle={{ color: isDateSelectionDisabled() ? 'gray' : 'black' }}
                          setValue={setDropdownDeliveryDate}
                          items={deliveryDatesDropdownOptions()}
                          multiple={false}
                          open={deliveryDateOpen}
                          setOpen={handleDeliveryDateDropdownPress}
                          placeholder=""
                          listMode="SCROLLVIEW"
                          showArrowIcon={canChangeDeliveryDate}
                        />
                      )}
                    </View>

                    <View
                      flex={1}
                      {...(!isLargeScreen && {
                        marginRight: 5,
                      })}
                      {...(isLargeScreen && { zIndex: 100 })}
                    >
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        A partir de
                      </Text>
                      <DropDownPicker
                        value={minHour}
                        setValue={setMinHour}
                        items={minhours.map((item) => ({
                          label: item,
                          value: item,
                        }))}
                        multiple={false}
                        open={minHourOpen}
                        setOpen={setMinHourOpen}
                        {...(!isLargeScreen && {
                          onOpen: () => setMaxHourOpen(false),
                          listMode: 'MODAL',
                          modalProps: {
                            animationType: 'slide',
                            transparent: false,
                            presentationStyle: 'formSheet',
                          },
                          modalContentContainerStyle: {
                            backgroundColor: '#fff',
                            padding: 20,
                            borderRadius: 10,
                            margin: 40,
                          },
                          zIndex: 4000,
                          zIndexInverse: 4000,
                        })}
                        {...(isLargeScreen && {
                          listMode: 'SCROLLVIEW',
                          zIndex: 2,
                        })}
                        placeholder=""
                        style={{
                          borderWidth: 1,
                          borderColor: 'lightgray',
                          borderRadius: 5,
                          flex: 1,
                        }}
                      />
                    </View>

                    <View
                      flex={1}
                      {...(!isLargeScreen && {
                        marginLeft: 5,
                      })}
                      {...(isLargeScreen && { zIndex: 100 })}
                    >
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        Até
                      </Text>
                      <DropDownPicker
                        value={maxHour}
                        setValue={setMaxHour}
                        items={maxhours.map((item) => ({
                          label: item,
                          value: item,
                        }))}
                        multiple={false}
                        open={maxHourOpen}
                        setOpen={setMaxHourOpen}
                        {...(!isLargeScreen && {
                          onOpen: () => setMinHourOpen(false),
                          listMode: 'MODAL',
                          modalProps: {
                            animationType: 'slide',
                            transparent: false,
                            presentationStyle: 'formSheet',
                          },
                          modalContentContainerStyle: {
                            backgroundColor: '#fff',
                            padding: 20,
                            borderRadius: 10,
                            margin: 40,
                          },
                          zIndex: 4000,
                          zIndexInverse: 4000,
                        })}
                        {...(isLargeScreen && {
                          listMode: 'SCROLLVIEW',
                        })}
                        placeholder=""
                        style={{
                          borderWidth: 1,
                          borderColor: 'lightgray',
                          borderRadius: 5,
                          flex: 1,
                        }}
                      />
                    </View>
                  </View>

                  {isRetroactiveDate && (
                    <View
                      backgroundColor="#E3F2FD"
                      borderColor="#2196F3"
                      borderWidth={1}
                      borderRadius={4}
                      paddingHorizontal={8}
                      paddingVertical={4}
                      marginTop={4}
                    >
                      <Text fontSize={11} color="#1976D2">
                        📅 Cotação retroativa - Preços históricos
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      marginBottom: 5,
                      ...(isLargeScreen ? {} : { flexWrap: 'wrap' }),
                    }}
                  >
                    <View width={150}>
                      <Text paddingTop={10} paddingLeft={5} fontSize={12} color="gray">
                        Cep <Text color="red"> *</Text>
                      </Text>
                      <Input
                        maxLength={9}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        onChangeText={handleCepChange}
                        value={zipCode}
                      />
                    </View>

                    <View zIndex={-1} flex={1} {...(isLargeScreen && { marginTop: 10 })}>
                      <Text
                        paddingTop={isLargeScreen ? 0 : 10}
                        paddingLeft={5}
                        fontSize={12}
                        color="gray"
                      >
                        Cidade <Text color="red"> *</Text>
                      </Text>
                      <Input
                        color="gray"
                        fontSize={12}
                        disabled
                        flex={1}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={city}
                        {...(!isLargeScreen && {
                          marginBottom: 10,
                          marginRight: 1,
                          borderWidth: 1,
                        })}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                      />
                    </View>
                  </View>

                  <View flex={isLargeScreen ? 1 : undefined}>
                    <Text paddingLeft={5} fontSize={12} color="gray">
                      Bairro <Text color="red"> *</Text>
                    </Text>
                    <Input
                      color="gray"
                      fontSize={12}
                      disabled
                      backgroundColor="white"
                      borderColor="lightgray"
                      borderRadius={5}
                      value={neighborhood}
                      {...(!isLargeScreen && {
                        marginBottom: 10,
                        marginRight: 1,
                      })}
                      focusStyle={{
                        borderColor: '#049A63',
                        borderWidth: 1,
                      }}
                      hoverStyle={{
                        borderColor: '#049A63',
                        borderWidth: 1,
                      }}
                    />
                  </View>

                  <View
                    flexDirection="row"
                    marginTop={10}
                    {...(!isLargeScreen && {
                      flexWrap: 'wrap',
                      gap: 10,
                      marginBottom: 5,
                    })}
                  >
                    <View flex={1}>
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        Rua <Text color="red"> *</Text>
                      </Text>
                      <Input
                        onChangeText={handleStreetChange}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={streetComplete}
                        {...(isLargeScreen && {
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        })}
                        {...(!isLargeScreen && {
                          marginRight: 1,
                        })}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                      />
                    </View>
                  </View>

                  <View
                    zIndex={-1}
                    height={70}
                    marginBottom={5}
                    paddingTop={10}
                    gap={10}
                    justifyContent="space-between"
                    flexDirection="row"
                  >
                    <View flex={1} {...(!isLargeScreen && { position: 'relative' })}>
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        Nº <Text color="red"> *</Text>
                      </Text>
                      <Input
                        {...(isLargeScreen && { height: 43 })}
                        fontSize={14}
                        flex={1}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={localNumber}
                        keyboardType="numeric"
                        onChangeText={(value) => {
                          const formattedValue = value.replace(/[^0-9]/g, '');
                          setLocalNumber(formattedValue);
                        }}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                      />
                    </View>

                    <View flex={1} {...(!isLargeScreen && { position: 'relative' })}>
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        Complemento
                      </Text>
                      <Input
                        fontSize={14}
                        flex={1}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={complement}
                        onChangeText={(value) => {
                          setComplement(value);
                        }}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                      />
                    </View>
                  </View>

                  <View
                    zIndex={-1}
                    height={70}
                    paddingTop={10}
                    gap={10}
                    justifyContent="space-between"
                    flexDirection="row"
                  >
                    <View flex={1}>
                      <Text fontSize={12} color="gray">
                        Resp. recebimento <Text color="red"> *</Text>
                      </Text>
                      <Input
                        fontSize={14}
                        flex={1}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={responsibleReceivingName}
                        onChangeText={(value) => {
                          const formattedValue = value.replace(/[^A-Za-z\s]/g, '');
                          setResponsibleReceivingName(formattedValue);
                        }}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                      />
                    </View>

                    <View flex={1}>
                      <Text fontSize={12} color="gray">
                        Cel Resp. recebimento <Text color="red"> *</Text>
                      </Text>
                      <Input
                        maxLength={15}
                        fontSize={14}
                        flex={1}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={responsibleReceivingPhoneNumber}
                        keyboardType="phone-pad"
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        onChangeText={handlePhoneChange}
                      />
                    </View>
                  </View>

                  <View
                    height={70}
                    paddingTop={10}
                    gap={5}
                    justifyContent="space-between"
                    flexDirection="row"
                  >
                    <View flex={1}>
                      <Text paddingLeft={5} fontSize={12} color="gray">
                        Info de entrega
                      </Text>
                      <Input
                        fontSize={14}
                        flex={1}
                        backgroundColor="white"
                        borderColor="lightgray"
                        borderRadius={5}
                        value={deliveryInformation}
                        onChangeText={(value) => {
                          setDeliveryInformation(value);
                        }}
                        focusStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                        hoverStyle={{
                          borderColor: '#049A63',
                          borderWidth: 1,
                        }}
                      />
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>

              <View
                height={70}
                paddingTop={15}
                gap={5}
                justifyContent="space-between"
                flexDirection="row"
              >
                <Button onPress={handleCancelPress} backgroundColor="#ff6d6d" flex={1}>
                  <Text paddingLeft={5} fontSize={12} color="white">
                    Cancelar
                  </Text>
                </Button>
                <Button
                  {...(isSaveButtonEnabled ? {} : { opacity: 0.4, disabled: true })}
                  onPress={handleSavePress}
                  backgroundColor="#04BF7B"
                  flex={1}
                >
                  <Text paddingLeft={5} fontSize={12} color="white">
                    Salvar
                  </Text>
                </Button>
              </View>

              {dialogLoading && (
                <View
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  borderRadius={isLargeScreen ? 10 : 0}
                  backgroundColor="rgba(255, 255, 255, 0.8)"
                  justifyContent="center"
                  alignItems="center"
                  zIndex={9999}
                >
                  <LoadingActivityIndicator />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        <CustomAlert
          visible={isAlertVisible}
          title="Campos obrigatórios"
          message={`Por favor, preencha todos os campos obrigatórios:\n\n- ${missingFields.join('\n- ')}`}
          onConfirm={() => setIsAlertVisible(false)}
        />
      </Modal>
    </View>
  );
};
