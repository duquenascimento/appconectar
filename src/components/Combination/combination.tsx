import React, { useState } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, Text, Input, Label, Select, XStack, YStack, Separator, RadioGroup, Button } from 'tamagui'

import CustomButton from '../button/customButton'
import CustomSubtitle from '../subtitle/customSubtitle'
import { PrioritySection } from './prioridade'
import CustomHeader from '../header/customHeader'

export const Combination: React.FC = () => {
  const navigation = useNavigation()
  const [combinationName, setCombinationName] = useState('')
  const [maxSuppliers, setMaxSuppliers] = useState('2 fornecedores')
  const [blockSuppliers, setBlockSuppliers] = useState(false)
  const [preference, setPreference] = useState('especificos')
  const [specificSuppliers, setSpecificSuppliers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [productPreferenceEnabled, setProductPreferenceEnabled] = useState(false)
  const [priorityList, setPriorityList] = useState<number[]>([1])

  const handleGoBack = () => {
    navigation.goBack()
  }

  const addPriority = () => {
    setPriorityList((prev) => [...prev, prev.length + 1])
  }

  const handleSave = () => {
    const combinationData = {
      combinationName,
      maxSuppliers,
      blockSuppliers,
      preference,
      specificSuppliers,
      productPreferenceEnabled
    }
    console.log('Salvando dados da combinação:', combinationData)
    navigation.goBack()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <CustomHeader title="Combinação 1" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4" gap={15} mt="$2">
          {/* Nome da combinação */}
          <YStack>
            <Label>Nome da combinação</Label>
            <Input placeholder="Lorem ipsum" value={combinationName} onChangeText={setCombinationName} />
          </YStack>

          {/* Dropdown máximo de fornecedores */}
          <YStack style={{ zIndex: 3000 }}>
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
              zIndex={3000}
              zIndexInverse={1000}
            />
          </YStack>

          {/* Bloqueio de fornecedores */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4" zIndex={2000}>
            <Text fontWeight="bold">Bloquear fornecedores</Text>
            <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>
            <Separator my="$3" />
            <Text>Bloquear fornecedores na combinação?</Text>
            <RadioGroup value={blockSuppliers ? 'sim' : 'nao'} onValueChange={(value) => setBlockSuppliers(value === 'sim')}>
              <XStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <RadioGroup.Item value="sim" id="sim1" />
                  <Label htmlFor="sim1">Sim</Label>
                </XStack>
                <XStack alignItems="center" gap="$2">
                  <RadioGroup.Item value="nao" id="nao1" />
                  <Label htmlFor="nao1">Não</Label>
                </XStack>
              </XStack>
            </RadioGroup>
          </YStack>

          {/* Preferência de fornecedores */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4" zIndex={1000} gap="$2">
            <Text fontWeight="bold">Preferência de fornecedores</Text>
            <CustomSubtitle>Defina as preferências de combinação</CustomSubtitle>

            <YStack marginTop={10} gap="$3">
              <YStack>
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
              </YStack>

              {preference === 'especificos' && (
                <YStack>
                  <Label>Fornecedores específicos</Label>
                  <Select value={specificSuppliers.join(', ')} onValueChange={(val) => setSpecificSuppliers(val ? val.split(', ') : [])}>
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
                </YStack>
              )}
            </YStack>
          </YStack>

          {/* Preferência de produtos */}
          <YStack borderWidth={1} borderColor="$gray6" p="$4" borderRadius="$4">
            <YStack borderBottomWidth={1} pb="$3" borderColor="$gray4">
              <Text fontSize={16}>Preferência de produtos</Text>
              <CustomSubtitle>Preferência de produtos por fornecedor</CustomSubtitle>
            </YStack>

            <YStack borderBottomWidth={1} py="$3" borderColor="$gray4" gap={6}>
              <Text fontSize={14}>Definir preferência de produto para um ou mais fornecedores?</Text>
              <RadioGroup value={productPreferenceEnabled ? 'sim' : 'nao'} onValueChange={(value) => setProductPreferenceEnabled(value === 'sim')}>
                <XStack gap="$3">
                  <XStack alignItems="center" gap="$2">
                    <RadioGroup.Item value="sim" id="sim2" />
                    <Label htmlFor="sim2">Sim</Label>
                  </XStack>
                  <XStack alignItems="center" gap="$2">
                    <RadioGroup.Item value="nao" id="nao2" />
                    <Label htmlFor="nao2">Não</Label>
                  </XStack>
                </XStack>
              </RadioGroup>
            </YStack>
            {priorityList.map((number) => (
              <PrioritySection key={number} priorityNumber={number} />
            ))}
            <XStack width={'74%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
              <YStack f={1}>
                <Button onPress={addPriority} backgroundColor="#ffffffff" color="#000000ff" borderColor="#A9A9A9" borderWidth={0}>
                  + Adicionar preferência
                </Button>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
        {/* Botões rodapé */}
        {Platform.OS === 'web' ? (
          <XStack width={'74%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <Button
                onPress={handleGoBack}
                hoverStyle={{
                  background: '#f84949ff',
                  opacity: 0.9
                }}
                backgroundColor="#f84949ff"
                color="#FFFFFF"
                borderColor="#A9A9A9"
                borderWidth={1}
              >
                Excluir combinação
              </Button>
            </YStack>
            <YStack f={1}>
              <Button
                onPress={handleSave}
                hoverStyle={{
                  background: '#1DC588',
                  opacity: 0.9
                }}
                backgroundColor="#1DC588"
                color="#FFFFFF"
                borderColor="#A9A9A9"
              >
                Salvar combinação
              </Button>
            </YStack>
          </XStack>
        ) : (
          <XStack width={'88%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <CustomButton title="Excluir" onPress={handleGoBack} backgroundColor="#f84949ff" textColor="#FFFFFF" borderColor="#A9A9A9" borderWidth={1} />
            </YStack>
            <YStack f={1}>
              <CustomButton title="Salvar" fontSize={10} onPress={handleSave} backgroundColor="#1DC588" textColor="#FFFFFF" borderColor="#A9A9A9" Salvar />
            </YStack>
          </XStack>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
