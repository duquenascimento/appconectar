import React, { useState } from 'react'
import { Button, Platform, SafeAreaView } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, View, Text, Input, Label, Select, XStack, YStack, Separator, RadioGroup } from 'tamagui'
import CustomSubtitle from '../subtitle/customSubtitle'
import CustomButton from '../button/customButton'
import { PrioritySection } from './prioridade'

export const Combination: React.FC = () => {
  const [combinationName, setCombinationName] = useState('')
  const [maxSuppliers, setMaxSuppliers] = useState('2 fornecedores')
  const [blockSuppliers, setBlockSuppliers] = useState(false)
  const [preference, setPreference] = useState('especificos')
  const [specificSuppliers, setSpecificSuppliers] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <XStack
        alignItems="center"
        backgroundColor="#D4DCE1" // cor de fundo igual à da imagem
        padding="$4"
        space="$3"
      >
        <Button
          icon='ArrowLeft'
          size="$3"
          circular
          backgroundColor="transparent"
          onPress={() => {
            // ação de voltar
          }}
        />
        <Text fontSize={16} fontWeight="bold">
          Combinação 1
        </Text>
      </XStack>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120 // Mantém o espaço no final
        }}
      >
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt={'$2'}>
          <View>
            <Label>Nome da combinação</Label>
            <Input placeholder="Lorem ipsum" value={combinationName} onChangeText={setCombinationName} color={'white'} />
          </View>
          <View>
            <Label>Dividir em no máximo</Label>
            <DropDownPicker
              open={open}
              value={maxSuppliers}
              items={['1 fornecedor', '2 fornecedores', '3 fornecedores'].map((item) => ({
                label: item,
                value: item
              }))}
              setOpen={setOpen}
              setValue={setMaxSuppliers}
              multiple={false}
              zIndex={3000} // Aumentado para garantir que fique sobre outros elementos
              zIndexInverse={1000}
            />
          </View>

          {/* Bloquear fornecedores */}
          <View borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4" zIndex={2000}>
            <Text fontWeight="bold">Bloquear fornecedores</Text>
            <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>

            <Separator my="$3" />

            <Text>Bloquear fornecedores na combinação?</Text>
            <RadioGroup value={blockSuppliers ? 'sim' : 'nao'} onValueChange={(value) => setBlockSuppliers(value === 'sim')}>
              <XStack gap="$3">
                <XStack alignItems="center">
                  <RadioGroup.Item value="sim" id="sim">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor="sim" pl="$3">
                    Sim
                  </Label>
                </XStack>
                <XStack alignItems="center">
                  <RadioGroup.Item value="nao" id="nao">
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Label htmlFor="nao" pl="$3">
                    Não
                  </Label>
                </XStack>
              </XStack>
            </RadioGroup>
          </View>

          {/* Preferência de fornecedores */}
          <View borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4" space="$2" zIndex={1000}>
            <Text fontWeight="bold">Preferência de fornecedores</Text>
            <CustomSubtitle>Defina as preferências de combinação</CustomSubtitle>

            <YStack mt={10} space="$3">
              <View>
                <Label>Combinar meu pedido entre</Label>
                <Select value={preference} onValueChange={setPreference}>
                  <Select.Trigger>
                    <Select.Value placeholder="Selecione..." />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Viewport>
                      <Select.Item index={0} value="todos">
                        <Select.ItemText>Todos os fornecedores</Select.ItemText>
                      </Select.Item>
                      <Select.Item index={1} value="especificos">
                        <Select.ItemText>Fornecedores específicos</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select>
              </View>

              {preference === 'especificos' && (
                <View>
                  <Label>Fornecedores específicos</Label>
                  <Select value={specificSuppliers.join(', ')} onValueChange={(val) => setSpecificSuppliers(val.split(', '))}>
                    <Select.Trigger>
                      <Select.Value placeholder="Selecione..." />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Viewport>
                        <Select.Item index={0} value="a">
                          <Select.ItemText>Fornecedor A</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={1} value="b">
                          <Select.ItemText>Fornecedor B</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={2} value="c">
                          <Select.ItemText>Fornecedor C</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select>
                </View>
              )}
            </YStack>
          </View>

          <View borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4" zIndex={1000}>
            <YStack borderBottomWidth={1} p={'$3'}>
              <Text fontSize={16}>Preferência de produtos</Text>
              <CustomSubtitle>Preferência de produtos por fornecedor</CustomSubtitle>
            </YStack>

            <YStack borderBottomWidth={1} p={'$3'} gap={6}>
              <Text fontSize={16}>Definir preferência de produto para um ou mais fornecedores?</Text>
              <RadioGroup value={blockSuppliers ? 'sim' : 'nao'} onValueChange={(value) => setBlockSuppliers(value === 'sim')}>
                <XStack gap="$3">
                  <XStack alignItems="center">
                    <RadioGroup.Item value="sim" id="sim">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="sim" pl="$3">
                      Sim
                    </Label>
                  </XStack>
                  <XStack alignItems="center">
                    <RadioGroup.Item value="nao" id="nao">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="nao" pl="$3">
                      Não
                    </Label>
                  </XStack>
                </XStack>
              </RadioGroup>
            </YStack>

            <YStack>
              <PrioritySection priorityNumber={1}></PrioritySection>
            </YStack>
            <CustomButton title="+ Adicionar preferência"></CustomButton>
          </View>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
