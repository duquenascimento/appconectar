import { ComboOption } from '@/src/types/componentTypes'
import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'
import { useState } from 'react'
import { Platform } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { Button, Label, Text, Tooltip, XStack, YStack } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'

type ContainerSelecaoItemsProps<T extends string> = {
  label: string
  items: ComboOption<T>[]
  allItems?: ComboOption<T>[]
  unavailableValues?: T[]
  value: T[]
  onChange: (val: T[]) => void
  zIndex?: number
  schemaPath?: string
  extraValidationContext?: Record<string, unknown>
  ignoreValidation?: boolean
  onRemove?: (item: T) => void
  error?: string
  loading?: boolean
}

export function ContainerSelecaoItems<T extends string>({ label, items, allItems = [], unavailableValues = [], value = [], onChange, zIndex = 3000, schemaPath, extraValidationContext = {}, ignoreValidation = false, onRemove, error, loading = false }: ContainerSelecaoItemsProps<T>) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)
  const [touched, setTouched] = useState(false)

  const addItem = (item: T) => {
    if (!value.includes(item)) {
      const updated = [...value, item]
      onChange(updated)
    }
  }

  const removeItem = (item: T) => {
    const updated = value.filter((v) => v !== item)
    if (onRemove) {
      onRemove(item)
    } else {
      onChange(updated)
    }
    validate(updated)
    setTouched(true)
  }

  const validate = async (val: T[]) => {
    try {
      await combinacaoValidationSchema.validateAt(schemaPath ?? '', {
        [schemaPath ?? '']: val,
        ...extraValidationContext
      })
    } catch (err: any) {
    }
  }

  const unavailableValuesSet = new Set(unavailableValues)

  return (
    <YStack style={{ zIndex }} gap="$2" minHeight={open ? 300 : 100}>
      <Label>{label}</Label>
      <DropDownPicker
        loading={loading}
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
        style={{ 
          borderColor: error ? 'red' : 'lightgray' }}
      />

      {value.length > 0 && (
        <XStack flexWrap="wrap" gap="$2" marginTop="$2">
          {value
            .map((v) => {
              const availableItem = items.find((i) => i.value === v)
              const fallbackItem = allItems.find((i) => i.value === v)
              const label = availableItem?.label ?? fallbackItem?.label ?? v
              const isUnavailable = unavailableValuesSet.has(v) || !availableItem

              return (
                <XStack key={v} borderRadius={6} paddingHorizontal="$2" paddingVertical="$1" alignItems="center" gap="$1" backgroundColor="#E0E0E0" opacity={isUnavailable ? 0.55 : 1}>
                  <Text>{label}</Text>
                  {isUnavailable && (
                    <Tooltip>
                      <Tooltip.Trigger asChild>
                        <XStack>
                          <Icons name="alert-circle-outline" size={14} color="#666" />
                        </XStack>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <Tooltip.Arrow />
                        <Text color="white">Indisponível</Text>
                      </Tooltip.Content>
                    </Tooltip>
                  )}
                  <Button size="$1" circular backgroundColor="transparent" fontSize={Platform.OS === 'web'? '22px': undefined} color={'#777'} onPress={() => removeItem(v)}>
                    ×
                  </Button>
                </XStack>
              )
            })}
        </XStack>
      )}
      {!ignoreValidation && error && (
        (!touched ? true : touched) && (
          <Text padding={'$1'} color="red">
            {error}
          </Text>
        )
      )}
    </YStack>
  )
}