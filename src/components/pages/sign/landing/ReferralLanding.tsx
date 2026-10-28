import { useResponsiveness } from '@/src/components/hooks/useResponsiveness';
import CustomButton from '@/src/components/button/customButton';
import { getBrazilDateTime } from '@/src/utils/dateUtils';
import { useRef } from 'react';
import { ScrollView } from 'react-native';
import { Image, TamaguiElement, Text, View, XStack, YStack } from 'tamagui';
import { SignUpForm } from '../SignUpForm';
import { BenefitCard } from './BenefitCard';
import { LANDING_VIDEO_URL, landingColors, landingContent } from './landingContent';
import { PromoterBanner } from './PromoterBanner';
import { ReferralCodeChip } from './ReferralCodeChip';
import { VideoSection } from './VideoSection';

type ScrollableElement = {
  scrollIntoView?: (options?: { behavior?: 'smooth'; block?: 'start' }) => void;
};

const PAGE_MAX_WIDTH = 1200;
const FORM_CARD_WIDTH = 440;

export function ReferralLanding(props: {
  code: string;
  promoterName?: string;
  positionOptions: { label: string; value: string }[];
  onRegisterPress: React.ComponentProps<typeof SignUpForm>['onRegisterPress'];
  onLoginPress: () => void;
}) {
  const { isLargeScreen } = useResponsiveness();
  const formRef = useRef<TamaguiElement>(null);
  const horizontalPadding = isLargeScreen ? 24 : 16;

  const scrollToForm = () => {
    (formRef.current as unknown as ScrollableElement | null)?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const ctaButton = (
    <CustomButton
      title={landingContent.ctaButton}
      onPress={scrollToForm}
      width={isLargeScreen ? '260px' : '100%'}
      height={isLargeScreen ? 44 : 48}
    />
  );

  const promoterBanner = props.promoterName ? (
    <PromoterBanner promoterName={props.promoterName} />
  ) : null;

  const header = (
    <XStack
      width="100%"
      maxWidth={PAGE_MAX_WIDTH}
      alignSelf="center"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={horizontalPadding}
      paddingVertical="$3"
    >
      <Image
        src={require('@assets/images/logo-conectar-positivo.svg')}
        width={isLargeScreen ? 180 : 135}
        height={isLargeScreen ? 60 : 45}
        objectFit="fill"
      />
      <Text fontSize={16} color="$gray10Dark">
        {landingContent.loginPrompt}{' '}
        <Text
          fontSize={16}
          fontWeight="700"
          color={landingColors.greenDark}
          cursor="pointer"
          onPress={props.onLoginPress}
        >
          {landingContent.loginAction}
        </Text>
      </Text>
    </XStack>
  );

  const formCard = (
    <View
      ref={formRef}
      width="100%"
      maxWidth={isLargeScreen ? FORM_CARD_WIDTH : 480}
      alignSelf="center"
      backgroundColor="white"
      borderWidth={1}
      borderColor="lightgray"
      borderRadius={9}
      padding={isLargeScreen ? '$5' : '$4'}
    >
      <Text fontSize="$8">{landingContent.formCard.title}</Text>
      <YStack marginTop="$2" gap="$2">
        <ReferralCodeChip code={props.code} />
        <Text color="$gray10Dark">{landingContent.formCard.subtitle}</Text>
      </YStack>
      <SignUpForm positionOptions={props.positionOptions} onRegisterPress={props.onRegisterPress} />
    </View>
  );

  const title = (
    <Text fontSize={isLargeScreen ? 36 : 26} lineHeight={isLargeScreen ? 44 : 32} fontWeight="700">
      {landingContent.title}
    </Text>
  );

  const description = (
    <Text fontSize={isLargeScreen ? 18 : 16} color="$gray10Dark">
      {landingContent.description}
    </Text>
  );

  const benefitPairs = [landingContent.benefits.slice(0, 2), landingContent.benefits.slice(2)];

  const content = isLargeScreen ? (
    <>
      <XStack
        width="100%"
        maxWidth={PAGE_MAX_WIDTH}
        alignSelf="center"
        alignItems="flex-start"
        gap={48}
        paddingHorizontal={horizontalPadding}
        paddingTop="$4"
      >
        <YStack flex={1} gap="$4">
          {promoterBanner}
          {title}
          {description}
          <YStack gap="$3">
            {benefitPairs.map((pair) => (
              <XStack key={pair[0].title} gap="$3" alignItems="stretch">
                {pair.map((benefit) => (
                  <BenefitCard key={benefit.title} {...benefit} iconPosition="top" />
                ))}
              </XStack>
            ))}
          </YStack>
        </YStack>
        <View width={FORM_CARD_WIDTH}>{formCard}</View>
      </XStack>

      <XStack
        width="100%"
        maxWidth={PAGE_MAX_WIDTH}
        alignSelf="center"
        paddingHorizontal={horizontalPadding}
        paddingTop={64}
      >
        <VideoSection url={LANDING_VIDEO_URL} stacked={false}>
          {ctaButton}
        </VideoSection>
      </XStack>
    </>
  ) : (
    <YStack
      width="100%"
      maxWidth={PAGE_MAX_WIDTH}
      alignSelf="center"
      paddingHorizontal={horizontalPadding}
      paddingTop="$2"
      gap="$4"
    >
      {promoterBanner}
      {title}
      {description}
      {ctaButton}
      <YStack gap="$3">
        {landingContent.benefits.map((benefit) => (
          <XStack key={benefit.title}>
            <BenefitCard {...benefit} iconPosition="left" />
          </XStack>
        ))}
      </YStack>
      {formCard}
      <VideoSection url={LANDING_VIDEO_URL} stacked>
        {ctaButton}
      </VideoSection>
    </YStack>
  );

  return (
    <View flex={1} backgroundColor={landingColors.background}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {header}
        {content}
        <Text
          fontSize={12}
          color="gray"
          textAlign="center"
          paddingVertical="$6"
          paddingHorizontal={horizontalPadding}
        >
          {landingContent.footer(getBrazilDateTime().year)}
        </Text>
      </ScrollView>
    </View>
  );
}
