import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Text } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'

type Props = {
  onPress: () => void
}

export const RefreshCartButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: '#04BF7B',
        borderRadius: 10
      }}
    >
      <Icons name="refresh" size={20} color="#04BF7B" />
      <Text style={{ marginLeft: 5, color: '#04BF7B' }}>Atualizar carrinho</Text>
    </TouchableOpacity>
  )
}
