export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Espa\u00e7o literal, n\u00e3o `\s`: a classe `\s` do JavaScript inclui U+FEFF (BOM),
// ent\u00e3o filtrar com ela deixa o BOM passar disfar\u00e7ado de espa\u00e7o.
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
