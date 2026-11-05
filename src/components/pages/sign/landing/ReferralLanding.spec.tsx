import { render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../../tamagui.config';
import { ReferralLanding } from './ReferralLanding';

jest.mock('@/src/components/hooks/useResponsiveness', () => ({
  useResponsiveness: () => ({ isLargeScreen: true }),
}));
jest.mock('@expo/vector-icons/Ionicons', () => ({ __esModule: true, default: () => null }));
jest.mock('../SignUpForm', () => ({ SignUpForm: () => null }));
jest.mock('./VideoSection', () => ({ VideoSection: () => null }));

const renderLanding = (
  promoterLookup?: React.ComponentProps<typeof ReferralLanding>['promoterLookup'],
) =>
  render(
    <TamaguiProvider config={tamaguiConfig}>
      <ReferralLanding
        code="VMF47"
        promoterLookup={promoterLookup}
        positionOptions={[]}
        onRegisterPress={jest.fn()}
        onLoginPress={jest.fn()}
      />
    </TamaguiProvider>,
  );

describe('ReferralLanding — faixa do promotor e chip do código', () => {
  it('não mostra faixa nem chip enquanto a busca carrega', () => {
    const { queryByText } = renderLanding(undefined);

    expect(queryByText(/Você foi indicado por/)).toBeNull();
    expect(queryByText('VMF47')).toBeNull();
  });

  it('mostra faixa e chip quando o promotor foi encontrado', () => {
    const { getByText } = renderLanding({ status: 'found', name: 'Fulano de Tal' });

    expect(getByText(/Fulano de Tal/)).toBeTruthy();
    expect(getByText('VMF47')).toBeTruthy();
  });

  it('não mostra faixa nem chip quando o código não pertence a nenhum promotor', () => {
    const { queryByText, getByText } = renderLanding({ status: 'not_found' });

    expect(queryByText(/Você foi indicado por/)).toBeNull();
    expect(queryByText('VMF47')).toBeNull();
    expect(getByText('Criar conta')).toBeTruthy();
  });

  it('mostra só o chip quando não deu para confirmar o promotor', () => {
    const { queryByText, getByText } = renderLanding({ status: 'unconfirmed' });

    expect(queryByText(/Você foi indicado por/)).toBeNull();
    expect(getByText('VMF47')).toBeTruthy();
  });
});
