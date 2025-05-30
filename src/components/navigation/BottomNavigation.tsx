import { RootStackParamList } from '../../types/navigationTypes'
import { View, Text, TouchableOpacity } from 'react-native'
import Icons from '@expo/vector-icons/Ionicons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import styles from '../../styles/stylesNavigator'
import { deleteToken } from '../../../app/utils/utils'

type BottomNavigationProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>
}

export default function BottomNavigation({ navigation }: BottomNavigationProps) {
  return (
    <View style={styles.containerExternal}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            navigation.navigate('Products')
          }}
        >
          <Icons name="home" size={20} color="#04BF7B" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            navigation.navigate('Orders')
          }}
        >
          <Icons name="journal" size={20} color="gray" />
          <Text style={styles.navText}>Meus Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={async () => {
            navigation.navigate('Sign')
            await deleteToken()
          }}
        >
          <Icons name="log-out" size={20} color="gray" />
          <Text style={styles.navText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
