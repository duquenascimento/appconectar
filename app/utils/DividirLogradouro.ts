export function dividirLogradouro(logradouroCompleto: string): object {
  const partesLogradouro: string[] = logradouroCompleto.split(' ')
  const tipoLogradouro: string = partesLogradouro[0] ?? ''
  const nomeLogradouro: string = partesLogradouro.slice(1).join(' ') ?? ''

  return {
    tipoLogradouro: tipoLogradouro.toUpperCase(),
    logradouro: nomeLogradouro.toUpperCase()
  }
}
