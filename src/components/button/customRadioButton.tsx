import React from 'react'
import { Pressable, Text, View, GestureResponderEvent } from 'react-native'
import { YStack, XStack } from 'tamagui'

type CustomRadioButtonProps = {
  selected: boolean
  onPress: (event: GestureResponderEvent) => void
  label: string
}

export const CustomRadioButton = ({ selected, onPress, label }: CustomRadioButtonProps) => (
  <Pressable
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}
  >
    <View
      style={{
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
      }}
    >
      {selected && (
        <View
          style={{
            height: 10,
            width: 10,
            borderRadius: 5,
            backgroundColor: '#000',
          }}
        />
      )}
    </View>
    <Text>{label}</Text>
  </Pressable>
)
