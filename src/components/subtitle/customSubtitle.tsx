import React from 'react'
import { Text } from 'tamagui'

interface SubtitleProps {
  children: React.ReactNode
}

const CustomSubtitle: React.FC<SubtitleProps> = ({
  children  
}) => {
  return (
    <Text
      fontSize={16}
      marginTop={10}
      marginBottom={10}
      marginHorizontal={16}
      color={'rgba(0, 0, 0, 0.6)'}
    >
      {children}
    </Text>
  )
}

export default CustomSubtitle
