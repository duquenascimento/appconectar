import React from 'react';
import { render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import config from '../../../../tamagui.config';
import { InviteCodeField } from './InviteCodeField';

function renderWithTamagui(ui: React.ReactElement) {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      {ui}
    </TamaguiProvider>,
  );
}

describe('InviteCodeField', () => {
  it('não renderiza nada quando não há valor', () => {
    const { toJSON } = renderWithTamagui(<InviteCodeField />);

    expect(toJSON()).toBeNull();
  });

  it('renderiza o código como somente leitura quando há valor', () => {
    const { getByText, getByDisplayValue } = renderWithTamagui(<InviteCodeField value="ABC12" />);

    expect(getByText('Código do promotor')).toBeTruthy();
    const input = getByDisplayValue('ABC12');
    expect(input.props.readOnly).toBe(true);
  });
});
