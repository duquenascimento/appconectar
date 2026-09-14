import { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { styled, useMedia } from 'tamagui';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
// import { useChat } from '../../contexts/chat.context';

const DropDownPickerRestaurantStyled = styled(DropDownPicker, {
  width: '92%',
  height: 40,
  marginVertical: 8,
  alignSelf: 'center',
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 5,
  listMode: 'SCROLLVIEW',
  dropDownDirection: 'BOTTOM',

  $gtSm: {
    width: '50%',
  },
});

interface DropDownPickerRestaurantProps {
  onBeforeChange: () => void;
}

export function DropDownPickerRestaurant({ onBeforeChange }: DropDownPickerRestaurantProps) {
  const { restaurants, selectedRestaurant, handleRestaurantChange } = useRestaurantContext();
  const [restaurantOpen, setRestaurantOpen] = useState(false);

  // OBS: CHAT REMOVIDO TEMPORARIAMENTE
  // const { leaveChat } = useChat();

  const media = useMedia();

  return (
    <DropDownPickerRestaurantStyled
      open={restaurantOpen}
      setOpen={setRestaurantOpen}
      value={selectedRestaurant?.externalId ?? ''}
      setValue={async (callback) => {
        if (onBeforeChange) {
          onBeforeChange();
        }
        const value =
          typeof callback === 'function' ? callback(selectedRestaurant?.externalId) : callback;
        const restaurant = restaurants.find((r) => r.externalId === value);
        // OBS: CHAT REMOVIDO TEMPORARIAMENTE
        /* if (selectedRestaurant) {
          leaveChat({
            channelId: selectedRestaurant.id,
            channelType: 'restaurant',
          });
        } */
        await handleRestaurantChange(restaurant ?? null);
      }}
      items={restaurants.map((restaurant) => ({
        label: restaurant.name,
        value: restaurant.externalId,
      }))}
      placeholder={selectedRestaurant ? undefined : 'Selecione um restaurante'}
      searchable={restaurants.length > 10}
      searchPlaceholder="Buscar restaurante..."
      dropDownContainerStyle={{
        width: '92%',
        alignSelf: 'center',

        ...(media.gtSm && {
          width: '50%',
        }),
      }}
    />
  );
}
