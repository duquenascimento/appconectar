import React, { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { View, Text, XStack, YStack, Separator, Checkbox, Card, Label } from 'tamagui'

interface PrioritySectionProps {
  priorityNumber: number
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({ priorityNumber }) => {
  const [euQueroOpen, setEuQueroOpen] = useState(false)
  const [euQueroValue, setEuQueroValue] = useState('fixar')
  const [fornecedorOpen, setFornecedorOpen] = useState(false)
  const [fornecedorValue, setFornecedorValue] = useState('fornecedorB')
  const [naoPossivelOpen, setNaoPossivelOpen] = useState(false)
  const [naoPossivelValue, setNaoPossivelValue] = useState('selecionar')

  return (
    <Card
      bordered
      backgroundColor="white" // Força fundo branco
      borderColor="$gray5" // Cor da borda mais suave
      p="$2" // Padding interno
      my="$4" // Margem inferior
    >
      <YStack gap="$3" p="$2">
        {/* Cabeçalho Prioridade */}
        <XStack alignItems="center" borderBottomWidth={1} pb={'$4'}>
          <Text fontSize="$7">Prioridade {priorityNumber}</Text>
        </XStack>

        {/* Descrição */}
        <View mb={'$2'}>
          <Label fontSize={'$6'}>Eu quero</Label>
          <DropDownPicker
            open={euQueroOpen}
            value={euQueroValue}
            items={[
              { label: 'fixar produtos por fornecedor', value: 'fixar' },
              { label: 'distribuir entre fornecedores', value: 'distribuir' },
              { label: 'priorizar fornecedor específico', value: 'priorizar' }
            ]}
            setOpen={setEuQueroOpen}
            setValue={setEuQueroValue}
            multiple={false}
            zIndex={3000}
            zIndexInverse={1000}
            placeholder="Selecione uma opção"
            placeholderStyle={{ color: 'gray' }}
          />
        </View>

        {/* Fixar produtos/classes */}
        <YStack my={'$2'}>
          <Text fontSize={16} mb="$2">
            Fixar produtos e/ou classes
          </Text>
          <XStack my={'$2'}>
            <Card bordered p="$2">
              <Text>Alface crespa</Text>
            </Card>
            <Card bordered p="$2">
              <Text>Frutas</Text>
            </Card>
          </XStack>
        </YStack>

        <Separator borderColor="$gray5" />

        {/* Com fornecedor(es) */}
        <View my={'$2'}>
          <Label>Com fornecedor(es)</Label>
          <DropDownPicker
            open={fornecedorOpen}
            value={fornecedorValue}
            items={[
              { label: 'Fornecedor A', value: 'fornecedorA' },
              { label: 'Fornecedor B', value: 'fornecedorB' },
              { label: 'Fornecedor C', value: 'fornecedorC' }
            ]}
            setOpen={setFornecedorOpen}
            setValue={setFornecedorValue}
            multiple={false}
            zIndex={2000} // Z-index menor que o dropdown anterior para sobreposição correta
            zIndexInverse={1000}
            placeholder="Selecione o fornecedor"
            placeholderStyle={{ color: 'gray' }}
          />
        </View>

        <Separator borderColor="$gray5" />

        {/* Não sendo possível */}
        <View my={'$2'}>
          <Label>Não sendo possível</Label>
          <DropDownPicker
            open={naoPossivelOpen}
            value={naoPossivelValue}
            items={[
              { label: 'Ignorar e pular esta preferência', value: 'ignorar' },
              { label: 'Selecionar', value: 'selecionar' },
              { label: 'Escolher alternativa automática', value: 'alternativa' }
            ]}
            setOpen={setNaoPossivelOpen}
            setValue={setNaoPossivelValue}
            multiple={false}
            zIndex={1000} // Z-index menor que os dropdowns anteriores
            zIndexInverse={1000}
            placeholder="Selecione uma ação"
            placeholderStyle={{ color: 'gray' }}
          />
        </View>
      </YStack>
    </Card>
  )
}
