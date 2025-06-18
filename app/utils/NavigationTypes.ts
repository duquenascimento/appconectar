import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Sign: undefined;
  Orders: undefined;
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export type HomeScreenPropsUtils = {
  navigation: HomeScreenNavigationProp;
};
