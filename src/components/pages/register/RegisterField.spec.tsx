import React from 'react';
import { render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import config from '../../../../tamagui.config';
import { RegisterField, RegisterFieldFrame } from './RegisterField';

function renderWithTamagui(ui: React.ReactElement) {
  return render(
    <TamaguiProvider config={config} defaultTheme="light">
      {ui}
    </TamaguiProvider>,
  );
}

describe('RegisterField', () => {
  it('mostra rótulo, asterisco de obrigatório e texto auxiliar', () => {
    const { getByText } = renderWithTamagui(
      <RegisterField label="E-mail" required hint="Para cobranças" />,
    );

    expect(getByText(/^E-mail/)).toBeTruthy();
    expect(getByText('*')).toBeTruthy();
    expect(getByText('Para cobranças')).toBeTruthy();
  });

  it('não mostra asterisco nem texto auxiliar quando não pedidos', () => {
    const { queryByText } = renderWithTamagui(<RegisterField label="Bairro" />);

    expect(queryByText('*')).toBeNull();
  });

  it('repassa o testID e o valor para o campo', () => {
    const { getByTestId } = renderWithTamagui(
      <RegisterField label="CEP" testID="register-input-cep" value="01001-000" />,
    );

    expect(getByTestId('register-input-cep').props.value).toBe('01001-000');
  });

  it('mostra o erro abaixo da caixa, depois do campo', () => {
    const { getByText, getByTestId, toJSON } = renderWithTamagui(
      <RegisterField label="Telefone" testID="telefone" error="Telefone é obrigatório" />,
    );

    expect(getByText('Telefone é obrigatório')).toBeTruthy();
    expect(getByTestId('telefone')).toBeTruthy();
    const json = JSON.stringify(toJSON());
    expect(json.indexOf('telefone')).toBeLessThan(json.indexOf('Telefone é obrigatório'));
  });

  it('pinta a borda de vermelho só quando há erro', () => {
    const comErro = renderWithTamagui(<RegisterField label="A" testID="a" error="Erro" />);
    const semErro = renderWithTamagui(<RegisterField label="B" testID="b" />);

    expect(JSON.stringify(comErro.getByTestId('a').props.style)).toContain('red');
    expect(JSON.stringify(semErro.getByTestId('b').props.style)).not.toContain('red');
  });
});

describe('RegisterFieldFrame', () => {
  it('não mostra mensagem quando o erro é falso', () => {
    const { queryByText } = renderWithTamagui(
      <RegisterFieldFrame label="Cargo" error={false}>
        <></>
      </RegisterFieldFrame>,
    );

    expect(queryByText('Cargo')).toBeTruthy();
    expect(queryByText('false')).toBeNull();
  });
});
