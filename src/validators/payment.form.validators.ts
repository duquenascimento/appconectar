import * as Yup from 'yup';

export const creditCardCreationValidator = Yup.object().shape({
  number: Yup.string().min(15, 'Muito curto').max(19, 'Muito longo').required('Obrigatório'),
  expiry: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Formato inválido (MM/AA)')
    .required('Obrigatório'),
  cvv: Yup.string().min(3, 'Mínimo 3 dígitos').required('Obrigatório'),
  holderName: Yup.string().required('Obrigatório'),
  holderDoc: Yup.string().min(11).max(14).required('Obrigatório'),
  nickname: Yup.string().required('Obrigatório'),
});