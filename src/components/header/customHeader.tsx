import React from 'react'
import { TouchableOpacity } from 'react-native'
import Icons from '@expo/vector-icons/Ionicons'
import { styled, Text, XStack } from 'tamagui'

interface HeaderProps {
  title: string
  onBackPress: () => void
}

const HeaderContainer = styled(XStack, {
  name: 'HeaderContainer',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingVertical: '$4',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  backgroundColor: '#fff',
  space: '$4',
})

const HeaderTitle = styled(Text, {
  name: 'HeaderTitle',
  fontSize: 16,
  color: '#000',
  flex: 1,
})

const CustomHeader: React.FC<HeaderProps> = ({ title, onBackPress }) => {
  return (
    <HeaderContainer>
       <TouchableOpacity onPress={onBackPress} style={{ marginLeft: 25 }}>
        <Icons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <HeaderTitle numberOfLines={1} ellipsizeMode="tail">
        {title}
      </HeaderTitle>
    </HeaderContainer>
  )
}

export default CustomHeader;
