import { InviteCodeField } from '@/src/components/pages/register/InviteCodeField';
import {
  RegisterField,
  RegisterFieldFrame,
  registerBoxProps,
} from '@/src/components/pages/register/RegisterField';
import { RegisterHeader } from '@/src/components/pages/register/RegisterHeader';
import { RegisterNavButtons } from '@/src/components/pages/register/RegisterNavButtons';
import { RegisterSelect } from '@/src/components/pages/register/RegisterSelect';
import { useRegisterLayout } from '@/src/components/pages/register/useRegisterLayout';
import { ValidationDialog } from '@/src/components/pages/sign/ValidationDialog';
import { useAuthContext } from '@/src/contexts/auth.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { loadProgress, saveStepData } from '@/src/services/registerProgressService';
import { checkDocument, sendFullRegister } from '@/src/services/registerService';
import { getErrorMessage } from '@/src/types/apiErrorTypes';
import { formatDocument, isCnpjData, type DocumentType } from '@/src/utils/documentUtils';
import {
  clearPendingInviteCode,
  getPendingInviteCode,
  shouldResetForNewInvite,
} from '@/src/utils/inviteCode';
import { getPaymentDescription } from '@/src/utils/paymentUtils';
import { filterLettersAndSpaces } from '@/src/utils/stringUtils';
import { isRegistrationExpired } from '@/src/utils/registerExpiration';
import {
  step0Validation,
  step1Validation,
  step2Validation,
  step3Validation,
} from '@/src/validators/register.form.validator';
import Icons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { Button, Checkbox, Input, ScrollView, Text, View } from 'tamagui';
import { dividirLogradouro } from '../src/utils/DividirLogradouro';
import { campoString } from '../src/utils/formatCampos';
import { formatCep } from '../src/utils/formatCep';
import {
  clearRegisterProgress,
  getStorage,
  setStorage,
  STORAGE_DEFAULT_KEYS,
} from '../src/utils/utils';
import { VersionInfo } from '../src/utils/VersionApp';

export default function Register() {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [documentType, setDocumentType] = useState<DocumentType>('CNPJ');
  const [minhours, setMinhours] = useState<string[]>([]);
  const [maxhours, setMaxhours] = useState<string[]>([]);
  const [erros, setErros] = useState<string[]>([]);
  const [registerInvalid, setRegisterInvalid] = useState(false);
  const [isCepValid, setIsCepValid] = useState(true);
  const [minHourOpen, setMinHourOpen] = useState(false);
  const [maxHourOpen, setMaxHourOpen] = useState(false);
  const [paymentWayOpen, setPaymentWayOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const { getTokenPayload, logout } = useAuthContext();
  const { loadRestaurants } = useRestaurantContext();
  const { isLargeScreen, isWeb, pagePadding, touchHeight, field, containerProps } =
    useRegisterLayout();

  const isCpf = documentType === 'CPF';
  const nextLabel = step === 3 ? 'Finalizar Cadastro' : 'Avançar';

  const allClosedDropdowns = () => {
    setMinHourOpen(false);
    setMaxHourOpen(false);
    setDaysOpen(false);
    setScrollEnabled(true);
  };

  const formik = useFormik({
    initialValues: {
      restaurantName: '',
      document: '',
      stateNumberId: '',
      noStateNumberId: false,
      cityNumberId: '',
      legalRestaurantName: '',
      zipcode: '',
      city: '',
      neigh: '',
      street: '',
      localNumber: '',
      localType: '',
      complement: '',
      alternativePhone: '',
      email: '',
      alternativeEmail: '',
      minHour: '',
      maxHour: '',
      closeDoor: false,
      deliveryObs: '',
      financeResponsibleName: '',
      financeResponsiblePhoneNumber: '',
      emailBilling: '',
      weeklyOrderAmount: '',
      orderValue: '',
      paymentWay: '',
      inviteCode: '',
    },
    validationSchema:
      step === 0
        ? step0Validation
        : step === 1
          ? step1Validation
          : step === 2
            ? step2Validation
            : step3Validation,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      let hasRegistered: boolean = false;
      try {
        setLoading(true);

        const { zipcode, complement, noStateNumberId, cityNumberId, stateNumberId, ...data } =
          values;

        await sendFullRegister({
          ...data,
          zipcode: zipcode.replace(/\D/g, ''),
          complement: complement.length > 0 ? complement : undefined,
          stateNumberId: noStateNumberId ? undefined : stateNumberId,
          cityNumberId: cityNumberId.length > 0 && noStateNumberId ? cityNumberId : undefined,
        });

        await setStorage(STORAGE_DEFAULT_KEYS.USER_ROLES, 'registered');

        hasRegistered = true;

        router.push('/registerFinished');

        await clearRegisterProgress();
        await loadRestaurants();
      } catch (error) {
        if (hasRegistered) {
          router.push('/registerFinished');
        }
        const errorMessage = getErrorMessage(error);
        setErros([errorMessage]);
        setRegisterInvalid(true);
      } finally {
        setLoading(false);
      }
    },
  });

  const errorOf = (name: keyof typeof formik.values) =>
    formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined;

  useEffect(() => {
    const hours = [];
    for (let hour = 0; hour < 22; hour++) {
      hours.push(`${String(hour).padStart(2, '0')}:00`);
      hours.push(`${String(hour).padStart(2, '0')}:30`);
    }
    hours.push('22:00');
    setMinhours(hours);
  }, []);

  useEffect(() => {
    if (formik.values.minHour) {
      let [hour, minute] = formik.values.minHour.split(':').map(Number);
      hour += 1;
      minute += 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }

      const maxOptions = [];
      while (hour < 24) {
        maxOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        minute += 30;
        if (minute >= 60) {
          minute -= 60;
          hour += 1;
        }
      }
      setMaxhours(maxOptions);
      if (!formik.values.maxHour || !maxOptions.includes(formik.values.maxHour)) {
        formik.setFieldValue('maxHour', maxOptions[0] || '');
      }
    } else {
      setMaxhours([]);
      formik.setFieldValue('maxHour', '');
    }
  }, [formik.values.minHour]);

  const cepChange = async (value: string) => {
    try {
      const format = value.replace(/\D/g, '');
      const formatted = formatCep(value);

      formik.setFieldValue('zipcode', formatted);
      formik.setFieldError('zipcode', undefined);

      if (format.length === 8) {
        setLoading(true);
        const response = await fetch(`https://viacep.com.br/ws/${format}/json/`);
        const result = await response.json();

        if (result.erro) {
          formik.setFieldError('zipcode', 'CEP não encontrado');
          setIsCepValid(false);
          setErros(['CEP não encontrado. Digite o endereço manualmente.']);
          setRegisterInvalid(true);
          return;
        }

        if (response.ok && !result.erro) {
          const endereco: any = dividirLogradouro(result.logradouro);
          formik.setValues({
            ...formik.values,
            zipcode: formatted,
            neigh: campoString(result.bairro || ''),
            street: campoString(endereco.logradouro || ''),
            city: campoString(result.localidade || ''),
            localType: endereco.tipoLogradouro,
            localNumber: '',
            complement: '',
          });

          const camposFaltantes: string[] = [];
          if (!result.bairro) {
            camposFaltantes.push('Bairro');
            formik.setFieldTouched('neigh', true, false);
          }
          if (!result.logradouro) {
            camposFaltantes.push('Logradouro');
            formik.setFieldTouched('street', true, false);
          }

          if (camposFaltantes.length > 0) {
            const camposMensagem = camposFaltantes.join(' e ');
            formik.setFieldError('zipcode', 'CEP com informações incompletas');
            setErros([
              `O CEP retornado não possui dados completos. Digite manualmente o campo: ${camposMensagem}.`,
            ]);
            setRegisterInvalid(true);
            setIsCepValid(false);
            setLoading(false);
            return;
          }

          formik.setFieldTouched('zipcode', true, false);
          formik.setFieldTouched('neigh', true, false);
          formik.setFieldTouched('street', true, false);
          setIsCepValid(true);
        }
      }
    } catch (error) {
      formik.setFieldError('zipcode', 'Erro ao validar CEP');
      setIsCepValid(false);
    } finally {
      setLoading(false);
    }
  };

  const getCepBorderStyle = () => ({
    borderColor: isCepValid ? '#049A63' : 'red',
    borderWidth: 1,
  });

  const initData = async () => {
    setLoading(true);
    try {
      const progress = await loadProgress();
      const pendingInviteCode = await getPendingInviteCode();

      if (progress && progress.roleUser === 'registering') {
        const tokenPayload = await getTokenPayload();
        const expired = isRegistrationExpired(tokenPayload?.createdAt);
        const inviteCodeChanged = shouldResetForNewInvite(
          progress.values?.inviteCode,
          pendingInviteCode,
        );

        if (expired || inviteCodeChanged) {
          await clearRegisterProgress();
          setStep(0);
          const resetValues = {
            ...formik.initialValues,
            inviteCode: pendingInviteCode ?? '',
          };
          formik.resetForm({ values: resetValues });
          // Persiste imediatamente para que initData() fique idempotente caso rode de novo
          // (ex: remontagem da tela) antes do usuário avançar para o próximo step.
          await saveStepData(resetValues, 0);
        } else {
          formik.setValues(progress.values);
          setStep(progress.step);
          if (progress.values.document) {
            const onlyNumbers = progress.values.document.replace(/\D/g, '');
            if (onlyNumbers.length > 0) {
              await handleDocumentTypeToggle(onlyNumbers.length <= 11 ? 'CPF' : 'CNPJ', false);
            }
          }
          if (pendingInviteCode) {
            formik.setFieldValue('inviteCode', pendingInviteCode);
            await saveStepData({ ...progress.values, inviteCode: pendingInviteCode }, progress.step);
          }
        }

        await clearPendingInviteCode();
        return;
      }

      if (progress?.roleUser === 'registered') {
        router.push('/products');
        return;
      }

      const fieldsToLoad = [
        'document',
        'stateNumberId',
        'cityNumberId',
        'restaurantName',
        'legalRestaurantName',
        'zipcode',
        'neigh',
        'street',
        'localNumber',
        'complement',
        'alternativePhone',
        'email',
        'alternativeEmail',
        'paymentWay',
        'financeResponsibleName',
        'financeResponsiblePhoneNumber',
        'emailBilling',
        'step',
        'noStateNumberId',
        'minHour',
        'maxHour',
        'closeDoor',
        'deliveryObs',
        'weeklyOrderAmount',
        'orderValue',
        'localType',
        'city',
        'inviteCode',
      ];

      const storedValuesArray = await Promise.all(fieldsToLoad.map((field) => getStorage(field)));

      const loadedValues: any = {};
      fieldsToLoad.forEach(async (field, index) => {
        const value = storedValuesArray[index];
        if (value !== null) {
          if (field === 'noStateNumberId' || field === 'closeDoor') {
            loadedValues[field] = value === 'true';
          } else if (field === 'step') {
            const stepValue = parseInt(value);
            setStep(isNaN(stepValue) ? 0 : stepValue);
          } else if (field === 'document') {
            loadedValues['document'] = value;
            const onlyNumbers = value.replace(/\D/g, '');
            if (onlyNumbers.length > 0) {
              await handleDocumentTypeToggle(onlyNumbers.length <= 11 ? 'CPF' : 'CNPJ', false);
            }
          } else {
            loadedValues[field] = value;
          }
        }
      });

      if (pendingInviteCode) {
        loadedValues.inviteCode = pendingInviteCode;
      }

      formik.resetForm({
        values: {
          ...formik.initialValues,
          ...loadedValues,
        },
      });

      await clearPendingInviteCode();
    } catch (error) {
      // Error loading stored data - continue with empty form
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleNextBtn = async () => {
    setLoading(true);
    allClosedDropdowns();
    try {
      await formik.validateForm();

      let currentStepIsValid = true;
      const currentSchema =
        step === 0
          ? step0Validation
          : step === 1
            ? step1Validation
            : step === 2
              ? step2Validation
              : step3Validation;
      try {
        await currentSchema.validate(formik.values, { abortEarly: false });
      } catch (validationErrors: any) {
        currentStepIsValid = false;
        formik.setErrors(
          validationErrors.inner.reduce((acc: any, err: any) => {
            acc[err.path] = err.message;
            return acc;
          }, {}),
        );
        validationErrors.inner.forEach((err: any) => {
          formik.setFieldTouched(err.path, true, false);
        });
      }

      if (!currentStepIsValid) {
        setLoading(false);
        return;
      }

      if (step === 0) {
        const errosApi: string[] = [];
        const documentNumerico = formik.values.document.replace(/\D/g, '');

        try {
          await handleDocumentValidation(documentNumerico);
          setStep(1);
        } catch (error: any) {
          // Backend sends: { status: 400, msg: 'already exists' | 'invalid document' }
          // But axios puts it in error.response.data
          const errorMsg = error?.response?.data?.msg || error?.message;
          const errorStatus = error?.response?.status;

          console.log('Caught error:', { errorMsg, errorStatus, fullError: error });

          if (errorMsg === 'already exists' || errorStatus === 409) {
            errosApi.push('Este documento já existe na plataforma');
            formik.setFieldError('document', 'Documento já cadastrado');
          } else if (errorMsg === 'invalid document' || errorMsg?.includes('invalid')) {
            errosApi.push('Documento inválido');
            formik.setFieldError('document', 'Documento inválido informado');
          } else {
            errosApi.push(getErrorMessage(error));
          }
          setErros(errosApi);
          setRegisterInvalid(true);
          setLoading(false);
          return;
        }
      } else if (step === 1 || step === 2) {
        setStep(step + 1);
      } else if (step === 3) {
        formik.handleSubmit();
        return;
      }

      if (step < 3) {
        const nextStep = step + 1;
        await saveStepData(formik.values, nextStep);
      }
    } catch (error) {
      // Error handled in step-specific logic
    } finally {
      if (step < 3) {
        setLoading(false);
      }
    }
  };

  const handleBackBtn = async () => {
    setLoading(true);
    const prevStep = step - 1;

    if (prevStep < 0) {
      await logout();
    } else {
      setStep(prevStep);
    }
    setLoading(false);
  };

  const handleDocumentValidation = async (documentNumber: string) => {
    const result = await checkDocument(documentNumber);

    const updatedValues = {
      ...formik.values,
      zipcode: '',
      neigh: '',
      street: '',
      city: '',
      legalRestaurantName: isCnpjData(result.data) ? result.data.razao_social : '',
      stateNumberId: isCnpjData(result.data) ? (result.data.inscricao_estadual ?? '') : '',
      cityNumberId: isCnpjData(result.data) ? (result.data.inscricao_municipal ?? '') : '',
    };

    formik.setValues(updatedValues);
  };

  const handleDocumentChange = (text: string) => {
    const formatted = formatDocument(text, documentType);
    formik.setFieldValue('document', formatted);
  };

  const handleDocumentTypeToggle = async (type: DocumentType, resetDocument: boolean = true) => {
    setDocumentType(type);
    if (type === 'CPF') {
      const userTokenPayload = await getTokenPayload();
      const userName = userTokenPayload?.name;
      formik.setFieldValue('restaurantName', userName || '');

      formik.setFieldValue('paymentWay', 'CC32');
    } else {
      formik.setFieldValue('restaurantName', '');
      formik.setFieldValue('paymentWay', '');
    }

    if (resetDocument) {
      formik.setFieldValue('document', '');
      formik.setFieldError('document', undefined);
    }
  };

  const handleCheckBox = (checked: boolean) => {
    formik.setFieldValue('noStateNumberId', checked);
    if (checked) {
      formik.setFieldValue('stateNumberId', '');
      formik.setFieldTouched('stateNumberId', false, false);
    } else {
      formik.setFieldValue('cityNumberId', '');
      formik.setFieldTouched('cityNumberId', false, false);
    }
  };

  const handleCheckBoxCloseDoor = (checked: boolean) => {
    formik.setFieldValue('closeDoor', checked);
  };

  const daysOptions = [
    { value: '1', label: '1 dia', testID: 'frequencia-opcao-1' },
    { value: '2', label: '2 dias', testID: 'frequencia-opcao-2' },
    { value: '3', label: '3 dias', testID: 'frequencia-opcao-3' },
    { value: '4', label: '4 dias', testID: 'frequencia-opcao-4' },
    { value: '5', label: '5 dias', testID: 'frequencia-opcao-5' },
    { value: '6', label: '6 dias', testID: 'frequencia-opcao-6' },
    { value: '7', label: '7 dias', testID: 'frequencia-opcao-7' },
  ];

  const onNeighChange = (value: string) => {
    formik.setFieldValue('neigh', value);
    if (value.trim() !== '') {
      formik.setFieldError('neigh', undefined);
    }
  };

  const onStreetChange = (value: string) => {
    formik.setFieldValue('street', value);
    if (value.trim() !== '') {
      formik.setFieldError('street', undefined);
    }
  };

  const onNumberChange = (value: string) => {
    formik.setFieldValue('localNumber', value);
    if (value.trim() !== '') {
      formik.setFieldError('localNumber', undefined);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View flex={1} backgroundColor="#F0F2F6">
        <ValidationDialog
          openModal={registerInvalid}
          setRegisterInvalid={setRegisterInvalid}
          erros={erros}
          document={formik.values.document}
        />
        <RegisterHeader step={step} />
        <ScrollView nestedScrollEnabled={true} scrollEnabled={isWeb || scrollEnabled}>
          {step === 0 ? (
            <View flex={1} marginTop={20} padding={pagePadding} {...containerProps}>
              <Text fontSize={12} marginBottom={5} color="gray">
                Dados do restaurante
              </Text>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <View flexDirection="column" alignItems="flex-start" justifyContent="space-between">
                  <View flexDirection="row" gap={5} width={isLargeScreen ? 'auto' : '100%'}>
                    <Button
                      flex={isLargeScreen ? 0 : 1}
                      size="$2"
                      height={touchHeight}
                      paddingHorizontal={15}
                      backgroundColor={isCpf ? '#04BF7B' : 'white'}
                      borderColor="lightgray"
                      borderWidth={1}
                      onPress={() => handleDocumentTypeToggle('CPF')}
                    >
                      <Text color={isCpf ? 'white' : 'black'} fontSize={isWeb ? 14 : 12}>
                        Pessoa Física
                      </Text>
                    </Button>
                    <Button
                      flex={isLargeScreen ? 0 : 1}
                      size="$2"
                      height={touchHeight}
                      paddingHorizontal={15}
                      backgroundColor={documentType === 'CNPJ' ? '#04BF7B' : 'white'}
                      borderColor="lightgray"
                      borderWidth={1}
                      onPress={() => handleDocumentTypeToggle('CNPJ')}
                    >
                      <Text
                        color={documentType === 'CNPJ' ? 'white' : 'black'}
                        fontSize={isWeb ? 14 : 12}
                      >
                        Pessoa Jurídica
                      </Text>
                    </Button>
                  </View>
                </View>
                {!isCpf && (
                  <RegisterField
                    label="Nome na fachada da rua"
                    error={errorOf('restaurantName')}
                    data-testid="register-input-nome-restaurante"
                    placeholder="Nome do restaurante"
                    onChangeText={(text) => formik.setFieldValue('restaurantName', text)}
                    onBlur={formik.handleBlur('restaurantName')}
                    value={formik.values.restaurantName}
                  />
                )}

                <RegisterField
                  label={isCpf ? 'CPF' : 'CNPJ'}
                  error={errorOf('document')}
                  data-testid="register-input-documento"
                  placeholder={isCpf ? '000.000.000-00' : '00.000.000/0001-00'}
                  onChangeText={handleDocumentChange}
                  value={formik.values.document}
                  keyboardType="number-pad"
                  onBlur={() => formik.setFieldTouched('document', true)}
                />
              </View>
              {isCpf && (
                <View
                  marginTop={12}
                  backgroundColor="#FFF7E6"
                  borderColor="#F5C542"
                  borderWidth={1}
                  borderRadius={8}
                  padding={12}
                  flexDirection="row"
                  alignItems="flex-start"
                  gap={12}
                >
                  <View
                    width={36}
                    height={36}
                    borderRadius={18}
                    backgroundColor="#FFE8B3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icons name="warning" size={20} color="#9A6700" />
                  </View>
                  <View flex={1}>
                    <Text fontSize={14} fontWeight="700" color="#7A4F00">
                      Tem um restaurante/CNPJ?
                    </Text>
                    <Text marginTop={4} fontSize={12} color="#7A4F00" lineHeight={18}>
                      Com o cadastro como Pessoa Jurídica você acessa condições melhores de prazo e
                      benefícios exclusivos para o seu negócio.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : step === 1 ? (
            <View flex={1} marginTop={20} padding={pagePadding} {...containerProps}>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                {!isCpf && (
                  <RegisterField
                    label="Nome na fachada da rua"
                    marginTop={0}
                    value={formik.values.restaurantName}
                    disabled
                    opacity={0.5}
                  />
                )}

                <RegisterField
                  label={isCpf ? 'CPF' : 'CNPJ'}
                  value={formik.values.document}
                  disabled
                  opacity={0.5}
                />

                {!isCpf && (
                  <>
                    <RegisterField
                      label="Inscrição estadual"
                      hint="Min. 8 digitos"
                      error={errorOf('stateNumberId')}
                      data-testid="register-input-inscricao-estadual"
                      onChangeText={(text) => formik.setFieldValue('stateNumberId', text)}
                      value={formik.values.stateNumberId}
                      disabled={formik.values.noStateNumberId}
                      opacity={formik.values.noStateNumberId ? 0.5 : 1}
                      placeholder={formik.values.noStateNumberId ? 'Isento' : '00000000'}
                      onBlur={() => formik.setFieldTouched('stateNumberId', true)}
                    />
                    <View
                      marginTop={15}
                      minHeight={touchHeight}
                      alignItems="center"
                      flexDirection="row"
                    >
                      <Checkbox
                        onCheckedChange={handleCheckBox}
                        checked={formik.values.noStateNumberId}
                      >
                        {formik.values.noStateNumberId ? <Icons name="checkmark" /> : null}
                      </Checkbox>
                      <Text
                        paddingLeft={5}
                        fontSize={12}
                        onPress={
                          isWeb ? () => handleCheckBox(!formik.values.noStateNumberId) : undefined
                        }
                      >
                        Sou isento de IE
                      </Text>
                    </View>
                  </>
                )}

                {formik.values.noStateNumberId && !isCpf && (
                  <RegisterField
                    label="Inscrição municipal"
                    hint="Min. 8 digitos"
                    error={errorOf('cityNumberId')}
                    placeholder="00000000"
                    onChangeText={(text) => formik.setFieldValue('cityNumberId', text)}
                    value={formik.values.cityNumberId}
                    onBlur={() => formik.setFieldTouched('cityNumberId', true)}
                  />
                )}

                {!isCpf && (
                  <RegisterField
                    label="Razão Social"
                    value={formik.values.legalRestaurantName}
                    opacity={0.5}
                  />
                )}

                <Text fontSize={12} marginTop={10} marginBottom={5} color="gray">
                  Endereço
                </Text>
                <View
                  backgroundColor="white"
                  borderColor="lightgray"
                  borderWidth={1}
                  borderRadius={5}
                  padding={10}
                >
                  <RegisterField
                    label="Cep"
                    hint="8 digitos"
                    error={errorOf('zipcode')}
                    data-testid="register-input-cep"
                    keyboardType="number-pad"
                    autoComplete="postal-code"
                    textContentType="postalCode"
                    onBlur={() => formik.setFieldTouched('zipcode', true)}
                    onChangeText={cepChange}
                    placeholder="00000-000"
                    value={formik.values.zipcode}
                    focusStyle={getCepBorderStyle()}
                    hoverStyle={getCepBorderStyle()}
                    maxLength={9}
                  />
                  <RegisterField
                    label="Bairro"
                    error={errorOf('neigh')}
                    data-testid="register-input-bairro"
                    onBlur={() => formik.setFieldTouched('neigh', true)}
                    onChangeText={onNeighChange}
                    value={formik.values.neigh}
                  />
                  <RegisterField
                    label="Logradouro"
                    error={errorOf('street')}
                    data-testid="register-input-logradouro"
                    autoComplete="street-address"
                    textContentType="streetAddressLine1"
                    onBlur={() => formik.setFieldTouched('street', true)}
                    onChangeText={onStreetChange}
                    placeholder="exemplo: Dois Amores"
                    value={formik.values.street}
                  />
                  <RegisterField
                    label="Número"
                    error={errorOf('localNumber')}
                    data-testid="register-input-numero"
                    onBlur={() => formik.setFieldTouched('localNumber', true)}
                    onChangeText={onNumberChange}
                    placeholder="Exemplo: 12"
                    value={formik.values.localNumber}
                  />
                  <RegisterField
                    label="Complemento"
                    error={errorOf('complement')}
                    data-testid="register-input-complemento"
                    onChangeText={(text) => formik.setFieldValue('complement', text)}
                    placeholder="Exemplo: Loja A"
                    value={formik.values.complement}
                  />
                </View>
              </View>
            </View>
          ) : step === 2 ? (
            <View flex={10} marginTop={20} padding={pagePadding} {...containerProps}>
              <Text fontSize={12} marginBottom={5} color="gray">
                Contato
              </Text>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <RegisterField
                  label="E-mail"
                  hint="Para comunicados"
                  error={errorOf('email')}
                  data-testid="register-input-email"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={formik.values.email}
                  autoCapitalize="none"
                  onChangeText={(text) => formik.setFieldValue('email', text)}
                  onBlur={() => formik.setFieldTouched('email', true)}
                  placeholder="exemplo@exemplo.com"
                />
                <RegisterField
                  label="E-mail alternativo"
                  hint="Opcional"
                  error={errorOf('alternativeEmail')}
                  value={formik.values.alternativeEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  onChangeText={(text) => formik.setFieldValue('alternativeEmail', text)}
                  onBlur={() => formik.setFieldTouched('alternativeEmail', true)}
                  placeholder="exemplo@exemplo.com"
                />
              </View>
              <Text marginTop={10} fontSize={12} marginBottom={5} color="gray">
                Informações financeiras
              </Text>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <RegisterSelect
                  label="Qual o formato de pagamento preferido?"
                  marginTop={0}
                  error={errorOf('paymentWay')}
                  testID="register-select-forma-pagamento"
                  value={formik.values.paymentWay}
                  setValue={(callback) => {
                    const value =
                      typeof callback === 'function'
                        ? callback(formik.values.paymentWay)
                        : callback;
                    formik.setFieldValue('paymentWay', value);
                  }}
                  onSelectItem={(item) => {
                    if (item.value) {
                      formik.setFieldError('paymentWay', undefined);
                    }
                  }}
                  disabled={isCpf}
                  items={
                    isCpf
                      ? [
                          {
                            label: getPaymentDescription('CC32'),
                            value: 'CC32',
                            testID: 'pagamento-opcao-cc32',
                          },
                        ]
                      : [
                          {
                            label: 'Diário: 7 dias após a entrega',
                            value: 'DI07',
                            testID: 'pagamento-opcao-di07',
                          },
                          {
                            label: 'Semanal: vencimento na quarta',
                            value: 'UQ10',
                            testID: 'pagamento-opcao-uq10',
                          },
                        ]
                  }
                  multiple={false}
                  open={paymentWayOpen}
                  setOpen={setPaymentWayOpen}
                  onOpen={() => formik.setFieldError('paymentWay', undefined)}
                  placeholder=""
                />
                <View
                  marginTop={10}
                  borderColor="lightgray"
                  borderWidth={0.5}
                  padding={5}
                  gap={5}
                  flexDirection="row"
                >
                  <Icons size={25} color="gray" name="information-circle"></Icons>
                  <View justifyContent="center">
                    <Text maxWidth="100%" color="gray" fontSize={10}>
                      Prazos são sujeitos a avaliação de crédito
                    </Text>
                  </View>
                </View>
                {!isCpf && (
                  <>
                    <RegisterField
                      label="Nome responsável financeiro"
                      required
                      error={errorOf('financeResponsibleName')}
                      data-testid="register-input-responsavel-financeiro"
                      onBlur={formik.handleBlur('financeResponsibleName')}
                      value={formik.values.financeResponsibleName}
                      onChangeText={(value) => {
                        const formattedValue = filterLettersAndSpaces(value);
                        formik.setFieldValue('financeResponsibleName', formattedValue);
                      }}
                    />
                    <RegisterField
                      label="Telefone responsável financeiro"
                      required
                      error={errorOf('financeResponsiblePhoneNumber')}
                      data-testid="register-input-telefone-financeiro"
                      maxLength={15}
                      onBlur={formik.handleBlur('financeResponsiblePhoneNumber')}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                      value={formik.values.financeResponsiblePhoneNumber}
                      onChangeText={(value) => {
                        let onlyNums = value.replace(/\D/g, '');

                        if (onlyNums.length > 10) {
                          onlyNums = onlyNums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                        } else if (onlyNums.length > 6) {
                          onlyNums = onlyNums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                        } else if (onlyNums.length > 2) {
                          onlyNums = onlyNums.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                        } else if (onlyNums.length > 0) {
                          onlyNums = onlyNums.replace(/(\d{0,2})/, '($1');
                        }

                        formik.setFieldValue('financeResponsiblePhoneNumber', onlyNums);
                      }}
                    />
                    <RegisterField
                      label="E-mail"
                      required
                      hint="Para cobranças"
                      error={errorOf('emailBilling')}
                      data-testid="register-input-email-cobranca"
                      keyboardType="email-address"
                      autoComplete="email"
                      textContentType="emailAddress"
                      value={formik.values.emailBilling}
                      autoCapitalize="none"
                      onChangeText={(text) => formik.setFieldValue('emailBilling', text)}
                      onBlur={() => formik.setFieldTouched('emailBilling', true)}
                      placeholder="exemplo@exemplo.com"
                    />
                  </>
                )}
              </View>
            </View>
          ) : step === 3 ? (
            <View flex={1} padding={pagePadding} gap={10} {...containerProps}>
              <Text fontSize={12} marginBottom={5} color="gray">
                Entrega
              </Text>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <View
                  borderColor="lightgray"
                  borderWidth={0.5}
                  padding={5}
                  gap={5}
                  flexDirection="row"
                >
                  <Icons size={25} color="gray" name="information-circle"></Icons>
                  <View justifyContent="center">
                    <Text maxWidth="99%" color="gray" fontSize={10}>
                      Você deve definir pelo menos 1 hora e 30 minutos de diferença entre o horário
                      mais cedo e o horário mais tarde para sua entrega.
                    </Text>
                  </View>
                </View>
                <View flexDirection="row" gap={20}>
                  <View flex={1}>
                    <RegisterSelect
                      label="Quero receber de"
                      error={errorOf('minHour')}
                      testID="register-select-horario-minimo"
                      value={formik.values.minHour}
                      setValue={(callback) => {
                        const value =
                          typeof callback === 'function'
                            ? callback(formik.values.minHour)
                            : callback;
                        formik.setFieldValue('minHour', value);
                      }}
                      onSelectItem={(item) => {
                        if (item.value) {
                          formik.setFieldError('minHour', undefined);
                        }
                      }}
                      items={minhours.map((item) => {
                        return {
                          label: item,
                          value: item,
                          testID: `horario-minimo-opcao-${item.replace(':', '')}`,
                        };
                      })}
                      multiple={false}
                      open={minHourOpen}
                      setOpen={setMinHourOpen}
                      onOpen={() => {
                        setScrollEnabled(false);
                        formik.setFieldError('minHour', undefined);
                      }}
                      onClose={() => {
                        setScrollEnabled(true);
                      }}
                      placeholder="Escolha um horário"
                    />
                  </View>
                  <View flex={1}>
                    <RegisterSelect
                      label="Até"
                      error={errorOf('maxHour')}
                      value={formik.values.maxHour}
                      setValue={(callback) => {
                        const value =
                          typeof callback === 'function'
                            ? callback(formik.values.maxHour)
                            : callback;
                        formik.setFieldValue('maxHour', value);
                      }}
                      onSelectItem={(item) => {
                        if (item.value) {
                          formik.setFieldError('maxHour', undefined);
                        }
                      }}
                      items={maxhours.map((item) => {
                        return { label: item, value: item };
                      })}
                      multiple={false}
                      open={maxHourOpen}
                      setOpen={setMaxHourOpen}
                      onOpen={() => {
                        setScrollEnabled(false);
                        formik.setFieldError('maxHour', undefined);
                      }}
                      onClose={() => setScrollEnabled(true)}
                      placeholder=""
                    />
                  </View>
                </View>
                <View
                  marginTop={15}
                  minHeight={touchHeight}
                  alignItems="center"
                  flexDirection="row"
                >
                  <Checkbox
                    onCheckedChange={handleCheckBoxCloseDoor}
                    checked={formik.values.closeDoor}
                  >
                    {formik.values.closeDoor ? <Icons name="checkmark"></Icons> : <></>}
                  </Checkbox>
                  <Text
                    paddingLeft={5}
                    fontSize={12}
                    onPress={
                      isWeb ? () => handleCheckBoxCloseDoor(!formik.values.closeDoor) : undefined
                    }
                  >
                    Aceito receber de portas fechadas
                  </Text>
                </View>
                <RegisterField
                  label="Informações adicionais"
                  onChangeText={(text) => {
                    formik.setFieldValue('deliveryObs', text);
                  }}
                  value={formik.values.deliveryObs}
                  placeholder="Exemplo: Entrar pela porta lateral"
                />
              </View>
              <Text marginTop={10} fontSize={12} marginBottom={5} color="gray">
                Perfil de compra
              </Text>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <RegisterSelect
                  label="Quantos dias na semana você costuma pedir?"
                  marginTop={0}
                  error={errorOf('weeklyOrderAmount')}
                  testID="register-select-frequencia-pedidos"
                  value={formik.values.weeklyOrderAmount}
                  setValue={(callback) => {
                    const value =
                      typeof callback === 'function'
                        ? callback(formik.values.weeklyOrderAmount)
                        : callback;
                    formik.setFieldValue('weeklyOrderAmount', value);
                  }}
                  items={daysOptions}
                  open={daysOpen}
                  setOpen={setDaysOpen}
                  onOpen={() => {
                    setScrollEnabled(false);
                    formik.setFieldError('weeklyOrderAmount', undefined);
                  }}
                  onClose={() => {
                    setScrollEnabled(true);
                  }}
                  onSelectItem={(item) => {
                    if (item.value) {
                      formik.setFieldError('weeklyOrderAmount', undefined);
                    }
                  }}
                  placeholder="Escolha uma opção"
                />
                <RegisterFieldFrame
                  label="Qual o valor médio de um pedido?"
                  error={errorOf('orderValue')}
                >
                  <TextInputMask
                    testID="register-input-valor-pedido"
                    placeholder="R$ 0"
                    type="only-numbers"
                    customTextInput={Input}
                    customTextInputProps={{
                      ...registerBoxProps(!!errorOf('orderValue')),
                      ...field,
                    }}
                    onChangeText={(value) => formik.setFieldValue('orderValue', value)}
                    value={formik.values.orderValue}
                    onBlur={formik.handleBlur('orderValue')}
                    keyboardType="number-pad"
                  />
                </RegisterFieldFrame>
              </View>
              <InviteCodeField value={formik.values.inviteCode} />
            </View>
          ) : (
            <></>
          )}
          {isWeb && (
            <RegisterNavButtons
              nextLabel={nextLabel}
              onBack={handleBackBtn}
              onNext={handleNextBtn}
            />
          )}
        </ScrollView>
        {!isWeb && (
          <RegisterNavButtons nextLabel={nextLabel} onBack={handleBackBtn} onNext={handleNextBtn} />
        )}
        <VersionInfo />

        {loading && (
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0, 0, 0, 0.5)"
            justifyContent="center"
            alignItems="center"
            zIndex={9999}
          >
            <ActivityIndicator size="large" color="#04BF7B" />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
