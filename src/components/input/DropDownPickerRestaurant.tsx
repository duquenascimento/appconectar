import { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { styled, useMedia } from 'tamagui';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';

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

export function DropDownPickerRestaurant() {
  const { restaurants, selectedRestaurant, handleRestaurantChange } = useRestaurantContext();
  const [restaurantOpen, setRestaurantOpen] = useState(false);

  const media = useMedia();

  return (
    <DropDownPickerRestaurantStyled
      open={restaurantOpen}
      setOpen={setRestaurantOpen}
      value={selectedRestaurant?.externalId ?? ''}
      setValue={async (callback) => {
        const value =
          typeof callback === 'function' ? callback(selectedRestaurant?.externalId) : callback;
        const restaurant = restaurants.find((r) => r.externalId === value);
        await handleRestaurantChange(restaurant ?? null);
      }}
      items={restaurants.map((restaurant) => ({
        label: restaurant.name,
        value: restaurant.externalId,
      }))}
      placeholder={selectedRestaurant ? undefined : 'Selecione um restaurante'}
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
