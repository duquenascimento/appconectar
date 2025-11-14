import React, { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { View, Text } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';
import { AbandonedCartWatcher } from '../utils/abandonedCart';
import { getStorage } from '../utils/utils';

type Props = {
  cartSize: number;
  selectedRestaurant: string | null;
  onPress: () => void;
};

interface Restaurant {
  id: string;
  externalId: string;
  name: string;
  user: string;
}

export const CartButton: React.FC<Props> = ({ cartSize, selectedRestaurant, onPress }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const [watcherRestaurant, setWatcherRestaurant] = useState<Restaurant | null>(null);
  const [showWatcher, setShowWatcher] = useState(false);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
    translateY.value = withTiming(0, { duration: 100 });
  }, [cartSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: opacity.value === 1 ? 'auto' : 'none',
  }));

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!selectedRestaurant || cartSize <= 0) {
        if (mounted) {
          setWatcherRestaurant(null);
          setShowWatcher(false);
        }
        return;
      }

      try {
        const data = await getStorage('selectedRestaurant');
        if (!data) {
          if (mounted) setShowWatcher(false);
          return;
        }
        const parsed = JSON.parse(data);
        const { restaurant } = parsed;

        if (restaurant.externalId !== selectedRestaurant) {
          if (mounted) setShowWatcher(false);
          return;
        }

        if (mounted) {
          setWatcherRestaurant(restaurant);
          setShowWatcher(true);
        }
      } catch (error) {
        console.error('Erro ao carregar restaurante do AsyncStorage:', error);
        if (mounted) setShowWatcher(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [selectedRestaurant, cartSize]);

  if (Platform.OS === 'web') {
    return (
      <>
        {showWatcher && watcherRestaurant && (
          <AbandonedCartWatcher
            cartSize={cartSize}
            selectedRestaurant={{ restaurant: watcherRestaurant }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 75,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <button
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            onClick={onPress}
          >
            <div
              style={{
                backgroundColor: '#FFA500',
                width: 160,
                height: 25,
                borderRadius: 24,
                padding: '8px 16px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icons size={25} color="white" name="cart" />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -5,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    width: 15,
                    height: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #FFA500',
                    fontSize: 9,
                    color: '#FFA500',
                  }}
                >
                  {cartSize}
                </div>
              </div>
              <span style={{ color: '#fff', paddingLeft: 8 }}>Carrinho</span>
            </div>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {showWatcher && watcherRestaurant && (
        <AbandonedCartWatcher
          cartSize={cartSize}
          selectedRestaurant={{ restaurant: watcherRestaurant }}
        />
      )}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 75,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          },
          animatedStyle,
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View
            backgroundColor="#FFA500"
            width={160}
            height={45}
            borderRadius={24}
            paddingHorizontal={16}
            paddingVertical={8}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            pointerEvents="auto"
          >
            <View>
              <Icons size={25} color="white" name="cart" />
              <View
                position="absolute"
                bottom={-1}
                right={-5}
                backgroundColor="white"
                borderRadius={10}
                width={15}
                height={15}
                alignItems="center"
                justifyContent="center"
                borderColor="#FFA500"
                borderWidth={1}
              >
                <Text fontSize={9} color="#FFA500">
                  {cartSize}
                </Text>
              </View>
            </View>
            <Text color="white" paddingLeft={8}>
              Carrinho
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};
