import React from 'react';
import { Dialog, Sheet, Button, XStack, Text, Adapt } from 'tamagui';

interface DialogInstanceNotificationProps {
    openModal: boolean;
    setOpenModal: (value: boolean) => void;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    onConfirm: () => void;
}

const DialogInstanceNotification: React.FC<DialogInstanceNotificationProps> = ({
    openModal,
    setOpenModal,
    title,
    subtitle,
    description,
    buttonText,
    onConfirm,
}) => {
    return (
        <Dialog modal open={openModal}>
            <Adapt when="sm" platform="touch">
                <Sheet animationConfig={{
                    type: 'spring',
                    damping: 20,
                    mass: 0.5,
                    stiffness: 200,
                }} animation="medium" zIndex={200000} modal dismissOnSnapToBottom snapPointsMode='fit'>
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
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Description>{subtitle}</Dialog.Description>
                    <Text>{description}</Text>

                    <XStack alignSelf="center" gap="$4">
                        <Dialog.Close displayWhenAdapted asChild>
                            <Button
                                width='$20'
                                theme="active"
                                aria-label="Close"
                                backgroundColor='#04BF7B'
                                color='$white1'
                                onPress={() => {
                                    setOpenModal(false);
                                    onConfirm();
                                }}
                            >
                                {buttonText}
                            </Button>
                        </Dialog.Close>
                    </XStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

export default DialogInstanceNotification;