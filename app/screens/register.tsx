import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { View, Text, Input, Button, ScrollView, Checkbox } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'
import { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { DialogInstance } from '../index'
import { TextInputMask } from 'react-native-masked-text'
import { deleteStorage, getStorage, getToken, setStorage, deleteToken, clearStorage } from '../utils/utils'
import DropDownPicker from 'react-native-dropdown-picker'
import { formatCNPJ } from '../utils/formatCNPJ'
import { formatCep } from '../utils/formatCep'
import { encontrarInscricaoRJ } from '../utils/encontrarInscricaoEstadual'
import { dividirLogradouro } from '../utils/DividirLogradouro'
import { campoString } from '../utils/formatCampos'
import { VersionInfo } from '../utils/VersionApp'

import { useFormik } from 'formik'
import { step0Validation, step1Validation, step2Validation, step3Validation } from '@/src/validators/register.form.validator'
import { red } from 'react-native-reanimated/lib/typescript/reanimated2/Colors'

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
  const [emailValid, setEmailValid] = useState(false)
  const [emailAlternativeValid, setEmailAlternativeValid] = useState(false)
  const [isCepValid, setIsCepValid] = useState(true) // Nova variável de estado
  const [minHourOpen, setMinHourOpen] = useState(false)
  const [maxHourOpen, setMaxHourOpen] = useState(false)
  const [paymentWayOpen, setPaymentWayOpen] = useState(false)
  const [daysOpen, setDaysOpen] = useState(false)
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true)

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
      phone: '',
      alternativePhone: '',
      email: '',
      alternativeEmail: '',
      minHour: '',
      maxHour: '',
      closeDoor: false,
      deliveryObs: '',
      responsibleReceivingName: '',
      responsibleReceivingPhoneNumber: '',
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

  const isStepValid = () => {
    const requiredFieldsByStep: { [key: number]: string[] } = {
      0: ['restaurantName', 'cnpj'],
      1: ['zipcode', 'street', 'localNumber', 'legalRestaurantName', ...(formik.values.noStateNumberId ? ['cityNumberId'] : ['stateNumberId'])],
      2: ['phone', 'email'],
      3: ['minHour', 'maxHour', 'responsibleReceivingName', 'responsibleReceivingPhoneNumber', 'weeklyOrderAmount', 'orderValue', 'paymentWay']
    }

    const requiredFields = requiredFieldsByStep[step] || []

    return requiredFields.every((field) => {
      const value = formik.values[field as keyof typeof formik.values]
      const error = formik.errors[field as keyof typeof formik.errors]

      // Considera válido se o valor existir (não vazio) e não houver erro
      return value !== '' && error === undefined
    })
  }

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
      // Define o primeiro valor como padrão se maxHour estiver vazio ou inválido
      if (!formik.values.maxHour || !maxOptions.includes(formik.values.maxHour)) {
        formik.setFieldValue('maxHour', maxOptions[0] || '')
      }
    } else {
      setMaxhours([])
      formik.setFieldValue('maxHour', '') // Limpa maxHour se minHour for limpo
    }
  }, [formik.values.minHour])

  const cepChange = async (value: string) => {
    try {
      const format = value.replace(/\D/g, '')
      const formatted = formatCep(value)

      // Atualiza o valor formatado no Formik
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

          // Atualiza todos os campos de endereço no Formik
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

  // Função para aplicar o estilo da borda
  const getCepBorderStyle = () => ({
    borderColor: isCepValid ? '#049A63' : 'red',
    borderWidth: 1
  })

  const initData = async () => {
    setLoading(true) // Mantém o loading
    try {
      const fieldsToLoad = ['cnpj', 'stateNumberId', 'cityNumberId', 'restaurantName', 'legalRestaurantName', 'zipcode', 'neigh', 'street', 'localNumber', 'complement', 'phone', 'alternativePhone', 'email', 'alternativeEmail', 'step', 'noStateNumberId', 'minHour', 'maxHour', 'closeDoor', 'deliveryObs', 'responsibleReceivingName', 'responsibleReceivingPhoneNumber', 'weeklyOrderAmount', 'paymentWay', 'orderValue', 'localType', 'city', 'inviteCode']

      const storedValuesArray = await Promise.all(fieldsToLoad.map((field) => getStorage(field)))

      const loadedValues: any = {}
      fieldsToLoad.forEach((field, index) => {
        const value = storedValuesArray[index]
        if (value !== null) {
          // Tratamento especial para booleanos e números vindos do storage como string
          if (field === 'noStateNumberId' || field === 'closeDoor') {
            loadedValues[field] = value === 'true'
          } else if (field === 'step') {
            const stepValue = parseInt(value)
            setStep(isNaN(stepValue) ? 0 : stepValue) // Atualiza o state 'step' separadamente
          } else {
            loadedValues[field] = value
          }
        }
      })

      // Define os valores carregados no Formik, mesclando com os default se algo não foi carregado
      formik.resetForm({
        values: {
          ...formik.initialValues, // Começa com os padrões
          ...loadedValues // Sobrescreve com os carregados
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
    try {
      const errors = await formik.validateForm()

      let currentStepIsValid = true
      const currentSchema = step === 0 ? step0Validation : step === 1 ? step1Validation : step === 2 ? step2Validation : step3Validation // Obtenha o schema correto
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
        const cnpjNumerico = formik.values.cnpj.replace(/\D/g, '')
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/checkCnpj`, {
          method: 'POST',
          body: JSON.stringify({ cnpj: cnpjNumerico }),
          headers: { 'Content-type': 'application/json' }
        })
        const result: CheckCnpj = await response.json()

        if (response.ok) {
          const buscaCep = await fetch(`https://viacep.com.br/ws/${result.data.cep}/json/`)
          const enderecoCNPJ = await buscaCep.json()
          if (enderecoCNPJ.erro) {
            formik.setFieldError('zipcode', 'CEP não encontrado')
            setIsCepValid(false)
            return
          }

          const endereco: any = dividirLogradouro(enderecoCNPJ.logradouro)
          const IE = encontrarInscricaoRJ(result.data.inscricoes_estaduais)
          formik.setValues({
            ...formik.values,
            legalRestaurantName: result.data.razao_social,
            zipcode: formatCep(result.data.cep),
            neigh: campoString(enderecoCNPJ.bairro),
            street: campoString(endereco.logradouro),
            localNumber: result.data.numero,
            complement: result.data.complemento ?? '',
            localType: endereco.tipoLogradouro,
            city: campoString(enderecoCNPJ.localidade)
            //stateNumberId: IE ?? "",
            //noStateNumberId: !IE,
          })
          setStep(1)
        } else {
          const errosApi: string[] = []
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

  // Função auxiliar para salvar no storage
  const saveStepDataToStorage = async (values: typeof formik.values, currentStep: number) => {
    try {
      const dataToStore: { [key: string]: string } = {}
      // Mapeia os valores do formik para o formato string do storage
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Evita armazenar null/undefined
          dataToStore[key] = String(value) // Converte tudo para string
        }
      })
      dataToStore['step'] = String(currentStep) // Salva a etapa atual

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
      await clearToken() // Sua lógica clearToken [source 99]
      // Navegar para tela anterior, ex: navigation.goBack() ou navigation.navigate("Sign");
      navigation.navigate('Sign' as never) // Ajuste o nome da rota se necessário
    } else {
      setStep(prevStep)
      // Salvar estado atual no storage ao voltar (opcional, mas mantém consistência com o avançar)
      await saveStepDataToStorage(formik.values, prevStep)
    }
    setLoading(false)
  }

  const handleCnpjChange = (text: string) => {
    //setCnpj(formatCNPJ(text));
    const formatted = formatCNPJ(text)
    formik.setFieldValue('cnpj', formatted)
  }

  const clearToken = async () => {
    try {
      await deleteToken() // Exclui o token do armazenamento local
    } catch (error) {
      console.error('Erro ao excluir o token:', error)
    }
  }

  const handleEmailChange = (text: string) => {
    // Remover caracteres indesejados e garantir o formato de e-mail
    const formattedText = text
      .replace(/[^a-zA-Z0-9@._-]/g, '') // Remove caracteres não permitidos
      .toLowerCase() // Converte para minúsculas

    setEmailValid(testEmail(formattedText))
  }

  const testEmail = (text: string) => {
    const test = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Remove as aspas ao redor da expressão regular
    return test.test(text)
  }

  const validateInput = (value: string) => value.length >= 8

  const getBorderStyle = (value: string) => ({
    borderColor: validateInput(value) ? '#049A63' : 'red',
    borderWidth: 1
  })

  // Função para validar e formatar e-mail alternativo
  const handleAlternativeEmailChange = (text: string) => {
    const formattedText = text.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase()

    setEmailAlternativeValid(testEmail(formattedText))
  }

  const handlePhoneChange = (text: string) => {
    formik.setFieldValue('phone', text)
  }

  const handleAlternativePhoneChange = (text: string) => {
    formik.setFieldValue('alternativePhone', text)
  }

  const handleCheckBox = () => {
    const newValue = !formik.values.noStateNumberId
    formik.setFieldValue('noStateNumberId', newValue)
    if (newValue) {
      formik.setFieldValue('stateNumberId', '') // Lógica adicional ok
      formik.setFieldTouched('stateNumberId', false, false) // Reseta o touched também
    }
  }
  // Handler para closeDoor
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
              <Input onChangeText={(text) => formik.setFieldValue('restaurantName', text)} onBlur={formik.handleBlur('restaurantName')} value={formik.values.restaurantName} backgroundColor="white" borderRadius={2} borderColor={formik.touched.restaurantName && formik.errors.restaurantName ? 'red' : 'lightgray'} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} />
              {formik.touched.restaurantName && formik.errors.restaurantName && (
                <Text color="red" fontSize={12}>
                  {formik.errors.restaurantName}
                </Text>
              )}

              <Text mt={15}>CNPJ</Text>
              <Input onChangeText={handleCnpjChange} value={formik.values.cnpj} keyboardType="number-pad" backgroundColor="white" borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }} onBlur={() => formik.setFieldTouched('cnpj', true)} borderColor={formik.touched.cnpj && formik.errors.cnpj ? 'red' : 'lightgray'} />
              {formik.touched.cnpj && formik.errors.cnpj && (
                <Text color="red" fontSize={12}>
                  {formik.errors.cnpj}
                </Text>
              )}
            </View>
          </View>
        ) : step === 1 ? (
          <View f={1} mt={20} p={20}>
            {/* ... cabeçalho igual ... */}
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
              <Input onChangeText={(text) => formik.setFieldValue('stateNumberId', text)} value={formik.values.stateNumberId} disabled={formik.values.noStateNumberId} opacity={formik.values.noStateNumberId ? 0.5 : 1} placeholder={formik.values.noStateNumberId ? 'Isento' : ''} onBlur={() => formik.setFieldTouched('stateNumberId', true)} />
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
                  <Input onChangeText={(text) => formik.setFieldValue('cityNumberId', text)} value={formik.values.cityNumberId} onBlur={() => formik.setFieldTouched('cityNumberId', true)} />
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
                <Input onChangeText={cepChange} value={formik.values.zipcode} backgroundColor="white" borderRadius={2} borderColor={formik.touched.zipcode && formik.errors.zipcode ? 'red' : 'lightgray'} focusStyle={getCepBorderStyle()} hoverStyle={getCepBorderStyle()} onBlur={() => formik.setFieldTouched('zipcode', true)} />
                {formik.touched.zipcode && formik.errors.zipcode && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.zipcode}
                  </Text>
                )}
                <Text mt={15}>Bairro</Text>
                <Input disabled opacity={0.5} onChangeText={(text) => formik.setFieldValue('neigh', text)} value={formik.values.neigh} keyboardType="number-pad" backgroundColor="white" borderRadius={2} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                <Text mt={15}>Logradouro</Text>
                <Input onChangeText={(text) => formik.setFieldValue('street', text)} value={formik.values.street} backgroundColor="white" borderRadius={2} borderColor={formik.touched.street && formik.errors.street ? 'red' : 'lightgray'} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
                {formik.touched.street && formik.errors.street && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.street}
                  </Text>
                )}
                <Text mt={15}>Número</Text>
                <Input
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
                <Input onChangeText={(text) => formik.setFieldValue('complement', text)} value={formik.values.complement} backgroundColor="white" borderRadius={2} borderColor={formik.touched.complement && formik.errors.complement ? 'red' : 'lightgray'} focusStyle={{ borderColor: '#049A63', borderWidth: 1 }} hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}></Input>
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
              {/* Telefone Principal */}
              <View alignItems="center" flexDirection="row" gap={8}>
                <Text>Telefone</Text>
                <Text fontSize={10} color="gray">
                  Para comunicados sobre os pedidos
                </Text>
              </View>
              <TextInputMask
                type={'cel-phone'}
                value={formik.values.phone}
                onChangeText={handlePhoneChange}
                onBlur={() => formik.setFieldTouched('phone', true)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  borderWidth: 1,
                  borderColor: formik.touched.phone && formik.errors.phone ? 'red' : 'lightgray',
                  padding: 10
                }}
                placeholder="(00) 00000-0000"
              />
              {formik.touched.phone && formik.errors.phone && (
                <Text color="red" fontSize={12}>
                  {formik.errors.phone}
                </Text>
              )}

              {/* Telefone Alternativo */}
              <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                <Text>Telefone alternativo</Text>
                <Text fontSize={10} color="gray">
                  Opcional
                </Text>
              </View>
              <TextInputMask
                type={'cel-phone'}
                value={formik.values.alternativePhone}
                onChangeText={handleAlternativePhoneChange}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  borderWidth: 1,
                  borderColor: 'lightgray',
                  padding: 10
                }}
                placeholder="(00) 00000-0000"
              />

              {/* E-mail Principal */}
              <View marginTop={15} alignItems="center" flexDirection="row" gap={8}>
                <Text>E-mail</Text>
                <Text fontSize={10} color="gray">
                  Para comunicados
                </Text>
              </View>
              <Input value={formik.values.email} onChangeText={(text) => formik.setFieldValue('email', text)} onBlur={() => formik.setFieldTouched('email', true)} backgroundColor="white" borderRadius={2} borderColor={formik.touched.email && formik.errors.email ? 'red' : 'lightgray'} placeholder="exemplo@exemplo.com" />
              {formik.touched.email && formik.errors.email && (
                <Text color="red" fontSize={12}>
                  {formik.errors.email}
                </Text>
              )}

              {/* E-mail Alternativo */}
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
              <Text mt={15}>Obs de entrega</Text>
              <Input
                onChangeText={(text) => {
                  formik.setFieldValue('deliveryObs', text)
                }}
                value={formik.values.deliveryObs}
                backgroundColor="white"
                borderRadius={2}
                focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
              ></Input>
              <View flex={1}>
                <Text marginTop={15}>
                  Responsável pelo recebimento
                  <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                </Text>
                <View flex={1} borderWidth={0.5} borderColor={formik.touched.responsibleReceivingName && formik.errors.responsibleReceivingName ? 'red' : 'lightgray'} zIndex={101}>
                  <Input
                    fontSize={14}
                    f={1}
                    backgroundColor="$colorTransparent"
                    borderWidth="$0"
                    borderRadius={2}
                    onBlur={formik.handleBlur('responsibleReceivingName')}
                    borderColor={formik.touched.responsibleReceivingName && formik.errors.responsibleReceivingName ? 'red' : 'lightgray'}
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    value={formik.values.responsibleReceivingName}
                    onChangeText={(value) => {
                      const formattedValue = value.replace(/[^A-Za-z\s]/g, '')
                      formik.setFieldValue('responsibleReceivingName', formattedValue)
                    }}
                  />
                </View>
                {formik.touched.responsibleReceivingName && formik.errors.responsibleReceivingName && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.responsibleReceivingName}
                  </Text>
                )}
              </View>
              <View flex={1}>
                <Text marginTop={15}>
                  Número de contato do responsável
                  <Text style={{ color: 'red', marginLeft: 3 }}>*</Text>
                </Text>
                <View flex={1} borderWidth={0.5} borderColor={formik.touched.responsibleReceivingPhoneNumber && formik.errors.responsibleReceivingPhoneNumber ? 'red' : 'lightgray'} zIndex={101}>
                  <Input
                    maxLength={15}
                    fontSize={14}
                    f={1}
                    backgroundColor="$colorTransparent"
                    borderWidth="$0"
                    borderRadius={2}
                    borderColor={formik.touched.responsibleReceivingPhoneNumber && formik.errors.responsibleReceivingPhoneNumber ? 'red' : 'lightgray'}
                    onBlur={formik.handleBlur('responsibleReceivingPhoneNumber')}
                    focusStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    hoverStyle={{ borderColor: '#049A63', borderWidth: 1 }}
                    keyboardType="phone-pad"
                    value={formik.values.responsibleReceivingPhoneNumber}
                    onChangeText={(value) => {
                      // Remove todos os caracteres que não sejam dígitos
                      let onlyNums = value.replace(/\D/g, '')

                      if (onlyNums.length > 10) {
                        // Formato moderno (celular): (XX) XXXXX-XXXX
                        onlyNums = onlyNums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
                      } else if (onlyNums.length > 6) {
                        // Formato convencional (fixo): (XX) XXXX-XXXX
                        onlyNums = onlyNums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
                      } else if (onlyNums.length > 2) {
                        // Formato parcial: (XX) XXXX
                        onlyNums = onlyNums.replace(/(\d{2})(\d{0,4})/, '($1) $2')
                      } else if (onlyNums.length > 0) {
                        // Formato parcial: (XX
                        onlyNums = onlyNums.replace(/(\d{0,2})/, '($1')
                      }

                      formik.setFieldValue('responsibleReceivingPhoneNumber', onlyNums)
                    }}
                  />
                </View>
                {formik.touched.responsibleReceivingPhoneNumber && formik.errors.responsibleReceivingPhoneNumber && (
                  <Text color="red" fontSize={12}>
                    {formik.errors.responsibleReceivingPhoneNumber}
                  </Text>
                )}
              </View>
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
              Formato de pagamento
            </Text>
            <View backgroundColor="white" borderColor="lightgray" borderWidth={1} borderRadius={5} p={10}>
              <Text>Qual o formato de pagamento preferido?</Text>
              <View marginTop={10} justifyContent="flex-start" borderWidth={0.5} borderColor={formik.touched.paymentWay && formik.errors.paymentWay ? 'red' : 'lightgray'} zIndex={99}>
                <DropDownPicker
                  value={formik.values.paymentWay}
                  style={{
                    borderWidth: 1,
                    borderColor: 'lightgray',
                    borderRadius: 5,
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
                    { label: 'Semanal: vencimento na quarta', value: 'UQ10' }
                  ]}
                  multiple={false}
                  open={paymentWayOpen}
                  setOpen={setPaymentWayOpen}
                  onOpen={() => {
                    setScrollEnabled(false)
                    formik.setFieldError('paymentWay', undefined)
                  }}
                  onClose={() => setScrollEnabled(true)}
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
          //disabled={formik.isSubmitting}
          //opacity={formik.isSubmitting ? 0.5 : 1}
          //disabled={!isStepValid() || formik.isSubmitting}
          //opacity={!isStepValid() || formik.isSubmitting ? 0.4 : 1}
          f={1}
          backgroundColor="#04BF7B"
          onPress={() => {
            handleNextBtn() // Chama o handler refatorado
          }}
        >
          <Text color="white">{step === 3 ? 'Finalizar Cadastro' : 'Avançar'}</Text>
        </Button>
      </View>
      <VersionInfo />
    </View>
  )
}
