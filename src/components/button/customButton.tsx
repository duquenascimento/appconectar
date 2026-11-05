import React from 'react';
import { GestureResponderEvent, Platform } from 'react-native';
import { Button, Text } from 'tamagui';

interface ButtonComponentProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: number;
  disabled?: boolean;
  testId?: string;
}

const CustomButton: React.FC<ButtonComponentProps> = ({
  title,
  onPress,
  backgroundColor = '#04BF7B',
  textColor = 'white',
  width,
  height,
  disabled,
  testId,
}) => {
  return (
    <Button
      data-testid={testId}
      disabled={disabled}
      height={height}
      backgroundColor={backgroundColor}
      onPress={onPress}
      alignItems="center"
      justifyContent="center"
      marginVertical={5}
      hoverStyle={{
        background: backgroundColor,
        opacity: 0.9,
      }}
      disabledStyle={{
        backgroundColor: '#A9A9A9',
      }}
      width={width || (Platform.OS === 'web' ? '70%' : '92%')}
      alignSelf="center"
    >
      <Text fontWeight="500" fontSize={16} color={textColor}>
        {title}
      </Text>
    </Button>
  );
};

export default CustomButton;
