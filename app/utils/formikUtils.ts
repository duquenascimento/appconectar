import { getIn, FormikErrors, FormikTouched } from 'formik'

export function getFieldError<T = any>(name: string, touched: FormikTouched<T>, errors: FormikErrors<T>): string | undefined {
  const isTouched = getIn(touched, name)
  const error = getIn(errors, name)
  return isTouched && error ? error : undefined
}
