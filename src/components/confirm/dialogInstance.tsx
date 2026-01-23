import { Dialog, Adapt, Sheet, XStack, Button, Text } from 'tamagui';

type DialogInstanceProps = {
  openModal: boolean;
  setRegisterInvalid: (value: boolean) => void;
  erros: string[];
};

export function DialogInstance({ openModal, setRegisterInvalid, erros }: DialogInstanceProps) {
  return (
    <Dialog modal open={openModal}>
      <Adapt /* when="sm" */ platform="touch">
        <Sheet
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 0.5,
            stiffness: 200,
          }}
          animation="medium"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="quickest"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          {erros.length > 0 ? (
            <Dialog.Title>Algo inesperado aconteceu!</Dialog.Title>
          ) : (
            <Dialog.Title>Agendamento Realizado!</Dialog.Title>
          )}

          {erros.map((erro) => {
            return <Text key={erro}>- {erro}</Text>;
          })}

          <XStack alignSelf="center" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              <Button
                width="$20"
                theme="active"
                backgroundColor="#04BF7B"
                color="$white1"
                onPress={() => setRegisterInvalid(false)}
              >
                Ok
              </Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
