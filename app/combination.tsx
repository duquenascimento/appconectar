import { useCombinacao } from '@/src/contexts/combinacao.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { getMaxSpecificSuppliersNumber } from '@/src/services/restaurantService';
import { getAllSuppliers } from '@/src/services/supplierService';
import { ComboOption } from '@/src/types/componentTypes';
import { CombinationSupplier, SuppliersRouteFilterParams } from '@/src/types/suppliersDataTypes';
import { mapMaxSpecificSuppliers } from '@/src/utils/mapMaxSpecificSuppliers';
import { getStorageRestaurant } from '@/src/utils/restaurantUtils';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { Button, ScrollView, View, XStack, YStack } from 'tamagui';
import * as Yup from 'yup';
import PageContainer from '../src/components/box/PageContainer';
import CustomButton from '../src/components/button/customButton';
import { BloqueioFornecedoresCampo } from '../src/components/Combination/BloqueioFornecedores';
import { ContainerPreferenciasProduto } from '../src/components/Combination/ContainerPreferenciasProduto';
import { DropdownCampo } from '../src/components/Combination/DropdownCampo';
import { InputNome } from '../src/components/Combination/InputNome';
import { PreferenciaFornecedorCampo } from '../src/components/Combination/PreferenciaFornecedorTipo';
import CustomHeader from '../src/components/header/customHeader';
import CustomAlert from '../src/components/modais/CustomAlert';
import { getCombinationsByRestaurant } from '../src/services/combinationsService';
import { Combinacao } from '../src/types/combinationTypes';
import { combinacaoValidationSchema } from '../src/validators/combination.form.validator';

export function Combination(): JSX.Element {
  const route = useRoute();
  const params = route.params as { id?: string } | undefined;
  const id = params?.id;
  const { combinacao, updateCampo } = useCombinacao();
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableSuppliersOptions, setAvailableSuppliersOptions] = useState<
    Array<ComboOption<number>>
  >([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [suppliers, setSuppliers] = useState<CombinationSupplier[]>([]);
  const { selectedRestaurant } = useRestaurantContext();

  useEffect(() => {
    const suppliersFn = async () => {
      try {
        setLoadingSuppliers(true);

        const restaurantAddressInfo = selectedRestaurant?.addressInfos[0];

        console.log('restaurantAddressInfo', restaurantAddressInfo);

        const routeFilters: SuppliersRouteFilterParams = {
          neighborhood: restaurantAddressInfo?.neighborhood || '',
          minimumTime: restaurantAddressInfo?.initialDeliveryTime || '',
          maximumTime: restaurantAddressInfo?.finalDeliveryTime || '',
        };

        console.log('routeFilters', routeFilters);

        const suppliers = await getAllSuppliers({ routeFilters });

        setSuppliers(suppliers);
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        setAlertTitle('Erro!');
        setAlertMessage('Ocorreu um erro inesperado ao buscar fornecedores.');
        setIsAlertVisible(true);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    suppliersFn();
  }, [selectedRestaurant]);

  useEffect(() => {
    const carregarCombinacao = async () => {
      setLoading(false);
      if (!id) return;

      try {
        const dados = await getCombinationsByRestaurant(id);
        if (!dados) {
          throw new Error('Erro ao encontrar combinação');
        }
      } catch (err) {
        console.error('Erro ao carregar combinação:', err);
      }
    };

    carregarCombinacao();
  }, []);

  useEffect(() => {
    const fetchStoredRestaurant = async () => {
      const restaurantData = await getStorageRestaurant();

      if (restaurantData) {
        try {
          const idFromRoute = (route.params as { restaurantId?: string })?.restaurantId;
          const finalId = idFromRoute ?? restaurantData?.id ?? null;

          updateCampo('restaurant_id', finalId ?? '');
        } catch {
          updateCampo('restaurant_id', '');
        }
      }
    };
    fetchStoredRestaurant();
  }, []);

  useEffect(() => {
    const fetchMaxSpecificSuppliers = async () => {
      try {
        const restaurantData = await getStorageRestaurant();
        if (restaurantData) {
          const resp = await getMaxSpecificSuppliersNumber(restaurantData.externalId);
          const options = mapMaxSpecificSuppliers(resp);
          setAvailableSuppliersOptions(options);
        }
      } catch {
        setAvailableSuppliersOptions([]);
      }
    };
    fetchMaxSpecificSuppliers();
  }, []);

  const handleGoBack = () => {
    router.push('prices');
  };

  const createCombination = async (combinacaoFiltrada?: any) => {
    setLoading(true);
    try {
      const dadosParaEnviar = combinacaoFiltrada || combinacao;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_DBCONECTAR_URL}/system/combinacao`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosParaEnviar),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      setAlertTitle('Sucesso!');
      setAlertMessage('Combinação criada com sucesso!');
      setIsAlertVisible(true);
      setAlertCallback(() => handleGoBack);
    } catch (error) {
      console.error('Erro ao salvar combinação:', error);
      setAlertTitle('Erro!');
      setAlertMessage('Ocorreu um erro inesperado ao criar a combinação.');
      setIsAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const updateCombination = async (combinacaoFiltrada?: any) => {
    setLoading(true);
    try {
      const dadosParaEnviar = combinacaoFiltrada || combinacao;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/combination/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      setAlertTitle('Sucesso!');
      setAlertMessage('Combinação atualizada com sucesso!');
      setIsAlertVisible(true);
      setAlertCallback(() => handleGoBack);
    } catch (error) {
      console.error('Erro ao salvar combinação:', error);
      setAlertTitle('Erro!');
      setAlertMessage('Ocorreu um erro inesperado ao atualizar a combinação.');
      setIsAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const updateCampoAndValidate = useCallback(
    async <K extends keyof Combinacao>(campo: K, valor: Combinacao[K]) => {
      updateCampo(campo, valor);
      try {
        const tempObj = { ...combinacao, [campo]: valor };
        await combinacaoValidationSchema.validateAt(campo, tempObj);
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[campo];
          return newErrors;
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          setValidationErrors((prev) => ({
            ...prev,
            [campo]: err.message,
          }));
        }
      }
    },
    [combinacao, updateCampo],
  );

  const clearPreferenceErrors = useCallback(() => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.preferencias;
      return newErrors;
    });
  }, []);

  const handleSaveCombination = async () => {
    try {
      setValidationErrors({});
      setTriggerValidation(true);

      const combinacaoParaValidar = {
        ...combinacao,
        preferencias: combinacao.preferencias?.map((preferencia) => ({
          ...preferencia,
          produtos: preferencia.produtos?.filter(
            (produto) => produto.produto_sku || produto.classe,
          ),
        })),
      };

      await combinacaoValidationSchema.validate(combinacaoParaValidar, {
        abortEarly: false,
      });

      const combinacaoParaEnviar = {
        ...combinacaoParaValidar,
        preferencias: combinacaoParaValidar.preferencias?.map((pref) => {
          if (combinacao.preferencia_fornecedor_tipo === 'especifico') {
            const permitidos = new Set(combinacao.fornecedores_especificos || []);
            return {
              ...pref,
              fornecedores: pref.fornecedores.filter((f) => permitidos.has(f)),
              produtos: pref.produtos.map((p) => ({
                ...p,
                fornecedores: p.fornecedores.filter((f) => permitidos.has(f)),
              })),
            };
          }
          return pref;
        }),
      };

      setTimeout(() => setTriggerValidation(false), 100);

      if (id) {
        await updateCombination(combinacaoParaEnviar);
      } else {
        await createCombination(combinacaoParaEnviar);
      }
    } catch (error) {
      // Reset trigger validation even on error
      setTimeout(() => setTriggerValidation(false), 100);

      if (error instanceof Yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setValidationErrors(newErrors);
        setAlertTitle('Campos Obrigatórios');
        setAlertMessage('Por favor, corrija os campos destacados.');
        setIsAlertVisible(true);
      } else {
        setAlertTitle('Erro Inesperado');
        setAlertMessage('Ocorreu um erro inesperado ao salvar a combinação.');
        setIsAlertVisible(true);
      }
    }
  };

  const handleDeleteCombination = async () => {
    setLoading(true);
    try {
      if (!id) {
        console.warn('ID da combinação não encontrado.');
        return;
      }
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/combination/${id}/delete`, {
        method: 'DELETE',
      });
      setAlertTitle('Sucesso!');
      setAlertMessage('Combinação excluída com sucesso!');
      setIsAlertVisible(true);
      setAlertCallback(() => handleGoBack);
    } catch (error) {
      console.error('Erro ao excluir combinação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setIsAlertVisible(false);
    if (alertCallback) {
      alertCallback();
    }
    setAlertCallback(null);
  };

  const isAvailableSuppliersOptionsEmpty = availableSuppliersOptions.length === 0;

  return (
    <PageContainer backgroundColor="white">
      <CustomHeader
        title={id ? `${combinacao.nome}` : 'Nova combinação'}
        onBackPress={() => router.push('preferencesScreen')}
      />
      <CustomAlert
        visible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
        color="black"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack
          width={Platform.OS === 'web' ? '76%' : '92%'}
          alignSelf="center"
          padding="$2"
          gap={15}
          marginTop="$2"
        >
          <InputNome
            error={validationErrors.nome}
            onChangeText={(text) => updateCampoAndValidate('nome', text)}
            value={combinacao.nome}
          />

          <DropdownCampo
            campo="dividir_em_maximo"
            label="Dividir em no máximo:"
            items={availableSuppliersOptions}
            value={combinacao.dividir_em_maximo}
            onChange={(val) => updateCampoAndValidate('dividir_em_maximo', val)}
            zIndex={3000}
            error={validationErrors.dividir_em_maximo}
            placeholder={isAvailableSuppliersOptionsEmpty ? 'Carregando...' : 'Selecione...'}
            isLoading={isAvailableSuppliersOptionsEmpty}
          />

          <BloqueioFornecedoresCampo
            suppliers={suppliers}
            error={validationErrors.fornecedores_bloqueados}
            onChange={(val) => updateCampoAndValidate('fornecedores_bloqueados', val)}
            loadingSuppliers={loadingSuppliers}
          />

          <PreferenciaFornecedorCampo
            suppliers={suppliers}
            error={validationErrors.fornecedores_especificos}
            onChange={(val) => updateCampoAndValidate('fornecedores_especificos', val)}
            loadingSuppliers={loadingSuppliers}
          />

          {['especifico', 'qualquer'].includes(combinacao.preferencia_fornecedor_tipo ?? '') && (
            <ContainerPreferenciasProduto
              suppliers={suppliers}
              error={validationErrors.preferencias}
              onClearErrors={clearPreferenceErrors}
              triggerValidation={triggerValidation}
              loadingSuppliers={loadingSuppliers}
            />
          )}
        </YStack>
        {Platform.OS === 'web' ? (
          <XStack
            width="74%"
            flexDirection="row"
            justifyContent="center"
            gap={10}
            alignSelf="center"
          >
            <YStack flex={1}>
              <Button
                onPress={() => {
                  if (id) {
                    handleDeleteCombination();
                  } else {
                    handleGoBack();
                  }
                }}
                disabled={loading}
                hoverStyle={{
                  backgroundColor: '#f84949ff',
                  opacity: 0.9,
                }}
                backgroundColor="#f84949ff"
                color="#FFFFFF"
                borderColor="#A9A9A9"
                borderWidth={1}
              >
                {loading ? 'Processando...' : id ? 'Excluir combinação' : 'Cancelar'}
              </Button>
            </YStack>
            <YStack flex={1}>
              <Button
                onPress={handleSaveCombination}
                disabled={loading}
                hoverStyle={{
                  backgroundColor: '#1DC588',
                  opacity: 0.9,
                }}
                backgroundColor="#1DC588"
                color="#FFFFFF"
                borderColor="#A9A9A9"
              >
                {loading ? 'Salvando...' : 'Salvar combinação'}
              </Button>
            </YStack>
          </XStack>
        ) : (
          <XStack
            width="88%"
            flexDirection="row"
            justifyContent="center"
            gap={10}
            alignSelf="center"
          >
            <YStack flex={1}>
              <CustomButton
                title={loading ? 'Processando...' : id ? 'Excluir' : 'Cancelar'}
                onPress={() => {
                  if (id) {
                    handleDeleteCombination();
                  } else {
                    handleGoBack();
                  }
                }}
                backgroundColor="#f84949ff"
                textColor="#FFFFFF"
              />
            </YStack>
            <YStack flex={1}>
              <CustomButton
                title={loading ? 'Salvando...' : 'Salvar'}
                onPress={handleSaveCombination}
                backgroundColor="#1DC588"
                textColor="#FFFFFF"
              />
            </YStack>
          </XStack>
        )}
      </ScrollView>

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // ← pouca opacidade
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#04BF7B" />
        </View>
      )}
    </PageContainer>
  );
}

export default Combination;
