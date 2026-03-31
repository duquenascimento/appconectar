import { useResponsiveness } from '@/src/components/hooks/useResponsiveness';
import { ValidationDialog } from '@/src/components/pages/sign/ValidationDialog';
import { useAuthContext } from '@/src/contexts/auth.context';
import { useRestaurantContext } from '@/src/contexts/restaurant.context';
import { loadProgress, saveStepData } from '@/src/services/registerProgressService';
import { checkDocument, sendFullRegister } from '@/src/services/registerService';
import { getErrorMessage } from '@/src/types/apiErrorTypes';
import { formatDocument, isCnpjData, type DocumentType } from '@/src/utils/documentUtils';
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
import DropDownPicker from 'react-native-dropdown-picker';
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
  const { logout } = useAuthContext();
  const { loadRestaurants } = useRestaurantContext();
  const { isLargeScreen } = useResponsiveness();

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

      if (progress && progress.roleUser === 'registering') {
        formik.setValues(progress.values);
        setStep(progress.step);
        if (progress.values.document) {
          const onlyNumbers = progress.values.document.replace(/\D/g, '');
          if (onlyNumbers.length > 0) {
            setDocumentType(onlyNumbers.length <= 11 ? 'CPF' : 'CNPJ');
          }
        }
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
      fieldsToLoad.forEach((field, index) => {
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
              setDocumentType(onlyNumbers.length <= 11 ? 'CPF' : 'CNPJ');
            }
          } else {
            loadedValues[field] = value;
          }
        }
      });

      formik.resetForm({
        values: {
          ...formik.initialValues,
          ...loadedValues,
        },
      });
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

  const handleDocumentTypeToggle = (type: DocumentType) => {
    setDocumentType(type);
    formik.setFieldValue('document', '');
    formik.setFieldError('document', undefined);
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
    { value: '1', label: '1 dia' },
    { value: '2', label: '2 dias' },
    { value: '3', label: '3 dias' },
    { value: '4', label: '4 dias' },
    { value: '5', label: '5 dias' },
    { value: '6', label: '6 dias' },
    { value: '7', label: '7 dias' },
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

  const isCpf = documentType === 'CPF';

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
        <View marginBottom={10} paddingTop={50} alignItems="center" justifyContent="center">
          <Text fontSize={20}>Cadastro</Text>
          <View paddingTop={20} justifyContent="center" flexDirection="row">
            <View alignItems="center">
              <Icons name="disc"></Icons>
              <Text fontSize={10}>Empresa</Text>
            </View>
            <View
              marginTop={5}
              backgroundColor={step > 1 ? 'black' : 'lightgray'}
              width={50}
              height={2}
            ></View>
            <View alignItems="center">
              <Icons color={step > 1 ? 'black' : 'lightgray'} name="disc"></Icons>
              <Text color={step > 1 ? 'black' : 'lightgray'} fontSize={10}>
                Contato
              </Text>
            </View>
            <View
              marginTop={5}
              backgroundColor={step === 3 ? 'black' : 'lightgray'}
              width={50}
              height={2}
            ></View>
            <View alignItems="center">
              <Icons color={step > 2 ? 'black' : 'lightgray'} name="disc"></Icons>
              <Text color={step > 2 ? 'black' : 'lightgray'} fontSize={10}>
                Entrega
              </Text>
            </View>
          </View>
        </View>
        <ScrollView nestedScrollEnabled={true} scrollEnabled={scrollEnabled}>
          {step === 0 ? (
            <View flex={1} marginTop={20} padding={20}>
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
                      paddingHorizontal={15}
                      backgroundColor={isCpf ? '#04BF7B' : 'white'}
                      borderColor="lightgray"
                      borderWidth={1}
                      onPress={() => handleDocumentTypeToggle('CPF')}
                    >
                      <Text color={isCpf ? 'white' : 'black'} fontSize={12}>
                        Pessoa Física
                      </Text>
                    </Button>
                    <Button
                      flex={isLargeScreen ? 0 : 1}
                      size="$2"
                      paddingHorizontal={15}
                      backgroundColor={documentType === 'CNPJ' ? '#04BF7B' : 'white'}
                      borderColor="lightgray"
                      borderWidth={1}
                      onPress={() => handleDocumentTypeToggle('CNPJ')}
                    >
                      <Text color={documentType === 'CNPJ' ? 'white' : 'black'} fontSize={12}>
                        Pessoa Jurídica
                      </Text>
                    </Button>
                  </View>
                </View>
                <Text marginTop={15}>Nome na fachada da rua</Text>
                <Input
                  placeholder="Nome do restaurante"
                  onChangeText={(text) => formik.setFieldValue('restaurantName', text)}
                  onBlur={formik.handleBlur('restaurantName')}
                  value={formik.values.restaurantName}
                  backgroundColor="white"
                  borderRadius={2}
                  borderColor={
                    formik.touched.restaurantName && formik.errors.restaurantName
                      ? 'red'
                      : 'lightgray'
                  }
                  focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                />
                {formik.touched.restaurantName && formik.errors.restaurantName && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.restaurantName}
                  </Text>
                )}

                <Text marginTop={15}>{isCpf ? 'CPF' : 'CNPJ'}</Text>
                <Input
                  placeholder={isCpf ? '000.000.000-00' : '00.000.000/0001-00'}
                  onChangeText={handleDocumentChange}
                  value={formik.values.document}
                  keyboardType="number-pad"
                  backgroundColor="white"
                  borderRadius={2}
                  focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  onBlur={() => formik.setFieldTouched('document', true)}
                  borderColor={
                    formik.touched.document && formik.errors.document ? 'red' : 'lightgray'
                  }
                />
                {formik.touched.document && formik.errors.document && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.document}
                  </Text>
                )}
              </View>
            </View>
          ) : step === 1 ? (
            <View flex={1} marginTop={20} padding={20}>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <Text>Nome na fachada da rua</Text>
                <Input
                  value={formik.values.restaurantName}
                  disabled
                  opacity={0.5}
                  backgroundColor="white"
                  borderRadius={2}
                />

                <Text marginTop={15}>{isCpf ? 'CPF' : 'CNPJ'}</Text>
                <Input
                  value={formik.values.document}
                  disabled
                  opacity={0.5}
                  backgroundColor="white"
                  borderRadius={2}
                />

                {!isCpf && (
                  <>
                    <View
                      opacity={formik.values.noStateNumberId ? 0.5 : 1}
                      marginTop={15}
                      alignItems="center"
                      flexDirection="row"
                      gap={8}
                    >
                      <Text>Inscrição estadual</Text>
                      <Text fontSize={10} color="gray">
                        Min. 8 digitos
                      </Text>
                    </View>
                    <Input
                      onChangeText={(text) => formik.setFieldValue('stateNumberId', text)}
                      value={formik.values.stateNumberId}
                      disabled={formik.values.noStateNumberId}
                      opacity={formik.values.noStateNumberId ? 0.5 : 1}
                      placeholder={formik.values.noStateNumberId ? 'Isento' : '00000000'}
                      onBlur={() => formik.setFieldTouched('stateNumberId', true)}
                    />
                    {formik.touched.stateNumberId && formik.errors.stateNumberId && (
                      <Text color="red" fontSize={12}>
                        {formik.errors.stateNumberId}
                      </Text>
                    )}
                    <View marginTop={15} alignItems="center" flexDirection="row">
                      <Checkbox
                        onCheckedChange={handleCheckBox}
                        checked={formik.values.noStateNumberId}
                      >
                        {formik.values.noStateNumberId ? <Icons name="checkmark" /> : null}
                      </Checkbox>
                      <Text paddingLeft={5} fontSize={12}>
                        Sou isento de IE
                      </Text>
                    </View>
                  </>
                )}

                {formik.values.noStateNumberId && !isCpf && (
                  <>
                    <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                      <Text>Inscrição municipal</Text>
                      <Text fontSize={10} color="gray">
                        Min. 8 digitos
                      </Text>
                    </View>
                    <Input
                      placeholder="00000000"
                      onChangeText={(text) => formik.setFieldValue('cityNumberId', text)}
                      value={formik.values.cityNumberId}
                      onBlur={() => formik.setFieldTouched('cityNumberId', true)}
                    />
                    {formik.touched.cityNumberId && formik.errors.cityNumberId && (
                      <Text color="red" fontSize={12}>
                        {formik.errors.cityNumberId}
                      </Text>
                    )}
                  </>
                )}

                {!isCpf && (
                  <>
                    <Text marginTop={15} disabled>
                      Razão Social
                    </Text>
                    <Input value={formik.values.legalRestaurantName} opacity={0.5} />
                  </>
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
                  <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                    <Text>Cep</Text>
                    <Text fontSize={10} color="gray">
                      8 digitos
                    </Text>
                  </View>
                  <Input
                    onBlur={() => formik.setFieldTouched('zipcode', true)}
                    onChangeText={cepChange}
                    placeholder="00000-000"
                    value={formik.values.zipcode}
                    backgroundColor="white"
                    borderRadius={2}
                    borderColor={
                      formik.touched.zipcode && formik.errors.zipcode ? 'red' : 'lightgray'
                    }
                    focusStyle={getCepBorderStyle()}
                    hoverStyle={getCepBorderStyle()}
                    maxLength={9}
                  />
                  {formik.touched.zipcode && formik.errors.zipcode && (
                    <Text color="red" fontSize={12}>
                      {formik.errors.zipcode}
                    </Text>
                  )}
                  <Text marginTop={15}>Bairro</Text>
                  <Input
                    onBlur={() => formik.setFieldTouched('neigh', true)}
                    onChangeText={onNeighChange}
                    value={formik.values.neigh}
                    backgroundColor="white"
                    borderRadius={2}
                    borderColor={formik.touched.neigh && formik.errors.neigh ? 'red' : 'lightgray'}
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  ></Input>
                  {formik.touched.neigh && formik.errors.neigh && (
                    <Text color="red" fontSize={12}>
                      {formik.errors.neigh}
                    </Text>
                  )}
                  <Text marginTop={15}>Logradouro</Text>
                  <Input
                    onBlur={() => formik.setFieldTouched('street', true)}
                    onChangeText={onStreetChange}
                    placeholder="exemplo: Dois Amores"
                    value={formik.values.street}
                    backgroundColor="white"
                    borderRadius={2}
                    borderColor={
                      formik.touched.street && formik.errors.street ? 'red' : 'lightgray'
                    }
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  ></Input>
                  {formik.touched.street && formik.errors.street && (
                    <Text color="red" fontSize={12}>
                      {formik.errors.street}
                    </Text>
                  )}
                  <Text marginTop={15}>Número</Text>
                  <Input
                    onBlur={() => formik.setFieldTouched('localNumber', true)}
                    onChangeText={onNumberChange}
                    placeholder="Exemplo: 12"
                    value={formik.values.localNumber}
                    backgroundColor="white"
                    borderRadius={2}
                    borderColor={
                      formik.touched.localNumber && formik.errors.localNumber ? 'red' : 'lightgray'
                    }
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  ></Input>
                  {formik.touched.localNumber && formik.errors.localNumber && (
                    <Text color="red" fontSize={12}>
                      {formik.errors.localNumber}
                    </Text>
                  )}
                  <Text marginTop={15}>Complemento</Text>
                  <Input
                    onChangeText={(text) => formik.setFieldValue('complement', text)}
                    placeholder="Exemplo: Loja A"
                    value={formik.values.complement}
                    backgroundColor="white"
                    borderRadius={2}
                    borderColor={
                      formik.touched.complement && formik.errors.complement ? 'red' : 'lightgray'
                    }
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  ></Input>
                  {formik.touched.complement && formik.errors.complement && (
                    <Text color="red" fontSize={12}>
                      {formik.errors.complement}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ) : step === 2 ? (
            <View flex={10} marginTop={20} padding={20}>
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
                <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                  <Text>E-mail</Text>
                  <Text fontSize={10} color="gray">
                    Para comunicados
                  </Text>
                </View>
                <Input
                  value={formik.values.email}
                  autoCapitalize="none"
                  onChangeText={(text) => formik.setFieldValue('email', text)}
                  onBlur={() => formik.setFieldTouched('email', true)}
                  backgroundColor="white"
                  borderRadius={2}
                  borderColor={formik.touched.email && formik.errors.email ? 'red' : 'lightgray'}
                  placeholder="exemplo@exemplo.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.email}
                  </Text>
                )}
                <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                  <Text>E-mail alternativo</Text>
                  <Text fontSize={10} color="gray">
                    Opcional
                  </Text>
                </View>
                <Input
                  value={formik.values.alternativeEmail}
                  onChangeText={(text) => formik.setFieldValue('alternativeEmail', text)}
                  onBlur={() => formik.setFieldTouched('alternativeEmail', true)}
                  backgroundColor="white"
                  borderRadius={2}
                  borderColor={
                    formik.touched.alternativeEmail && formik.errors.alternativeEmail
                      ? 'red'
                      : 'lightgray'
                  }
                  placeholder="exemplo@exemplo.com"
                />
                {formik.touched.alternativeEmail && formik.errors.alternativeEmail && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.alternativeEmail}
                  </Text>
                )}
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
                <View>
                  <Text>Qual o formato de pagamento preferido?</Text>
                  <View
                    marginTop={10}
                    justifyContent="flex-start"
                    borderWidth={0.5}
                    borderColor={
                      formik.touched.paymentWay && formik.errors.paymentWay ? 'red' : 'lightgray'
                    }
                    zIndex={99}
                  >
                    <DropDownPicker
                      value={formik.values.paymentWay}
                      style={{
                        borderWidth: 1,
                        borderColor: 'lightgray',
                        borderRadius: 2,
                        flex: 1,
                        position: 'absolute',
                      }}
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
                      listMode="SCROLLVIEW"
                      dropDownDirection="BOTTOM"
                      dropDownContainerStyle={{
                        position: 'relative',
                      }}
                      items={[
                        {
                          label: 'Diário: 7 dias após a entrega',
                          value: 'DI07',
                        },
                        {
                          label: 'Semanal: vencimento na quarta',
                          value: 'UQ10',
                        },
                      ]}
                      multiple={false}
                      open={paymentWayOpen}
                      setOpen={setPaymentWayOpen}
                      onOpen={() => formik.setFieldError('paymentWay', undefined)}
                      placeholder=""
                    ></DropDownPicker>
                  </View>
                  {formik.touched.paymentWay && formik.errors.paymentWay && (
                    <View height={65} flex={1} justifyContent="flex-end">
                      <Text color="red" fontSize={12}>
                        {formik.errors.paymentWay}
                      </Text>
                    </View>
                  )}
                  <View
                    marginTop={formik.errors.paymentWay ? 10 : 60}
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
                </View>
                {!isCpf && (
                  <>
                    <View flex={1}>
                      <Text marginTop={15}>
                        Nome responsável financeiro
                        <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                      </Text>
                      <View
                        flex={1}
                        borderWidth={0.5}
                        borderColor={
                          formik.touched.financeResponsibleName &&
                          formik.errors.financeResponsibleName
                            ? 'red'
                            : 'lightgray'
                        }
                        zIndex={101}
                      >
                        <Input
                          fontSize={14}
                          flex={1}
                          backgroundColor="$colorTransparent"
                          borderWidth="$0"
                          borderRadius={2}
                          onBlur={formik.handleBlur('financeResponsibleName')}
                          borderColor={
                            formik.touched.financeResponsibleName &&
                            formik.errors.financeResponsibleName
                              ? 'red'
                              : 'lightgray'
                          }
                          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                          value={formik.values.financeResponsibleName}
                          onChangeText={(value) => {
                            const formattedValue = value.replace(/[^A-Za-z\s]/g, '');
                            formik.setFieldValue('financeResponsibleName', formattedValue);
                          }}
                        />
                      </View>
                      {formik.touched.financeResponsibleName &&
                        formik.errors.financeResponsibleName && (
                          <Text color="red" fontSize={12}>
                            {formik.errors.financeResponsibleName}
                          </Text>
                        )}
                    </View>
                    <View flex={1}>
                      <Text marginTop={15}>
                        Telefone responsável financeiro
                        <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                      </Text>
                      <View
                        flex={1}
                        borderWidth={0.5}
                        borderColor={
                          formik.touched.financeResponsiblePhoneNumber &&
                          formik.errors.financeResponsiblePhoneNumber
                            ? 'red'
                            : 'lightgray'
                        }
                        zIndex={101}
                      >
                        <Input
                          maxLength={15}
                          fontSize={14}
                          flex={1}
                          backgroundColor="$colorTransparent"
                          borderWidth="$0"
                          borderRadius={2}
                          borderColor={
                            formik.touched.financeResponsiblePhoneNumber &&
                            formik.errors.financeResponsiblePhoneNumber
                              ? 'red'
                              : 'lightgray'
                          }
                          onBlur={formik.handleBlur('financeResponsiblePhoneNumber')}
                          focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                          hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                          keyboardType="phone-pad"
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
                      </View>
                      {formik.touched.financeResponsiblePhoneNumber &&
                        formik.errors.financeResponsiblePhoneNumber && (
                          <Text color="red" fontSize={12}>
                            {formik.errors.financeResponsiblePhoneNumber}
                          </Text>
                        )}
                      <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                        <Text>
                          E-mail
                          <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                        </Text>
                        <Text fontSize={10} color="gray">
                          Para cobranças
                        </Text>
                      </View>
                      <Input
                        value={formik.values.emailBilling}
                        autoCapitalize="none"
                        onChangeText={(text) => formik.setFieldValue('emailBilling', text)}
                        onBlur={() => formik.setFieldTouched('emailBilling', true)}
                        backgroundColor="white"
                        borderRadius={2}
                        borderColor={
                          formik.touched.emailBilling && formik.errors.emailBilling
                            ? 'red'
                            : 'lightgray'
                        }
                        placeholder="exemplo@exemplo.com"
                      />
                      {formik.touched.emailBilling && formik.errors.emailBilling && (
                        <Text color="red" fontSize={12}>
                          {formik.errors.emailBilling}
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>
          ) : step === 3 ? (
            <View flex={1} padding={20} gap={10}>
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
                    <Text marginTop={15}>Quero receber de</Text>
                    <View
                      flex={1}
                      borderWidth={0.5}
                      borderColor={
                        formik.touched.minHour && formik.errors.minHour ? 'red' : 'lightgray'
                      }
                      zIndex={101}
                    >
                      <DropDownPicker
                        value={formik.values.minHour}
                        style={{
                          borderWidth: 1,
                          borderColor: 'lightgray',
                          borderRadius: 5,
                          zIndex: 1000,
                          position: 'absolute',
                        }}
                        listMode="SCROLLVIEW"
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          position: 'relative',
                        }}
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
                          return { label: item, value: item };
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
                      ></DropDownPicker>
                    </View>
                    {formik.touched.minHour && formik.errors.minHour && (
                      <View height={65} flex={1} justifyContent="flex-end">
                        <Text color="red" fontSize={12}>
                          {formik.errors.minHour}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View flex={1}>
                    <Text marginTop={15}>Até</Text>
                    <View
                      flex={1}
                      borderWidth={0.5}
                      borderColor={
                        formik.touched.maxHour && formik.errors.maxHour ? 'red' : 'lightgray'
                      }
                      zIndex={100}
                    >
                      <DropDownPicker
                        value={formik.values.maxHour}
                        style={{
                          borderWidth: 1,
                          borderColor: 'lightgray',
                          borderRadius: 5,
                          zIndex: 1000,
                          position: 'absolute',
                        }}
                        listMode="SCROLLVIEW"
                        dropDownDirection="BOTTOM"
                        dropDownContainerStyle={{
                          position: 'relative',
                        }}
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
                      ></DropDownPicker>
                    </View>
                    {formik.touched.maxHour && formik.errors.maxHour && (
                      <View height={65} flex={1} justifyContent="flex-end">
                        <Text color="red" fontSize={12}>
                          {formik.errors.maxHour}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  marginTop={formik.errors.maxHour || formik.errors.minHour ? 10 : 65}
                  alignItems="center"
                  flexDirection="row"
                >
                  <Checkbox
                    onCheckedChange={handleCheckBoxCloseDoor}
                    checked={formik.values.closeDoor}
                  >
                    {formik.values.closeDoor ? <Icons name="checkmark"></Icons> : <></>}
                  </Checkbox>
                  <Text paddingLeft={5} fontSize={12}>
                    Aceito receber de portas fechadas
                  </Text>
                </View>
                <Text marginTop={15}>Informações adicionais</Text>
                <Input
                  onChangeText={(text) => {
                    formik.setFieldValue('deliveryObs', text);
                  }}
                  value={formik.values.deliveryObs}
                  placeholder="Exemplo: Entrar pela porta lateral"
                  backgroundColor="white"
                  borderRadius={2}
                  focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                ></Input>
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
                <Text>Quantos dias na semana você costuma pedir?</Text>
                <View
                  flex={1}
                  borderWidth={0.5}
                  borderColor={
                    formik.touched.weeklyOrderAmount && formik.errors.weeklyOrderAmount
                      ? 'red'
                      : 'lightgray'
                  }
                  zIndex={101}
                  marginTop={10}
                >
                  <DropDownPicker
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
                    listMode="SCROLLVIEW"
                    dropDownDirection="BOTTOM"
                    dropDownContainerStyle={{ position: 'relative' }}
                    style={{
                      borderWidth: 1,
                      borderColor: 'lightgray',
                      borderRadius: 5,
                      position: 'absolute',
                    }}
                  />
                </View>
                {formik.touched.weeklyOrderAmount && formik.errors.weeklyOrderAmount && (
                  <View height={65} flex={1} justifyContent={'flex-end'}>
                    <Text color="red" fontSize={12}>
                      {formik.errors.weeklyOrderAmount}
                    </Text>
                  </View>
                )}
                <Text marginTop={formik.errors.weeklyOrderAmount ? 10 : 60}>
                  Qual o valor médio de um pedido?
                </Text>
                <TextInputMask
                  placeholder="R$ 0"
                  type="only-numbers"
                  onChangeText={(value) => formik.setFieldValue('orderValue', value)}
                  value={formik.values.orderValue}
                  onBlur={formik.handleBlur('orderValue')}
                  style={{
                    padding: 8,
                    fontSize: 14,
                    height: 50,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    borderWidth: 1,
                    borderColor:
                      formik.touched.orderValue && formik.errors.orderValue ? 'red' : 'lightgray',
                  }}
                  keyboardType="number-pad"
                ></TextInputMask>
                {formik.touched.orderValue && formik.errors.orderValue && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.orderValue}
                  </Text>
                )}
              </View>
              <Text marginTop={10} fontSize={12} marginBottom={5} color="gray">
                Código do promotor
              </Text>
              <View
                backgroundColor="white"
                borderColor="lightgray"
                borderWidth={1}
                borderRadius={5}
                padding={10}
              >
                <Input
                  onChangeText={(text) => {
                    formik.setFieldValue('inviteCode', text.toUpperCase());
                  }}
                  backgroundColor="white"
                  borderRadius={2}
                  focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  maxLength={5}
                  value={formik.values.inviteCode}
                ></Input>
              </View>
            </View>
          ) : (
            <></>
          )}
        </ScrollView>
        <View
          paddingHorizontal={20}
          height={60}
          justifyContent="center"
          gap={15}
          flexDirection="row"
        >
          <Button
            flex={1}
            borderColor="lightgray"
            display={'flex'}
            borderWidth={0.5}
            backgroundColor="white"
            onPress={() => {
              handleBackBtn();
            }}
          >
            <Text>Voltar</Text>
          </Button>
          <Button
            flex={1}
            backgroundColor="#04BF7B"
            onPress={() => {
              handleNextBtn();
            }}
          >
            <Text color="white">{step === 3 ? 'Finalizar Cadastro' : 'Avançar'}</Text>
          </Button>
        </View>
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
