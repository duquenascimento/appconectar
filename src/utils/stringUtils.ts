export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Remove caracteres especiais que não sejam letras ou espaços
export function filterLettersAndSpaces(str: string): string {
  return str.replace(/[^A-Za-z ]/g, '');
}

export function removeZeroWidthChars(str: string): string {
  return str.replace(/[\u200b-\u200d\ufeff]/g, '');
}

export function normalizeText(str: string): string {
  return removeAccents(str).toLowerCase();
}

export function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
