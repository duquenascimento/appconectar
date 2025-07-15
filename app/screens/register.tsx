import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { View, Text, Input, Button, ScrollView, Checkbox } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { DialogInstance } from '../index'
import { TextInputMask } from 'react-native-masked-text'
import { getStorage, getToken, setStorage, deleteToken, clearStorage } from '../utils/utils'
import DropDownPicker from 'react-native-dropdown-picker'
import { formatCNPJ } from '../utils/formatCNPJ'
import { formatCep } from '../utils/formatCep'
import { dividirLogradouro } from '../utils/DividirLogradouro'
import { campoString } from '../utils/formatCampos'
import { VersionInfo } from '../utils/VersionApp'

import { useFormik } from 'formik'
import { step0Validation, step1Validation, step2Validation, step3Validation } from '@/src/validators/register.form.validator'
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'

type RootStackParamList = {
  Home: undefined
  Products: undefined
  Confirm: undefined
  Prices: undefined
  RegisterFinished: undefined
}

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}

interface Empresa {
  inscricao_estadual?: string | null
  inscricao_municipal?: string | null
  inscricoes_estaduais: any | null
  msg: string
  cnpj: string
  identificador_matriz_filial: number
  descricao_matriz_filial: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: number
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string
  motivo_situacao_cadastral: number
  nome_cidade_exterior: string | null
  codigo_natureza_juridica: number
  data_inicio_atividade: string
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  descricao_tipo_de_logradouro: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  uf: string
  codigo_municipio: number
  municipio: string
  ddd_telefone_1: string
  ddd_telefone_2: string | null
  ddd_fax: string | null
  qualificacao_do_responsavel: number
  capital_social: number
  porte: number
  descricao_porte: string
  opcao_pelo_simples: boolean
  data_opcao_pelo_simples: string | null
  data_exclusao_do_simples: string | null
  opcao_pelo_mei: boolean
  situacao_especial: string | null
  data_situacao_especial: string | null
  cnaes_secundarios: CnaeSecundario[]
  qsa: Socio[]
}

interface CnaeSecundario {
  codigo: number
  descricao: string
}

interface CheckCnpj {
  data: Empresa
  status: number
  msg: string
}

interface Socio {
  identificador_de_socio: number
  nome_socio: string
  cnpj_cpf_do_socio: string
  codigo_qualificacao_socio: number
  percentual_capital_social: number
  data_entrada_sociedade: string
  cpf_representante_legal: string | null
  nome_representante_legal: string | null
  codigo_qualificacao_representante_legal: string | null
}

export function Register({ navigation }: HomeScreenProps) {
  const [step, setStep] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [minhours, setMinhours] = useState<string[]>([])
  const [maxhours, setMaxhours] = useState<string[]>([])
  const [erros, setErros] = useState<string[]>([])
  const [registerInvalid, setRegisterInvalid] = useState(false)
  const [isCepValid, setIsCepValid] = useState(true)
  const [minHourOpen, setMinHourOpen] = useState(false)
  const [maxHourOpen, setMaxHourOpen] = useState(false)
  const [paymentWayOpen, setPaymentWayOpen] = useState(false)
  const [daysOpen, setDaysOpen] = useState(false)
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)

    const allClosedDropdowns = () => {
    setMinHourOpen(false);
    setMaxHourOpen(false);
    setDaysOpen(false);
    setScrollEnabled(true);
  };

  const formik = useFormik({
    initialValues: {
      restaurantName: '',
      cnpj: '',
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
      inviteCode: ''
    },
    validationSchema: step === 0 ? step0Validation : step === 1 ? step1Validation : step === 2 ? step2Validation : step3Validation,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoading(true)

        const { noStateNumberId, ...data } = values

        const payload = {
          token: await getToken(),
          ...data,
          zipcode: values.zipcode.replace(/\D/g, ''),
          orderValue: Number(values.orderValue),
          cnpj: values.cnpj.replace(/\D/g, '')
        }
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/full-register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getToken()}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          await clearStorage()
          navigation.replace('RegisterFinished')
        }
      } finally {
        setLoading(false)
      }
    }
  })

  useEffect(() => {
    const hours = []
    for (let hour = 0; hour < 22; hour++) {
      hours.push(`${String(hour).padStart(2, '0')}:00`)
      hours.push(`${String(hour).padStart(2, '0')}:30`)
    }
    hours.push('22:00')
    setMinhours(hours)
  }, [])

  useEffect(() => {
    if (formik.values.minHour) {
      let [hour, minute] = formik.values.minHour.split(':').map(Number)
      hour += 1
      minute += 30
      if (minute >= 60) {
        minute -= 60
        hour += 1
      }

      const maxOptions = []
      while (hour < 24) {
        maxOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
        minute += 30
        if (minute >= 60) {
          minute -= 60
          hour += 1
        }
      }
      setMaxhours(maxOptions)
      if (!formik.values.maxHour || !maxOptions.includes(formik.values.maxHour)) {
        formik.setFieldValue('maxHour', maxOptions[0] || '')
      }
    } else {
      setMaxhours([])
      formik.setFieldValue('maxHour', '')
    }
  }, [formik.values.minHour])

  const cepChange = async (value: string) => {
    try {
      const format = value.replace(/\D/g, '')
      const formatted = formatCep(value)

      formik.setFieldValue('zipcode', formatted)
      formik.setFieldError('zipcode', undefined)

      if (format.length === 8) {
        setLoading(true)
        const response = await fetch(`https://viacep.com.br/ws/${format}/json/`)
        const result = await response.json()

        if (result.erro) {
          formik.setFieldError('zipcode', 'CEP não encontrado')
          setIsCepValid(false)
          return
        }

        if (response.ok && !result.erro) {
          const endereco: any = dividirLogradouro(result.logradouro)

          formik.setValues({
            ...formik.values,
            neigh: result.bairro.toUpperCase(),
            street: endereco.logradouro,
            localNumber: '',
            complement: '',
            localType: endereco.tipoLogradouro,
            city: result.localidade,
            zipcode: formatted
          })

          formik.setFieldTouched('zipcode', true, false)
          formik.setFieldTouched('neigh', true, false)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      formik.setFieldError('zipcode', 'Erro ao validar CEP')
      setIsCepValid(false)
    } finally {
      setLoading(false)
    }
  }

  const getCepBorderStyle = () => ({
    borderColor: isCepValid ? '#049A63' : 'red',
    borderWidth: 1
  })

  const initData = async () => {
    setLoading(true)
    try {
      const fieldsToLoad = ['cnpj', 'stateNumberId', 'cityNumberId', 'restaurantName', 'legalRestaurantName', 'zipcode', 'neigh', 'street', 'localNumber', 'complement', 'alternativePhone', 'email', 'alternativeEmail', 'paymentWay', 'financeResponsibleName', 'financeResponsiblePhoneNumber', 'emailBilling', 'step', 'noStateNumberId', 'minHour', 'maxHour', 'closeDoor', 'deliveryObs', 'weeklyOrderAmount', 'orderValue', 'localType', 'city', 'inviteCode']

      const storedValuesArray = await Promise.all(fieldsToLoad.map((field) => getStorage(field)))

      const loadedValues: any = {}
      fieldsToLoad.forEach((field, index) => {
        const value = storedValuesArray[index]
        if (value !== null) {
          if (field === 'noStateNumberId' || field === 'closeDoor') {
            loadedValues[field] = value === 'true'
          } else if (field === 'step') {
            const stepValue = parseInt(value)
            setStep(isNaN(stepValue) ? 0 : stepValue)
          } else {
            loadedValues[field] = value
          }
        }
      })

      formik.resetForm({
        values: {
          ...formik.initialValues,
          ...loadedValues
        }
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initData()
  }, [])

  const handleNextBtn = async () => {
    setLoading(true)
    allClosedDropdowns()
    try {
       await formik.validateForm()

      let currentStepIsValid = true
      const currentSchema = step === 0 ? step0Validation : step === 1 ? step1Validation : step === 2 ? step2Validation : step3Validation
      try {
        await currentSchema.validate(formik.values, { abortEarly: false })
      } catch (validationErrors: any) {
        currentStepIsValid = false
        formik.setErrors(
          validationErrors.inner.reduce((acc: any, err: any) => {
            acc[err.path] = err.message
            return acc
          }, {})
        )
        validationErrors.inner.forEach((err: any) => {
          formik.setFieldTouched(err.path, true, false)
        })
      }

      if (!currentStepIsValid) {
        setLoading(false)
        return
      }

      if (step === 0) {
        const errosApi: string[] = []
        const cnpjNumerico = formik.values.cnpj.replace(/\D/g, '')
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/checkCnpj`, {
          method: 'POST',
          body: JSON.stringify({ cnpj: cnpjNumerico }),
          headers: { 'Content-type': 'application/json' }
        })
        const result: CheckCnpj = await response.json()
   
        if (response.ok) {
          if (result.data.msg) {
            errosApi.push('Erro ao processar os dados do CNPJ.')
            formik.setFieldError('cnpj', 'Erro ao processar os dados do CNPJ.')
            setErros(errosApi)
            setRegisterInvalid(true)
            setLoading(false)
          return
          }
          const buscaCep = await fetch(`https://viacep.com.br/ws/${result.data.cep}/json/`)
          const enderecoCNPJ = await buscaCep.json()
          if (enderecoCNPJ.erro) {
            formik.setFieldError('zipcode', 'CEP não encontrado')
            setIsCepValid(false)
            return
          }

          const endereco: any = dividirLogradouro(enderecoCNPJ.logradouro)
          formik.setValues({
            ...formik.values,
            legalRestaurantName: result.data.razao_social,
            zipcode: formatCep(result.data.cep),
            neigh: campoString(enderecoCNPJ.bairro),
            street: campoString(endereco.logradouro),
            localNumber: result.data.numero,
            complement: result.data.complemento ?? '',
            localType: endereco.tipoLogradouro,
            city: campoString(enderecoCNPJ.localidade),
            stateNumberId: result.data.inscricao_estadual ?? '',
            cityNumberId: result.data.inscricao_municipal ?? ''
          })
          setStep(1)
        } else {
          if (result.msg === 'already exists') {
            errosApi.push('Este CNPJ já existe na plataforma')
            formik.setFieldError('cnpj', 'CNPJ já cadastrado')
          } else if (result.msg === 'invalid cnpj') {
            errosApi.push('CNPJ inválido')
            formik.setFieldError('cnpj', 'CNPJ inválido informado')
          } else {
            errosApi.push(result.msg || 'Erro ao verificar CNPJ')
          }
          setErros(errosApi)
          setRegisterInvalid(true)
          setLoading(false)
          return
        }
      } else if (step === 1 || step === 2) {
        setStep(step + 1)
      } else if (step === 3) {
        formik.handleSubmit()
        return
      }

      if (step < 3) {
        const nextStep = step + 1
        await saveStepDataToStorage(formik.values, nextStep)
      }
    } catch (error) {
      console.error('Erro em handleNextBtn:', error)
    } finally {
      if (step < 3) {
        setLoading(false)
      }
    }
  }

  const saveStepDataToStorage = async (values: typeof formik.values, currentStep: number) => {
    try {
      const dataToStore: { [key: string]: string } = {}
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          dataToStore[key] = String(value)
        }
      })
      dataToStore['step'] = String(currentStep)

      const storagePromises = Object.entries(dataToStore).map(([key, value]) => setStorage(key, value))
      await Promise.all(storagePromises)
    } catch (error) {
      console.error('Erro ao salvar dados no storage:', error)
    }
  }

  const handleBackBtn = async () => {
    setLoading(true)
    const prevStep = step - 1

    if (prevStep < 0) {
      await clearToken()
      navigation.navigate('Sign' as never)
    } else {
      setStep(prevStep)
      await saveStepDataToStorage(formik.values, prevStep)
    }
    setLoading(false)
  }

  const handleCnpjChange = (text: string) => {
    const formatted = formatCNPJ(text)
    formik.setFieldValue('cnpj', formatted)
  }

  const clearToken = async () => {
    try {
      await deleteToken()
    } catch (error) {
      console.error('Erro ao excluir o token:', error)
    }
  }


  const handleCheckBox = () => {
    const newValue = !formik.values.noStateNumberId
    formik.setFieldValue('noStateNumberId', newValue)
    if (newValue) {
      formik.setFieldValue('stateNumberId', '')
      formik.setFieldTouched('stateNumberId', false, false)
    }
  }
  const handleCheckBoxCloseDoor = () => {
    formik.setFieldValue('closeDoor', !formik.values.closeDoor)
  }

  const daysOptions = [
    { value: '1', label: '1 dia' },
    { value: '2', label: '2 dias' },
    { value: '3', label: '3 dias' },
    { value: '4', label: '4 dias' },
    { value: '5', label: '5 dias' },
    { value: '6', label: '6 dias' },
    { value: '7', label: '7 dias' }
  ]

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#04BF7B" />
      </View>
    )
  }

  return (
       <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
  >
    <View flex={1} backgroundColor="#F0F2F6">
      <DialogInstance openModal={registerInvalid} setRegisterInvalid={setRegisterInvalid} erros={erros} cnpj={formik.values.cnpj} />
      <View mb={10} pt={50} alignItems="center" justifyContent="center">
        <Text fontSize={20}>Cadastro</Text>
        <View pt={20} justifyContent="center" flexDirection="row">
          <View alignItems="center">
            <Icons name="disc"></Icons>
            <Text fontSize={10}>Empresa</Text>
          </View>
          <View mt={5} backgroundColor={step > 1 ? 'black' : 'lightgray'} width={50} height={2}></View>
          <View alignItems="center">
            <Icons color={step > 1 ? 'black' : 'lightgray'} name="disc"></Icons>
            <Text color={step > 1 ? 'black' : 'lightgray'} fontSize={10}>
              Contato
            </Text>
          </View>
          <View mt={5} backgroundColor={step === 3 ? 'black' : 'lightgray'} width={50} height={2}></View>
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
          <View f={1} mt={20} p={20}>
            <Text fontSize={12} mb={5} color="gray">
              Dados do restaurante
            </Text>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
              <Text>Nome na fachada da rua</Text>
              <Input placeholder="Nome do restaurante" onChangeText={(text) => formik.setFieldValue('restaurantName', text)} onBlur={formik.handleBlur('restaurantName')} value={formik.values.restaurantName} backgroundColor="white" borderRadius={2} borderColor={formik.touched.restaurantName && formik.errors.restaurantName ? 'red' : 'lightgray'} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} />
              {formik.touched.restaurantName && formik.errors.restaurantName && (
                <Text color="red" fontSize={12}>
                  {formik.errors.restaurantName}
                </Text>
              )}

              <Text mt={15}>CNPJ</Text>
              <Input placeholder="00.000.000/0001-00" onChangeText={handleCnpjChange} value={formik.values.cnpj} keyboardType="number-pad" backgroundColor="white" borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} onBlur={() => formik.setFieldTouched('cnpj', true)} borderColor={formik.touched.cnpj && formik.errors.cnpj ? 'red' : 'lightgray'} />
              {formik.touched.cnpj && formik.errors.cnpj && (
                <Text color="red" fontSize={12}>
                  {formik.errors.cnpj}
                </Text>
              )}
            </View>
          </View>
        ) : step === 1 ? (
          <View f={1} mt={20} p={20}>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
              <Text>Nome na fachada da rua</Text>
              <Input value={formik.values.restaurantName} disabled opacity={0.5} backgroundColor="white" borderRadius={2} />

              <Text mt={15}>CNPJ</Text>
              <Input value={formik.values.cnpj} disabled opacity={0.5} backgroundColor="white" borderRadius={2} />

              <View opacity={formik.values.noStateNumberId ? 0.5 : 1} marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                <Text>Inscrição estadual</Text>
                <Text fontSize={10} color="gray">
                  Min. 8 digitos
                </Text>
              </View>
              <Input onChangeText={(text) => formik.setFieldValue('stateNumberId', text)} value={formik.values.stateNumberId} disabled={formik.values.noStateNumberId} opacity={formik.values.noStateNumberId ? 0.5 : 1} placeholder={formik.values.noStateNumberId ? 'Isento' : '00000000'} onBlur={() => formik.setFieldTouched('stateNumberId', true)} />
              {formik.touched.stateNumberId && formik.errors.stateNumberId && (
                <Text color="red" fontSize={12}>
                  {formik.errors.stateNumberId}
                </Text>
              )}

              <View mt={15} alignItems="center" flexDirection="row">
                <Checkbox onPress={handleCheckBox}>{formik.values.noStateNumberId ? <Icons name="checkmark" /> : null}</Checkbox>
                <Text paddingLeft={5} fontSize={12}>
                  Sou isento de IE
                </Text>
              </View>

              {formik.values.noStateNumberId && (
                <>
                  <View mt={15} alignItems="center" flexDirection="row" gap={8}>
                    <Text>Inscrição municipal</Text>
                    <Text fontSize={10} color="gray">
                      Min. 8 digitos
                    </Text>
                  </View>
                  <Input placeholder="00000000" onChangeText={(text) => formik.setFieldValue('cityNumberId', text)} value={formik.values.cityNumberId} onBlur={() => formik.setFieldTouched('cityNumberId', true)} />
                  {formik.touched.cityNumberId && formik.errors.cityNumberId && (
                    <Text color="red" fontSize={12}>
                      {formik.errors.cityNumberId}
                    </Text>
                  )}
                </>
              )}

              <Text mt={15}>Razão Social</Text>
              <Input value={formik.values.legalRestaurantName} disabled opacity={0.5} />

              <Text fontSize={12} mt={10} mb={5} color="gray">
                Endereço
              </Text>
              <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
                <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                  <Text>Cep</Text>
                  <Text fontSize={10} color="gray">
                    8 digitos
                  </Text>
                </View>
                <Input placeholder="00000-000" onChangeText={cepChange} value={formik.values.zipcode} backgroundColor="white" borderRadius={2} borderColor={formik.touched.zipcode && formik.errors.zipcode ? 'red' : 'lightgray'} focusStyle={getCepBorderStyle()} hoverStyle={getCepBorderStyle()} onBlur={() => formik.setFieldTouched('zipcode', true)} />
                {formik.touched.zipcode && formik.errors.zipcode && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.zipcode}
                  </Text>
                )}
                <Text mt={15}>Bairro</Text>
                <Input opacity={0.5} onBlur={() => formik.setFieldTouched('neigh', true)} onChangeText={(text) => formik.setFieldValue('neigh', text)} value={formik.values.neigh} keyboardType="number-pad" backgroundColor="white" borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                {formik.touched.neigh && formik.errors.neigh && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.neigh}
                  </Text>
                )}
                <Text mt={15}>Logradouro</Text>
                <Input placeholder="exemplo: Dois Amores" onChangeText={(text) => formik.setFieldValue('street', text)} value={formik.values.street} backgroundColor="white" borderRadius={2} borderColor={formik.touched.street && formik.errors.street ? 'red' : 'lightgray'} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                {formik.touched.street && formik.errors.street && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.street}
                  </Text>
                )}
                <Text mt={15}>Número</Text>
                <Input
                  placeholder="Exemplo: 12"
                  onChangeText={(text) => formik.setFieldValue('localNumber', text)}
                  value={formik.values.localNumber}
                  backgroundColor="white"
                  borderRadius={2}
                  onBlur={() => {
                    formik.setFieldTouched('localNumber', true)
                  }}
                  borderColor={formik.touched.localNumber && formik.errors.localNumber ? 'red' : 'lightgray'}
                  focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                  hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                ></Input>
                {formik.touched.localNumber && formik.errors.localNumber && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.localNumber}
                  </Text>
                )}
                <Text mt={15}>Complemento</Text>
                <Input placeholder="Exemplo: Loja A" onChangeText={(text) => formik.setFieldValue('complement', text)} value={formik.values.complement} backgroundColor="white" borderRadius={2} borderColor={formik.touched.complement && formik.errors.complement ? 'red' : 'lightgray'} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
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
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} padding={10}>
              <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                <Text>E-mail</Text>
                <Text fontSize={10} color="gray">
                  Para comunicados
                </Text>
              </View>
              <Input value={formik.values.email} autoCapitalize="none" onChangeText={(text) => formik.setFieldValue('email', text)} onBlur={() => formik.setFieldTouched('email', true)} backgroundColor="white" borderRadius={2} borderColor={formik.touched.email && formik.errors.email ? 'red' : 'lightgray'} placeholder="exemplo@exemplo.com" />
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
              <Input value={formik.values.alternativeEmail} onChangeText={(text) => formik.setFieldValue('alternativeEmail', text)} onBlur={() => formik.setFieldTouched('alternativeEmail', true)} backgroundColor="white" borderRadius={2} borderColor={formik.touched.alternativeEmail && formik.errors.alternativeEmail ? 'red' : 'lightgray'} placeholder="exemplo@exemplo.com" />
              {formik.touched.alternativeEmail && formik.errors.alternativeEmail && (
                <Text color="red" fontSize={12}>
                  {formik.errors.alternativeEmail}
                </Text>
              )}
            </View>
            <Text mt={10} fontSize={12} mb={5} color="gray">
              Informações financeiras
            </Text>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} padding={10}>
              <View>
                <Text>Qual o formato de pagamento preferido?</Text>
                <View marginTop={10} justifyContent="flex-start" borderWidth={0.5} borderColor={formik.touched.paymentWay && formik.errors.paymentWay ? 'red' : 'lightgray'} zIndex={99}>
                  <DropDownPicker
                    value={formik.values.paymentWay}
                    style={{
                      borderWidth: 1,
                      borderColor: 'lightgray',
                      borderRadius: 2,
                      flex: 1,
                      position: 'absolute'
                    }}
                    setValue={(callback) => {
                      const value = typeof callback === 'function' ? callback(formik.values.paymentWay) : callback
                      formik.setFieldValue('paymentWay', value)
                    }}
                    onSelectItem={(item) => {
                      if (item.value) {
                        formik.setFieldError('paymentWay', undefined)
                      }
                    }}
                    listMode="SCROLLVIEW"
                    dropDownDirection="BOTTOM"
                    dropDownContainerStyle={{
                      position: 'relative'
                    }}
                    items={[
                      { label: 'Diário: 7 dias após a entrega', value: 'DI07' },
                      { label: 'Semanal: vencimento na quarta', value: 'UQ10' },
                      { label: 'Semanal: vencimento na sexta', value: 'UX12' }
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
                <View mt={formik.errors.paymentWay ? 10 : 60} borderColor="lightgray" borderWidth={0.5} p={5} gap={5} flexDirection="row">
                  <Icons size={25} color="gray" name="information-circle"></Icons>
                  <View justifyContent="center">
                    <Text maxWidth="100%" color="gray" fontSize={10}>
                      Prazos são sujeitos a avaliação de crédito
                    </Text>
                  </View>
                </View>
              </View>
              <View flex={1}>
                <Text marginTop={15}>
                  Nome responsável financeiro
                  <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                </Text>
                <View flex={1} borderWidth={0.5} borderColor={formik.touched.financeResponsibleName && formik.errors.financeResponsibleName ? 'red' : 'lightgray'} zIndex={101}>
                  <Input
                    fontSize={14}
                    f={1}
                    backgroundColor="$colorTransparent"
                    borderWidth="$0"
                    borderRadius={2}
                    onBlur={formik.handleBlur('financeResponsibleName')}
                    borderColor={formik.touched.financeResponsibleName && formik.errors.financeResponsibleName ? 'red' : 'lightgray'}
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    value={formik.values.financeResponsibleName}
                    onChangeText={(value) => {
                      const formattedValue = value.replace(/[^A-Za-z\s]/g, '')
                      formik.setFieldValue('financeResponsibleName', formattedValue)
                    }}
                  />
                </View>
                {formik.touched.financeResponsibleName && formik.errors.financeResponsibleName && (
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
                <View flex={1} borderWidth={0.5} borderColor={formik.touched.financeResponsiblePhoneNumber && formik.errors.financeResponsiblePhoneNumber ? 'red' : 'lightgray'} zIndex={101}>
                  <Input
                    maxLength={15}
                    fontSize={14}
                    f={1}
                    backgroundColor="$colorTransparent"
                    borderWidth="$0"
                    borderRadius={2}
                    borderColor={formik.touched.financeResponsiblePhoneNumber && formik.errors.financeResponsiblePhoneNumber ? 'red' : 'lightgray'}
                    onBlur={formik.handleBlur('financeResponsiblePhoneNumber')}
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    keyboardType="phone-pad"
                    value={formik.values.financeResponsiblePhoneNumber}
                    onChangeText={(value) => {
                      let onlyNums = value.replace(/\D/g, '')

                      if (onlyNums.length > 10) {
                        onlyNums = onlyNums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
                      } else if (onlyNums.length > 6) {
                        onlyNums = onlyNums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
                      } else if (onlyNums.length > 2) {
                        onlyNums = onlyNums.replace(/(\d{2})(\d{0,4})/, '($1) $2')
                      } else if (onlyNums.length > 0) {
                        onlyNums = onlyNums.replace(/(\d{0,2})/, '($1')
                      }

                      formik.setFieldValue('financeResponsiblePhoneNumber', onlyNums)
                    }}
                  />
                </View>
                {formik.touched.financeResponsiblePhoneNumber && formik.errors.financeResponsiblePhoneNumber && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.financeResponsiblePhoneNumber}
                  </Text>
                )}
              </View>
              <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                <Text>E-mail
                  <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                </Text>
                <Text fontSize={10} color="gray">
                  Para cobranças
                </Text>
              </View>
              <Input value={formik.values.emailBilling} autoCapitalize="none" onChangeText={(text) => formik.setFieldValue('emailBilling', text)} onBlur={() => formik.setFieldTouched('emailBilling', true)} backgroundColor="white" borderRadius={2} borderColor={formik.touched.emailBilling && formik.errors.emailBilling ? 'red' : 'lightgray'} placeholder="exemplo@exemplo.com" />
              {formik.touched.emailBilling && formik.errors.emailBilling && (
                <Text color="red" fontSize={12}>
                  {formik.errors.emailBilling}
                </Text>
              )}
            </View>
          </View>
        ) : step === 3 ? (
          <View f={1} p={20} gap={10}>
            <Text fontSize={12} mb={5} color="gray">
              Entrega
            </Text>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
              <View borderColor="lightgray" borderWidth={0.5} p={5} gap={5} flexDirection="row">
                <Icons size={25} color="gray" name="information-circle"></Icons>
                <View justifyContent="center">
                  <Text maxWidth="99%" color="gray" fontSize={10}>
                    Você deve definir pelo menos 1 hora e 30 minutos de diferença entre o horário mais cedo e o horário mais tarde para sua entrega.
                  </Text>
                </View>
              </View>
              <View flexDirection="row" gap={20}>
                <View flex={1}>
                  <Text marginTop={15}>Quero receber de</Text>
                  <View flex={1} borderWidth={0.5} borderColor={formik.touched.minHour && formik.errors.minHour ? 'red' : 'lightgray'} zIndex={101}>
                    <DropDownPicker
                      value={formik.values.minHour}
                      style={{
                        borderWidth: 1,
                        borderColor: 'lightgray',
                        borderRadius: 5,
                        zIndex: 1000,
                        position: 'absolute'
                      }}
                      listMode="SCROLLVIEW"
                      dropDownDirection="BOTTOM"
                      dropDownContainerStyle={{
                        position: 'relative'
                      }}
                      setValue={(callback) => {
                        const value = typeof callback === 'function' ? callback(formik.values.minHour) : callback
                        formik.setFieldValue('minHour', value)
                      }}
                      onSelectItem={(item) => {
                        if (item.value) {
                          formik.setFieldError('minHour', undefined)
                        }
                      }}
                      items={minhours.map((item) => {
                        return { label: item, value: item }
                      })}
                      multiple={false}
                      open={minHourOpen}
                      setOpen={setMinHourOpen}
                      onOpen={() => {
                        setScrollEnabled(false)
                        formik.setFieldError('minHour', undefined)
                      }}
                      onClose={() => {
                        setScrollEnabled(true)
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
                  <View flex={1} borderWidth={0.5} borderColor={formik.touched.maxHour && formik.errors.maxHour ? 'red' : 'lightgray'} zIndex={100}>
                    <DropDownPicker
                      value={formik.values.maxHour}
                      style={{
                        borderWidth: 1,
                        borderColor: 'lightgray',
                        borderRadius: 5,
                        zIndex: 1000,
                        position: 'absolute'
                      }}
                      listMode="SCROLLVIEW"
                      dropDownDirection="BOTTOM"
                      dropDownContainerStyle={{
                        position: 'relative'
                      }}
                      setValue={(callback) => {
                        const value = typeof callback === 'function' ? callback(formik.values.maxHour) : callback
                        formik.setFieldValue('maxHour', value)
                      }}
                      onSelectItem={(item) => {
                        if (item.value) {
                          formik.setFieldError('maxHour', undefined)
                        }
                      }}
                      items={maxhours.map((item) => {
                        return { label: item, value: item }
                      })}
                      multiple={false}
                      open={maxHourOpen}
                      setOpen={setMaxHourOpen}
                      onOpen={() => {
                        setScrollEnabled(false)
                        formik.setFieldError('maxHour', undefined)
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
              <View mt={formik.errors.maxHour || formik.errors.minHour ? 10 : 65} alignItems="center" flexDirection="row">
                <Checkbox onPress={handleCheckBoxCloseDoor} checked={formik.values.closeDoor}>
                  {formik.values.closeDoor ? <Icons name="checkmark"></Icons> : <></>}
                </Checkbox>
                <Text paddingLeft={5} fontSize={12}>
                  Aceito receber de portas fechadas
                </Text>
              </View>
              <Text mt={15}>Informações adicionais</Text>
              <Input
                onChangeText={(text) => {
                  formik.setFieldValue('deliveryObs', text)
                }}
                value={formik.values.deliveryObs}
                placeholder="Exemplo: Entrar pela porta lateral"
                backgroundColor="white"
                borderRadius={2}
                focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
              ></Input>
            </View>
            <Text mt={10} fontSize={12} mb={5} color="gray">
              Perfil de compra
            </Text>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
              <Text>Quantos dias na semana você costuma pedir?</Text>
              <View flex={1} borderWidth={0.5} borderColor={formik.touched.weeklyOrderAmount && formik.errors.weeklyOrderAmount ? 'red' : 'lightgray'} zIndex={101} marginTop={10}>
                <DropDownPicker
                  value={formik.values.weeklyOrderAmount}
                  setValue={(callback) => {
                    const value = typeof callback === 'function' ? callback(formik.values.weeklyOrderAmount) : callback
                    formik.setFieldValue('weeklyOrderAmount', value)
                  }}
                  items={daysOptions}
                  open={daysOpen}
                  setOpen={setDaysOpen}
                  onOpen={() => {
                    setScrollEnabled(false)
                    formik.setFieldError('weeklyOrderAmount', undefined)
                  }}
                  onClose={() => {
                    setScrollEnabled(true)
                  }}
                  onSelectItem={(item) => {
                    if (item.value) {
                      formik.setFieldError('weeklyOrderAmount', undefined)
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
                    position: 'absolute'
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
              <Text mt={formik.errors.weeklyOrderAmount ? 10 : 60}>Qual o valor médio de um pedido?</Text>
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
                  borderColor: formik.touched.orderValue && formik.errors.orderValue ? 'red' : 'lightgray'
                }}
                keyboardType="number-pad"
              ></TextInputMask>
              {formik.touched.orderValue && formik.errors.orderValue && (
                <Text color="red" fontSize={12}>
                  {formik.errors.orderValue}
                </Text>
              )}
            </View>
            <Text mt={10} fontSize={12} mb={5} color="gray">
              Código do promotor
            </Text>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
              <Input
                onChangeText={(text) => {
                  formik.setFieldValue('inviteCode', text.toUpperCase())
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
      <View paddingHorizontal={20} height={60} justifyContent="center" gap={15} flexDirection="row">
        <Button
          f={1}
          borderColor="lightgray"
          display={'flex'}
          borderWidth={0.5}
          backgroundColor="white"
          onPress={() => {
            handleBackBtn()
          }}
        >
          <Text>Voltar</Text>
        </Button>
        <Button
          f={1}
          backgroundColor="#04BF7B"
          onPress={() => {
            handleNextBtn()
          }}
        >
          <Text color="white">{step === 3 ? 'Finalizar Cadastro' : 'Avançar'}</Text>
        </Button>
      </View>
      <VersionInfo />
    </View>
  </KeyboardAvoidingView>
  )
}
