import {Text, View } from 'tamagui'

export const VersionInfo = () => {
    return (
      <View position="absolute" bottom={2} right={10}>
        <Text fontSize={10} color="gray">
           v{process.env.EXPO_PUBLIC_VERSION}
        </Text>
      </View>
    )
  }