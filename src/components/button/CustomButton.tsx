import React from 'react'
import { GestureResponderEvent, Platform } from 'react-native'
import { Button, Text } from 'tamagui'

interface ButtonComponentProps {
  title: string
  onPress: (event: GestureResponderEvent) => void
  backgroundColor?: string
  textColor?: string
  // Adicione estas props para permitir flexibilidade
  flex?: number;
  width?: string | number; // Permite que a largura seja passada se necessário
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | 'auto';
  mr?: number; // Para margem à direita
  ml?: number; // Para margem à esquerda
  borderRadius?: number; // Para borderRadius
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
      // REMOVIDAS AS PROPRIEDADES FIXAS DE LARGURA E ALINHAMENTO
      // Adicionadas as props passadas para o Button Tamagui
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
