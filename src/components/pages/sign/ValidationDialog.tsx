import { openURL } from "expo-linking";
import { Adapt, Button, Dialog, Sheet, Text, XStack } from "tamagui";

export function ValidationDialog(props: {
  openModal: boolean;
  setRegisterInvalid: Function;
  erros: string[];
  document?: string;
}) {
  return (
    <Dialog modal open={props.openModal}>
      <Adapt platform="touch">
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
          <Dialog.Title>Ops!</Dialog.Title>
          <Dialog.Description>
            Houve alguns probleminhas, corrija antes de continuar
          </Dialog.Description>

          {props.erros.map((erro) => {
            return <Text key={erro}>{erro}</Text>;
          })}

          <XStack alignSelf="center" gap="$4">
            <Dialog.Close displayWhenAdapted asChild>
              {/* Envolva os botões em um container único */}
              <XStack gap="$4">
                <Button
                  width="$20"
                  theme="active"
                  aria-label="Close"
                  backgroundColor="#04BF7B"
                  color="$white1"
                  onPress={() => props.setRegisterInvalid(false)}
                >
                  Ok
                </Button>
                {props.erros.find(
                  (erro) =>
                    erro === 'Este documento já existe na plataforma' ||
                    erro.includes('já existe na plataforma'),
                ) && (
                  <Button
                    width="$20"
                    theme="active"
                    backgroundColor="#FFA500"
                    color="$white1"
                    onPress={() => {
                      let msg = `Olá! Gostaria de acessar a conta com o CPF/CNPJ ${
                        props.document ?? ''
                      }, pode me ajudar?`;
                      msg = encodeURIComponent(msg)
                        .replace('!', '%21')
                        .replace("'", '%27')
                        .replace('(', '%28')
                        .replace(')', '%29')
                        .replace('*', '%2A');

                      const endpoint = `https://wa.me/5521999954372?text=${msg}`;
                      openURL(endpoint).catch((err) =>
                        console.error(`Erro ao redirecionar ao Whatsapp: ${err}`),
                      );
                    }}
                  >
                    Suporte
                  </Button>
                )}
              </XStack>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}