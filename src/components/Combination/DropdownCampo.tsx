import { useCombinacao } from '@/src/contexts/combinacao.context'
import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'
import { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { YStack, Label, Text } from 'tamagui'

type DropdownCampoProps<T extends string | number> = {
  campo: string //keyof ReturnType<typeof useCombinacao>['combinacao']
  label: string
  items: { label: string; value: T }[]
  zIndex?: number
  placeholder?: string
  schemaPath?: string
  value: T
  onChange: (val: T) => void
}

export function DropdownCampo<T extends string | number>({ campo, label, items, zIndex = 3000, placeholder, schemaPath, value, onChange }: DropdownCampoProps<T>) {
  //const { combinacao, updateCampo } = useCombinacao()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  //const value = combinacao[campo] as T

  const handleChange = (val: T | T[]) => {
    //updateCampo(campo, val as any)
    onChange(val as T)
    if (touched) validate(val)
  }

  const validate = async (val: any) => {
    try {
      await combinacaoValidationSchema.validateAt(schemaPath ?? campo, {
        [schemaPath ?? campo]: val
      })
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <YStack style={{ zIndex }}>
      <Label>{label}</Label>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        onOpen={() => setTouched(true)}
        onClose={() => setTouched(true)}
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
      />
      {touched && error && (
        <Text p={'$1'} color="red">
          {error}
        </Text>
      )}
    </YStack>
  )
}
