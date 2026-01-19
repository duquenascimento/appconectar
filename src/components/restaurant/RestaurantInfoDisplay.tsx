import { useDeliveryDate } from '@/src/contexts/deliveryDate.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import Icons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Text, View } from 'tamagui';

interface RestaurantInfoDisplayProps {
  onEditPress: () => void;
  setEmergencyAlertVisible: (visible: boolean) => void;
}

export const RestaurantInfoDisplay: React.FC<RestaurantInfoDisplayProps> = ({
  onEditPress,
  setEmergencyAlertVisible,
}) => {
  const { selectedRestaurant } = useRestaurantContext();
  const [showRestInfo, setShowRestInfo] = useState<boolean>(false);
  const { deliveryDate, getFormattedDate } = useDeliveryDate();

  if (!selectedRestaurant) return null;

  const isEmergencyOrderDay = () => {
    const todayISO = new Date().toISOString().substring(0, 10);
    return deliveryDate === todayISO;
  };

  const restaurantAddressInfo = selectedRestaurant?.addressInfos[0];

  return (
    <View
      onPress={onEditPress}
      backgroundColor="white"
      paddingBottom={10}
      paddingTop={10}
      width={Platform.OS === 'web' ? '70%' : '92%'}
      alignSelf="center"
      borderTopColor="lightgray"
      borderTopWidth={1}
    >
      <View flexDirection="row" alignItems="center">
        <View
          padding={10}
          marginRight={10}
          flexDirection="row"
          flex={1}
          borderColor="lightgray"
          borderRadius={5}
          borderWidth={1}
          paddingHorizontal={10}
          backgroundColor="white"
          alignItems="center"
          overflow="hidden"
        >
          <Icons size={20} color="#04BF7B" name="storefront" />
          <View marginLeft={10} />
          <Text
            numberOfLines={showRestInfo ? 1 : 1}
            ellipsizeMode="tail"
            fontSize={12}
            style={{ flexShrink: 1, width: '100%' }}
          >
            {selectedRestaurant?.name || ''}
          </Text>
        </View>
        <View
          padding={10}
          marginRight={10}
          flexDirection="row"
          flex={1}
          borderColor="lightgray"
          borderRadius={5}
          borderWidth={1}
          paddingHorizontal={10}
          backgroundColor="white"
          alignItems="center"
          overflow="hidden"
        >
          <Icons size={20} color="#04BF7B" name="calendar" />
          <View
            marginLeft={5}
            flex={1}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize={12}>{getFormattedDate()}</Text>
            {isEmergencyOrderDay() ? (
              <Icons
                size={20}
                name="alert-circle"
                color="#04BF7B"
                onPress={() => setEmergencyAlertVisible(true)}
              />
            ) : (
              <></>
            )}
          </View>
        </View>
        <View
          padding={10}
          marginRight={10}
          flexDirection="row"
          flex={1}
          borderColor="lightgray"
          borderRadius={5}
          borderWidth={1}
          paddingHorizontal={5}
          backgroundColor="white"
          alignItems="center"
          overflow="hidden"
        >
          <Icons size={20} color="#04BF7B" name="time" />
          <View marginLeft={10} />
          <Text fontSize={12}>
            {restaurantAddressInfo.initialDeliveryTime.substring(11, 16)} -{' '}
            {restaurantAddressInfo.finalDeliveryTime.substring(11, 16)}
          </Text>
        </View>
        <Icons
          size={20}
          onPress={async () => {
            setShowRestInfo(!showRestInfo);
          }}
          name={showRestInfo ? 'chevron-up' : 'chevron-down'}
        />
      </View>
      <View display={showRestInfo ? 'flex' : 'none'}>
        <View paddingTop={5} flexDirection="row" alignItems="center">
          <View
            padding={10}
            marginRight={10}
            flexDirection="row"
            flex={1}
            borderColor="lightgray"
            borderRadius={5}
            borderWidth={1}
            paddingHorizontal={10}
            backgroundColor="white"
            alignItems="center"
            overflow="hidden"
          >
            <Icons size={20} color="#04BF7B" name="location"></Icons>
            <View marginLeft={20}></View>
            <Text numberOfLines={1} textOverflow="ellipsis" ellipsizeMode="tail" fontSize={12}>
              {restaurantAddressInfo.localType} {restaurantAddressInfo.address},{' '}
              {restaurantAddressInfo.localNumber}. {restaurantAddressInfo.complement} -{' '}
              {restaurantAddressInfo.neighborhood}, {restaurantAddressInfo.city}
            </Text>
          </View>
          <View
            padding={10}
            marginRight={10}
            flexDirection="row"
            flex={2}
            borderColor="lightgray"
            borderRadius={5}
            borderWidth={1}
            paddingHorizontal={10}
            backgroundColor="white"
            alignItems="center"
            overflow="hidden"
          >
            <Icons size={20} color="#04BF7B" name="chatbox"></Icons>
            <View marginLeft={20}></View>
            <Text fontSize={12}>{restaurantAddressInfo.deliveryInformation}</Text>
          </View>
        </View>
        <View paddingTop={5} flexDirection="row" alignItems="center">
          <View
            padding={10}
            marginRight={10}
            flexDirection="row"
            flex={1}
            borderColor="lightgray"
            borderRadius={5}
            borderWidth={1}
            paddingHorizontal={10}
            backgroundColor="white"
            alignItems="center"
            overflow="hidden"
          >
            <Icons size={20} color="#04BF7B" name="person" />
            <View marginLeft={20} />
            <Text fontSize={12}>{restaurantAddressInfo.responsibleReceivingName}</Text>
          </View>
          <View
            padding={10}
            marginRight={10}
            flexDirection="row"
            flex={1}
            borderColor="lightgray"
            borderRadius={5}
            borderWidth={1}
            paddingHorizontal={10}
            backgroundColor="white"
            alignItems="center"
            overflow="hidden"
          >
            <Icons size={20} color="#04BF7B" name="call" />
            <View marginLeft={20} />
            <Text fontSize={12}>{restaurantAddressInfo.responsibleReceivingPhoneNumber}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
