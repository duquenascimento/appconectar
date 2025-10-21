import React from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import Icons from '@expo/vector-icons/Ionicons'
import { styled, Text, XStack } from 'tamagui'

interface HeaderProps {
  title: string
  onBackPress: () => void
}

const HeaderContainer = styled(XStack, {
  name: 'HeaderContainer', 
  width: Platform.OS === 'web' ? '74%' : '90%', 
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingVertical: '$2', 
  marginHorizontal: 'auto',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  backgroundColor: '#F9F9F9',
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
       <TouchableOpacity onPress={onBackPress}>
        <Icons name="chevron-back" size={30} color="#000" />
      </TouchableOpacity>

      <HeaderTitle numberOfLines={1} ellipsizeMode="tail">
        {title}
      </HeaderTitle>
    </HeaderContainer>
  )
}

export default CustomHeader;
