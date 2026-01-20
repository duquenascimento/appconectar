import React from 'react';
import { ActivityIndicator } from 'react-native';
import { View } from 'tamagui';

const LoadingActivityIndicator: React.FC = () => {
  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <ActivityIndicator size="large" color="#04BF7B" />
    </View>
  );
};

export default LoadingActivityIndicator;
