import React from 'react'
import { GestureResponderEvent, Platform } from 'react-native'
import { Button, Text } from 'tamagui'

interface ButtonComponentProps {
  title: string
  onPress: (event: GestureResponderEvent) => void
  backgroundColor?: string
  textColor?: string
  flex?: number;
  width?: string | number; 
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | 'auto';
  mr?: number;
  ml?: number; 
  borderRadius?: number;
}

const CustomButton: React.FC<ButtonComponentProps> = ({
  title,
  onPress,
  backgroundColor = '#04BF7B',
  textColor = "white",
  flex,
  width, 
  alignSelf, 
  mr,  
  ml, 
  borderRadius,
}) => {
  return (
    <Button
      backgroundColor={backgroundColor}
      onPress={onPress}
      alignItems="center"
      justifyContent="center"
      marginVertical={5}
      hoverStyle={{
        background: backgroundColor,
        opacity: 0.90
      }}
      flex={flex}
      width={width}
      alignSelf={alignSelf}
      mr={mr}
      ml={ml}
      borderRadius={borderRadius}
    >
      <Text fontWeight="500" fontSize={16} color={textColor}>
        {title}
      </Text>
    </Button>
  )
}

export default CustomButton
