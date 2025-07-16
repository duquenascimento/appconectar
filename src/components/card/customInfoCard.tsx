import React from 'react'
import { styled, Text, XStack, YStack } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'

type IoniconName =
  | 'information-circle'
  | 'information-circle-outline'
  | 'help-circle-outline'
  | 'alert-circle'
  | 'warning'
  | 'alert'
interface InfoCardProps {
  icon?: IoniconName
  title?: string
  description?: string
}

const CardContainer = styled(YStack, {
  name: 'CardContainer',
  bg: 'white',
  borderColor: 'gray',
  borderWidth: 0.5,
  padding: '$2',
  paddingTop: '$1',
  alignSelf: 'flex-start',
  width: '100%',
})

const HeaderRow = styled(XStack, {
  name: 'HeaderRow',
  alignItems: 'center',
  space: '$1',
})

const TitleText = styled(Text, {
  name: 'TitleText',
  fontSize: 12,
  fontWeight: 'bold',
  color: 'gray',
  flexShrink: 1,
})

const DescriptionText = styled(Text, {
  name: 'DescriptionText',
  fontSize: 12,
  color: 'gray',
  marginTop: '$1',
})

const CustomInfoCard: React.FC<InfoCardProps> = ({
  icon = 'information-circle',
  title = '',
  description = '',
}) => {
  const showTitle = !!title
  const showDescription = !!description

  return (
    <CardContainer>
      {(showTitle || !showTitle) && (
        <HeaderRow>
          <Icons name={icon} size={20} color="gray" />
          {showTitle ? (
            <TitleText>{title}</TitleText>
          ) : showDescription ? (
            <DescriptionText style={{ marginTop: 0 }}>{description}</DescriptionText>
          ) : null}
        </HeaderRow>
      )}
      {showTitle && showDescription && (
        <DescriptionText>{description}</DescriptionText>
      )}
    </CardContainer>
  )
}

export default CustomInfoCard
