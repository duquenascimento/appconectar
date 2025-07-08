import React from 'react'
import { styled, Text, XStack, YStack } from 'tamagui'
import Icons from '@expo/vector-icons/Ionicons'

interface InfoCardProps {
  title?: string
  description?: string
}

const CardContainer = styled(YStack, {
  name: 'CardContainer',
  bg: '#f0f0f0',
  borderRadius: '$4',
  padding: '$4',
  marginTop: '$2',
  space: '$4',
})

const CardHeader = styled(XStack, {
  name: 'CardHeader',
  alignItems: 'center',
  space: '$2',
})

const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontSize: '$5',
  fontWeight: 'bold',
  color: '#333',
  flexShrink: 1,
})

const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontSize: '$3',
  color: '#666',
})

const CustomInfoCard: React.FC<InfoCardProps> = ({ title = '', description = '' }) => {
  return (
    <CardContainer>
      <CardHeader>
        <Icons name="information-circle-outline" size={20} color="#666" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardDescription>{description}</CardDescription>
    </CardContainer>
  )
}

export default CustomInfoCard;
