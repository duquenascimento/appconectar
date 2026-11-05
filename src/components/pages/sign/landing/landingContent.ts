import Icons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Icons>['name'];

export const LANDING_VIDEO_URL = 'https://documents-app-1.s3.us-east-2.amazonaws.com/institucional/landing_page.mp4';

export const landingColors = {
  green: '#04BF7B',
  greenDark: '#049A63',
  background: '#F0F2F6',
};

export const landingContent = {
  title: 'Os Melhores Distribuidores de Hortifrúti em um Só Lugar para o seu Restaurante',
  description:
    'A Conéctar é o marketplace que reúne dezenas de distribuidores especializados em hortifrúti. Compare cotações em tempo real, economize até 35% no seu CMV e simplifique os pedidos da sua cozinha.',
  loginPrompt: 'Já tem conta?',
  loginAction: 'Entrar',
  ctaButton: 'Criar minha conta',
  benefits: [
    {
      icon: 'storefront-outline' as IconName,
      title: 'Dezenas de Distribuidores',
      text: 'Acesse múltiplos fornecedores de hortifrúti em um único aplicativo.',
    },
    {
      icon: 'calendar-outline' as IconName,
      title: 'Entrega Programada',
      text: 'Janelas de recebimento flexíveis de acordo com a rotina do seu restaurante.',
    },
    {
      icon: 'pricetags-outline' as IconName,
      title: 'Comparação de Preços',
      text: 'Cotações competitivas entre distribuidores para máxima economia no CMV.',
    },
    {
      icon: 'star-outline' as IconName,
      title: 'Atendimento VIP',
      text: 'Prioridade de atendimento por indicação direta de parceiro.',
    },
  ],
  video: {
    title: 'Veja Como Funciona a Conéctar',
    subtitle:
      'Assista ao vídeo explicativo e entenda como otimizar a compra de hortifrúti do seu restaurante.',
  },
  formCard: {
    title: 'Criar conta',
    subtitle: 'Preencha com os seus dados abaixo:',
  },
  referralCodeLabel: 'Código de indicação',
  footer: (year: number) => `© ${year} Conéctar Hortifrúti. Todos os direitos reservados.`,
};
