import { filterLettersAndSpaces, removeZeroWidthChars } from './stringUtils';

describe('stringUtils - filterLettersAndSpaces', () => {
  it('mantém letra e espaço', () => {
    expect(filterLettersAndSpaces('Paulo da Silva')).toBe('Paulo da Silva');
  });

  it('descarta BOM repetido, ao contrário do filtro baseado em \\s', () => {
    expect(filterLettersAndSpaces('﻿﻿﻿Paulo')).toBe('Paulo');
  });

  it('descarta dígito e pontuação', () => {
    expect(filterLettersAndSpaces('Paulo123 !@#')).toBe('Paulo ');
  });
});

describe('stringUtils - removeZeroWidthChars', () => {
  it('remove BOM em qualquer posição', () => {
    expect(removeZeroWidthChars('﻿﻿﻿Paulo')).toBe('Paulo');
  });

  it('remove zero width space, ZWNJ e ZWJ', () => {
    expect(removeZeroWidthChars('Pau​lo‌ ‍Silva')).toBe('Paulo Silva');
  });

  it('não altera texto sem caractere invisível', () => {
    expect(removeZeroWidthChars('Paulo Silva')).toBe('Paulo Silva');
  });
});
