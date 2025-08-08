import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'
import { useState } from 'react'
import { Platform } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { YStack, XStack, Text, Button, Label } from 'tamagui'

type ContainerSelecaoItemsProps<T extends string> = {
  label: string
  items: { label: string; value: T }[]
  value: T[]
  onChange: (val: T[]) => void
  zIndex?: number
  schemaPath?: string
  extraValidationContext?: Record<string, unknown>
}

export function ContainerSelecaoItems<T extends string>({ label, items, value, onChange, zIndex = 3000, schemaPath, extraValidationContext = {} }: ContainerSelecaoItemsProps<T>) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const addItem = (item: T) => {
    if (!value.includes(item)) {
      const updated = [...value, item]
      onChange(updated)
      validate(updated)
    }
  }

  const removeItem = (item: T) => {
    const updated = value.filter((v) => v !== item)
    onChange(updated)
    validate(updated)
  }

  const validate = async (val: T[]) => {
    try {
      await combinacaoValidationSchema.validateAt(schemaPath ?? '', {
        [schemaPath ?? '']: val,
        ...extraValidationContext
      })
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <YStack style={{ zIndex }} gap="$2">
      <Label>{label}</Label>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={selected}
        setValue={(val) => {
          const resolved = typeof val === 'function' ? val(selected) : val
          setSelected(null)
          if (resolved) addItem(resolved)
        }}
        items={items}
        placeholder="Selecione..."
        zIndex={3000}
        zIndexInverse={1000}
        listMode={Platform.OS === 'ios' ? 'MODAL' : 'SCROLLVIEW'}
        dropDownDirection="BOTTOM"
        onOpen={() => setTouched(true)}
      />

      {value.length > 0 && (
        <XStack flexWrap="wrap" gap="$2" mt="$2">
          {value.map((v) => {
            const label = items.find((i) => i.value === v)?.label ?? v
            return (
              <XStack key={v} borderRadius={6} px="$2" py="$1" alignItems="center" gap="$1" backgroundColor="#E0E0E0">
                <Text>{label}</Text>
                <Button size="$1" circular backgroundColor="transparent" fontSize={'22px'} color={'#777'} onPress={() => removeItem(v)}>
                  ×
                </Button>
              </XStack>
            )
          })}
        </XStack>
      )}

      {touched && error && (
        <Text p={'$1'} color="red">
          {error}
        </Text>
      )}
    </YStack>
  )
}
