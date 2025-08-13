import { useState } from 'react'
import { Input, Label, Text, YStack } from 'tamagui'
import { combinacaoValidationSchema } from '@/src/validators/combination.form.validator'
import { useCombinacao } from '@/src/contexts/combinacao.context'

export function InputNome() {
  const { combinacao, updateCampo } = useCombinacao()
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const validateNome = async (value: string) => {
    try {
      await combinacaoValidationSchema.validateAt('nome', { nome: value })
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <YStack>
      <Label>Nome da combinação</Label>
      <Input
        placeholder="Digite o nome da combinação"
        value={combinacao.nome}
        onChangeText={(text) => {
          updateCampo('nome', text)
          if (touched) validateNome(text)
        }}
        onBlur={() => {
          setTouched(true)
          validateNome(combinacao.nome)
        }}
      />
      {touched && error && (
        <Text p={'$1'} color="red">
          {error}
        </Text>
      )}
    </YStack>
  )
}
