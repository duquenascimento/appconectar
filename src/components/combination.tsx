import React, { useState } from 'react'
import { Platform, ScrollView as RNScrollView, SafeAreaView } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, View, Text, Input, Label, Select, Switch, XStack, YStack, Separator, Paragraph, RadioGroup } from 'tamagui'
import CustomSubtitle from './subtitle/customSubtitle'

export const Combination: React.FC = () => {
  const [combinationName, setCombinationName] = useState('')
  const [maxSuppliers, setMaxSuppliers] = useState('2 fornecedores')
  const [blockSuppliers, setBlockSuppliers] = useState(false)
  const [preference, setPreference] = useState('especificos')
  const [specificSuppliers, setSpecificSuppliers] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <YStack
        flex={1}
        backgroundColor="#FFFFFF"
        alignSelf="center"
      ></YStack>
      <ScrollView
        contentContainerStyle={{
          minHeight: Platform.OS === 'web' ? '100vh' : '100%',
          paddingBottom: 120, 
          marginTop: 16 
        }}
      >
        <YStack w={Platform.OS === 'web' ? '76%' : '92%'} alignSelf="center" p="$4">
          {/* Nome da combinação */}
          <View>
            <Label>Nome da combinação</Label>
            <Input placeholder="Lorem ipsum" value={combinationName} onChangeText={setCombinationName} color={'white'} />
          </View>

          {/* Dividir em no máximo */}
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
              zIndex={1000}
              zIndexInverse={1000}
            />
          </View>

          {/* Container principal do formulário com ScrollView */}
          <RNScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Bloquear fornecedores */}
            <View borderWidth={1} borderColor="$gray6" p="$4" mt={10} borderRadius="$4">
              <Text fontWeight="bold">Bloquear fornecedores</Text>
              <CustomSubtitle>Impedir que fornecedores apareçam na combinação</CustomSubtitle>

              <Separator my="$3" />

              <Text>Bloquear fornecedores na combinação?</Text>
              <RadioGroup value={blockSuppliers ? 'sim' : 'nao'} onValueChange={(value) => setBlockSuppliers(value === 'sim')}>
                <XStack gap={'$3'}>
                  {/* Container principal com espaçamento entre opções */}
                  <XStack alignItems="center">
                    <RadioGroup.Item value="sim" id="sim">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="sim" pl={'$3'}>
                      Sim
                    </Label>
                  </XStack>
                  <XStack alignItems="center">
                    <RadioGroup.Item value="nao" id="nao">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Label htmlFor="nao" pl={'$3'}>
                      Não
                    </Label>
                  </XStack>
                </XStack>
              </RadioGroup>
            </View>

            {/* Preferência de fornecedores */}
            <View borderWidth={1} borderColor="$gray6" p="$4" mt={10} borderRadius="$4" space="$2">
              <Text fontWeight="bold">Preferência de fornecedores</Text>
              <CustomSubtitle>Defina as preferências de combinação</CustomSubtitle>

              <YStack mt={10}>
                <View>
                  <Label>Combinar meu pedido entre</Label>
                  <Select
                    value={preference}
                    onValueChange={setPreference}
                    items={[
                      { label: 'Todos os fornecedores', value: 'todos' },
                      { label: 'Fornecedores específicos', value: 'especificos' }
                    ]}
                  />
                </View>

                {preference === 'especificos' && (
                  <View>
                    <Label>Fornecedores específicos</Label>
                    <Select
                      value={specificSuppliers}
                      onValueChange={setSpecificSuppliers}
                      items={[
                        { label: 'Fornecedor A', value: 'a' },
                        { label: 'Fornecedor B', value: 'b' },
                        { label: 'Fornecedor C', value: 'c' }
                      ]}
                      placeholder="Selecione..."
                    />
                  </View>
                )}
              </YStack>
            </View>
          </RNScrollView>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
