import * as Yup from 'yup';
import { Formik } from 'formik';
import { useState } from 'react';
import { Button, Dialog, Input, Label, XStack, YStack } from "tamagui";

const CardSchema = Yup.object().shape({
    number: Yup.string()
        .min(13, 'Muito curto')
        .max(16, 'Muito longo')
        .required('Obrigatório'),
    expiry: Yup.string()
        .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Formato inválido (MM/AA)')
        .required('Obrigatório'),
    cvv: Yup.string()
        .min(3, 'Mínimo 3 dígitos')
        .required('Obrigatório'),
});

export function CreateCreditCardModal() {
    const [cardNumber, setCardNumber] = useState<string>('');
    const [cardValidDate, setCardValidDate] = useState<string>('');
    const [cvv, setCvv] = useState<string>('');
    const [cardHolderName, setCardHolderName] = useState<string>('');

    return (
        <Dialog modal>
            <Dialog.Trigger asChild>
                <Button>Adicionar cartão de crédito</Button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay key="overlay" animation="quick" opacity={0.5} />
                <Dialog.Content bordered elevate key="content" animation="quick">

                    <Formik
                        initialValues={{ number: '', expiry: '', cvv: '' }}
                        validationSchema={CardSchema}
                        onSubmit={(values) => console.log('Enviado:', values)}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                            <YStack gap={"$2"}>
                                <Dialog.Title>Novo cartão de crédito</Dialog.Title>
                                <Dialog.Description>Conteúdo do modal.</Dialog.Description>

                                <YStack gap={"$1"}>
                                    <Label htmlFor="number">Número</Label>
                                    <Input
                                        id="number"
                                        placeholder="0000 0000 0000 0000"
                                        keyboardType="numeric"
                                        value={cardNumber}
                                        onChangeText={(value) => {
                                            const cleaned = value.replace(/[^0-9]/g, '')
                                            setCardNumber(cleaned)
                                        }}
                                    />
                                </YStack>

                                <XStack gap={"$2"}>
                                    <YStack gap={"$1"}>
                                        <Label htmlFor="number">Validade</Label>
                                        <Input
                                            id="cardValidDate"
                                            placeholder="00/00"
                                            keyboardType="numeric"
                                            value={cardValidDate}
                                            onChangeText={(value) => {
                                                const cleaned = value.replace(/[^0-9]/g, '')
                                                setCardValidDate(cleaned)
                                            }}
                                        />
                                    </YStack>

                                    <YStack gap={"$1"}>
                                        <Label htmlFor="number">CVV</Label>
                                        <Input
                                            id="cvv"
                                            placeholder="000"
                                            keyboardType="numeric"
                                            secureTextEntry
                                            value={cvv}
                                            onChangeText={(value) => {
                                                const cleaned = value.replace(/[^0-9]/g, '')
                                                setCvv(cleaned)
                                            }}
                                        />
                                    </YStack>
                                </XStack>

                                <YStack gap={"$1"}>
                                    <Label htmlFor="number">Titular do cartão</Label>
                                    <Input
                                        id="holder"
                                        placeholder="0000 0000 0000 0000"
                                        keyboardType="numeric"
                                        value={cardHolderName}
                                        onChangeText={(value) => {
                                            const cleaned = value.replace(/[^0-9]/g, '')
                                            setCardHolderName(cleaned)
                                        }}
                                    />
                                </YStack>
                                <Button 
                                    // @ts-ignore
                                    type="submit"
                                    onPress={() => {
                                        console.log("clic")
                                        handleSubmit();
                                    }} 
                                >
                                    Salvar
                                </Button>
                                
                            </YStack>
                        )}
                    </Formik>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
}