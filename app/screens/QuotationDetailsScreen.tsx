import React, { useState, useEffect } from 'react';
import { SafeAreaView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, View, Image, ScrollView, XStack, YStack, Separator } from 'tamagui';
import CustomHeader from '@/src/components/header/customHeader';
import CustomInfoCard from '@/src/components/card/customInfoCard';
import CustomButton from '../../src/components/button/customButton';
import { SupplierData } from '@/src/types/types'; // Verifique o caminho correto
import { getStorage } from '../utils/utils'; // Importe a função de busca
import { SavedCombination } from '@/src/components/Combination/combination'; // Importe a interface

// Tipagem das rotas
type RootStackParamList = {
  QuotationDetails: { combinationId: string };
  OrderConfirmed: { suppliers: SupplierData[] };
};

type QuotationDetailsRouteProp = RouteProp<RootStackParamList, 'QuotationDetails'>;
type QuotationDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuotationDetails'>;

export function QuotationDetailsScreen() {
  const navigation = useNavigation<QuotationDetailsNavigationProp>();
  const route = useRoute<QuotationDetailsRouteProp>();
  
  const { combinationId } = route.params;
  
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [headerTitle, setHeaderTitle] = useState<string>('Detalhes da Cotação');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadCombinationDetails = async () => {
      if (!combinationId) {
        Alert.alert('Erro', 'ID da combinação não fornecido.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const combinationsJSON = await getStorage('savedCombinations');
        if (combinationsJSON) {
          const allCombinations: SavedCombination[] = JSON.parse(combinationsJSON);
          // Encontra a combinação específica pelo ID
          const currentCombination = allCombinations.find(c => c.id === combinationId);

          if (currentCombination) {
            setHeaderTitle(currentCombination.combinationName);
            setSuppliers(currentCombination.suppliersData);
          } else {
            Alert.alert('Erro', 'Combinação não encontrada no armazenamento.');
          }
        } else {
          Alert.alert('Erro', 'Nenhuma combinação encontrada no armazenamento.');
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes da combinação:', err);
        Alert.alert('Erro', 'Ocorreu um erro ao carregar os detalhes da combinação.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCombinationDetails();
  }, [combinationId]);

  const totals = React.useMemo(() => {
    return suppliers.reduce(
      (acc, { supplier }) => {
        acc.subtotal += supplier.discount.orderValue;
        acc.discount += supplier.discount.discount;
        acc.grandTotal += supplier.discount.orderValueFinish;
        acc.totalItems += supplier.discount.product.filter(p => p.price > 0).length;
        acc.missingItems += supplier.missingItens;
        return acc;
      },
      { subtotal: 0, discount: 0, grandTotal: 0, totalItems: 0, missingItems: 0 }
    );
  }, [suppliers]);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  const formatUnit = (unit: string) => (unit || '').replace('Unid', 'UN');

  const handleBackPress = () => navigation.goBack();
  const handleConfirm = () => {
    if (suppliers.length > 0) {
      navigation.navigate('OrderConfirmed', { suppliers });
    } else {
      Alert.alert("Atenção", "Não há dados de fornecedores para confirmar.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DC588" />
        <Text mt="$4">Carregando detalhes...</Text>
      </SafeAreaView>
    );
  }

  if (!suppliers.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <CustomHeader title="Erro" onBackPress={handleBackPress} />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text>Não foi possível carregar os dados da combinação.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <YStack flex={1} backgroundColor="#FFFFFF" alignSelf="center" width={Platform.OS === 'web' ? '70%' : '100%'} maxWidth={1280}>
        <CustomHeader title={headerTitle} onBackPress={handleBackPress} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120, marginTop: 16 }}>
          <YStack gap="$4" px="$4">
            <CustomInfoCard icon="warning" description="Podem ocorrer pequenas variações de peso/tamanho nos produtos." />

            {suppliers.map(({ supplier }) => (
              <YStack key={supplier.externalId} bg="white" br={8} p="$3" gap="$3" borderColor='$gray6' borderWidth={1}>
                {/* O resto do seu JSX para renderizar os detalhes continua aqui... */}
                {/* ... */}
              </YStack>
            ))}

            {/* Totais */}
            <YStack bg="white" br={8} p="$3.5" gap="$2.5" borderColor='$gray6' borderWidth={1}>
              {/* JSX dos totais... */}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Botões */}
        <View pos="absolute" bottom={0} left={0} right={0} py="$4" px="$4" bg="white" borderTopWidth={1} borderTopColor="$gray4">
          <XStack width={'88%'} flexDirection="row" justifyContent="center" gap={10} alignSelf="center">
            <YStack f={1}>
              <CustomButton title="Voltar" onPress={handleBackPress} backgroundColor="#000000" textColor="#FFFFFF" />
            </YStack>
            <YStack f={1}>
              <CustomButton title="Confirmar" onPress={handleConfirm} backgroundColor="#1DC588" textColor="#FFFFFF" />
            </YStack>
          </XStack>
        </View>
      </YStack>
    </SafeAreaView>
  );
}
