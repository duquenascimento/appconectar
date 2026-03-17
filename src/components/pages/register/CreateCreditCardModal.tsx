import { Formik } from 'formik';
import { Button, Dialog, Input, Label, Text, XStack, YStack } from 'tamagui';
import { CreateCreditCardDto } from '@/src/types/paymentTypes';
import React from 'react';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { Restaurant } from '@/src/types/restaurantTypes';
import { creditCardCreationValidator } from '@/src/validators/payment.form.validators';
import { formatCreditCardNumber } from '@/src/utils/creditCardUtils';

async function onSubmit(
  data: {
    number: string;
    expiry: string;
    cvv: string;
    holderName: string;
    holderDoc: string;
    nickname: string;
  },
  restaurant: Restaurant | null | undefined,
  onSave: (creditCard: CreateCreditCardDto) => Promise<void>,
  onClose: Function,
  setError: Function,
  isLoading: boolean,
  setIsLoading: (value: boolean) => void,
): Promise<void> {
  if (isLoading) {
    return;
  }

  try {
    setError('');
    setIsLoading(true);

    const restaurantId = restaurant ? restaurant.id : '';
    if (!restaurantId) {
      setError('Selecione um restaurante válido!');
      return;
    }
    const cardData: CreateCreditCardDto = {
      restaurantId: restaurantId,
      nickname: data.nickname,
      isDefault: true,
      creditCard: {
        holderName: data.holderName,
        number: data.number.replaceAll(' ', ''),
        expiryMonth: data.expiry.split('/')[0],
        expiryYear: `20${data.expiry.split('/')[1]}`,
        ccv: data.cvv,
      },
      creditCardHolderInfo: {
        name: data.holderName,
        cpfCnpj: data.holderDoc,
      },
    };
    await onSave(cardData);
    onClose();
  } catch (err) {
    console.log(err);
    setError(err instanceof Error ? err.message : 'Ops, algo deu errado');
  } finally {
    setIsLoading(false);
  }
}

export function CreateCreditCardModal(props: {
  onSave: (creditCard: CreateCreditCardDto) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { onSave, open, setOpen } = props;
  const { selectedRestaurant } = useRestaurantContext();
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} />
        <Dialog.Content bordered elevate key="content" animation="quick">
          <Formik
            initialValues={{
              number: '',
              expiry: '',
              cvv: '',
              holderName: '',
              nickname: '',
              holderDoc: '',
            }}
            validationSchema={creditCardCreationValidator}
            onSubmit={(values) =>
              onSubmit(values, selectedRestaurant, onSave, () => setOpen(false), setError, isLoading, setIsLoading)
            }
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <YStack gap={'$2'}>
                <Dialog.Title>Novo cartão de crédito</Dialog.Title>
                <Dialog.Description>
                  Para realizar compras na plataforma, cadastre um cartão de crédito válido
                </Dialog.Description>

                <YStack gap={'$1'}>
                  <Label htmlFor="number">Apelido do Cartão</Label>
                  <Input
                    id="nickname"
                    placeholder="Meu melhor cartão"
                    value={values.nickname}
                    onBlur={handleBlur('nickname')}
                    onChangeText={handleChange('nickname')}
                    borderColor={touched.nickname && errors.nickname ? '$red10' : '$borderColor'}
                  />
                  {touched.nickname && errors.nickname && (
                    <Text fontSize={12} color="red">
                      {errors.nickname}
                    </Text>
                  )}
                </YStack>
                <YStack gap={'$1'}>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    placeholder="0000 0000 0000 0000"
                    keyboardType="numeric"
                    value={values.number}
                    onBlur={handleBlur('number')}
                    onChangeText={(value) => {
                      const formatted = formatCreditCardNumber(value);
                      handleChange('number')(formatted);
                    }}
                    borderColor={touched.number && errors.number ? '$red10' : '$borderColor'}
                  />
                  {touched.number && errors.number && (
                    <Text fontSize={12} color="red">
                      {errors.number}
                    </Text>
                  )}
                </YStack>

                <XStack gap={'$2'}>
                  <YStack gap={'$1'}>
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="00/00"
                      keyboardType="numeric"
                      value={values.expiry}
                      onBlur={handleBlur('expiry')}
                      onChangeText={(value) => {
                        const cleaned = value.replace(/[^0-9]/g, '');
                        const formatted =
                          cleaned.length <= 2
                            ? cleaned
                            : `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
                        handleChange('expiry')(formatted);
                      }}
                      borderColor={touched.expiry && errors.expiry ? '$red10' : '$borderColor'}
                    />
                    {touched.expiry && errors.expiry && (
                      <Text fontSize={12} color="red">
                        {errors.expiry}
                      </Text>
                    )}
                  </YStack>

                  <YStack gap={'$1'}>
                    <Label htmlFor="number">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="000"
                      keyboardType="numeric"
                      value={values.cvv}
                      onBlur={handleBlur('cvv')}
                      maxLength={3}
                      onChangeText={(value) => {
                        const cleaned = value.replace(/[^0-9]/g, '');
                        handleChange('cvv')(cleaned);
                      }}
                      borderColor={touched.cvv && errors.cvv ? '$red10' : '$borderColor'}
                    />
                    {touched.cvv && errors.cvv && (
                      <Text fontSize={12} color="red">
                        {errors.cvv}
                      </Text>
                    )}
                  </YStack>
                </XStack>

                <YStack gap={'$1'}>
                  <Label htmlFor="number">Nome do titular</Label>
                  <Input
                    id="holderName"
                    placeholder="Nome do titular"
                    value={values.holderName}
                    onBlur={handleBlur('holderName')}
                    onChangeText={handleChange('holderName')}
                    borderColor={
                      touched.holderName && errors.holderName ? '$red10' : '$borderColor'
                    }
                  />
                  {touched.holderName && errors.holderName && (
                    <Text fontSize={12} color="red">
                      {errors.holderName}
                    </Text>
                  )}
                </YStack>

                <YStack gap={'$1'}>
                  <Label htmlFor="number">CPF/CNPJ do titular</Label>
                  <Input
                    id="holderDoc"
                    placeholder="000.000.000-00"
                    value={values.holderDoc}
                    onBlur={handleBlur('holderDoc')}
                    onChangeText={(value) => {
                      const cleaned = value.replace(/[^0-9]/g, '');
                      handleChange('holderDoc')(cleaned);
                    }}
                    borderColor={touched.holderDoc && errors.holderDoc ? '$red10' : '$borderColor'}
                  />
                  {touched.holderDoc && errors.holderDoc && (
                    <Text fontSize={12} color="red">
                      {errors.holderDoc}
                    </Text>
                  )}
                </YStack>
                {error && (
                  <Text padding={'$1'} color="red">
                    {error}
                  </Text>
                )}
                <Button
                  // @ts-ignore
                  type="submit"
                  backgroundColor={'#04BF7B'}
                  color="white"
                  disabled={isLoading}
                  onPress={() => handleSubmit()}
                >
                  {isLoading ? 'Salvando...' : 'Cadastrar'}
                </Button>
              </YStack>
            )}
          </Formik>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
