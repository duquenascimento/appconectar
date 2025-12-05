import React, { useState } from 'react';
import { Image, View } from 'tamagui';
import Icons from '@expo/vector-icons/Ionicons';

interface ImageWithFallbackProps {
  uri: string;
  size?: number;
  borderRadius?: number;
  fallbackIconSize?: number;
  fallbackBackgroundColor?: string;
  fallbackIconColor?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  uri,
  size = 50,
  borderRadius = 50,
  fallbackIconSize = 24,
  fallbackBackgroundColor = '#f0f0f0',
  fallbackIconColor = 'gray',
}) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View
        width={size}
        height={size}
        borderRadius={borderRadius}
        backgroundColor={fallbackBackgroundColor}
        justifyContent="center"
        alignItems="center"
      >
        <Icons name="image-outline" size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      width={size}
      height={size}
      borderRadius={borderRadius}
      onError={() => setError(true)}
    />
  );
};
