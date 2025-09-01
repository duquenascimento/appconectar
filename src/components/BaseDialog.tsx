import React from 'react'
import { Dialog, Adapt, Sheet } from 'tamagui'

interface BaseDialogProps {
  open: boolean
  title: string
  description?: string
  children?: React.ReactNode // aqui você injeta botões, etc.
}

export function BaseDialog({ open, title, description, children }: BaseDialogProps) {
  return (
    <Dialog modal open={open}>
      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" modal snapPoints={[100]} snapPointsMode="percent" dismissOnSnapToBottom={false} disableDrag zIndex={200000}>
          <Sheet.Frame flex={1} padding="$6" justifyContent="center" alignItems="center">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay animation="quickest" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} backgroundColor="rgba(0,0,0,0.8)" />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay key="overlay" animation="quick" opacity={0.8} enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} backgroundColor="rgba(0,0,0,0.7)" />

        <Dialog.Content
          bordered
          elevate
          key="content"
          width="80%"
          maxWidth={700}
          backgroundColor="$background"
          padding="$6"
          borderRadius="$8"
          alignItems="center"
        >
          <Dialog.Title fontSize="$8" fontWeight="700" textAlign="center" mb="$5">
            {title}
          </Dialog.Title>

          {description && (
            <Dialog.Description textAlign="center" fontSize="$5" mb="$3">
              {description}
            </Dialog.Description>
          )}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}
