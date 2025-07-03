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
      fontSize={15}
      marginTop={10}
      marginBottom={10}
      color={'rgba(0, 0, 0, 0.6)'}
    >
      {children}
    </Text>
  )
}

export default CustomSubtitle
