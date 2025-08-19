import { useState } from 'react'
import { Platform } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { YStack, Label, Text } from 'tamagui'

type DropdownCampoProps<T extends string | number> = {
  campo: string
  label: string
  items: { label: string; value: T }[]
  zIndex?: number
  placeholder?: string
  schemaPath?: string
  value: T
  onChange: (val: T) => void
  error?: string 
}

export function DropdownCampo<T extends string | number>({ campo, label, items, zIndex = 3000, placeholder, value, onChange, error }: DropdownCampoProps<T>) {
  const [open, setOpen] = useState(false)

  const handleChange = (val: T | T[]) => {
    onChange(val as T)
  }

  return (
    <YStack style={{ zIndex }}>
      <Label>{label}</Label>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={(val) => {
          const resolved = typeof val === 'function' ? val(value) : val
          handleChange(resolved)
          setTimeout(() => setOpen(false), 200)
        }}
        items={items}
        placeholder={placeholder ?? 'Selecione...'}
        zIndex={zIndex}
        zIndexInverse={1000}
        dropDownDirection="BOTTOM"
        listMode={Platform.OS === 'ios' ? 'MODAL' : 'SCROLLVIEW'}
        style={{ borderColor: error ? 'red' : 'lightgray' }}
        modalProps={{
          animationType: 'slide',
          transparent: false
        }}
      />
      {error && (
        <Text p={'$1'} color="red">
          {error}
        </Text>
      )}
    </YStack>
  )
}