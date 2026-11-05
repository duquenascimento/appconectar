import { createElement, ReactNode } from 'react';
import { Platform } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';
import { landingContent } from './landingContent';

const VIDEO_MAX_WIDTH = 360;

export function VideoSection(props: { url?: string; stacked: boolean; children?: ReactNode }) {
  if (!props.url || Platform.OS !== 'web') return null;

  const player = (
    <View
      width="100%"
      maxWidth={VIDEO_MAX_WIDTH}
      aspectRatio={9 / 16}
      borderRadius={9}
      overflow="hidden"
      backgroundColor="black"
      alignSelf="center"
    >
      {createElement('video', {
        src: props.url,
        controls: true,
        muted: true,
        playsInline: true,
        preload: 'metadata',
        style: { width: '100%', height: '100%', objectFit: 'contain' },
      })}
    </View>
  );

  const text = (
    <YStack flex={1} gap="$3" alignItems={props.stacked ? 'center' : 'flex-start'}>
      <Text
        fontSize={props.stacked ? 24 : 30}
        fontWeight="700"
        textAlign={props.stacked ? 'center' : 'left'}
      >
        {landingContent.video.title}
      </Text>
      <Text fontSize={16} color="$gray10Dark" textAlign={props.stacked ? 'center' : 'left'}>
        {landingContent.video.subtitle}
      </Text>
      {!props.stacked && props.children}
    </YStack>
  );

  if (props.stacked) {
    return (
      <YStack width="100%" gap="$4">
        {text}
        {player}
        {props.children}
      </YStack>
    );
  }

  return (
    <XStack width="100%" gap={48} alignItems="center" justifyContent="space-between">
      {text}
      <View flex={1} alignItems="center">
        {player}
      </View>
    </XStack>
  );
}
