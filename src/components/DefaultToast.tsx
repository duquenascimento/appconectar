import { useToastState, Toast } from '@tamagui/toast'
import { YStack } from 'tamagui'

export const DefaultToast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) return null

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -20 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      backgroundColor="$green9"
      padding="$3"
      borderRadius="$4"
    >
      <YStack>
        <Toast.Title color="white" fontWeight="bold">
          {currentToast.title}
        </Toast.Title>
        {!!currentToast.message && (
          <Toast.Description color="white">
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  )
}