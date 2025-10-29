import { SafeAreaView } from 'react-native';

type PageContainerProps = {
  children: React.ReactNode;
  backgroundColor: 'white' | 'gray';
};

const colorMapping = {
  white: '#F9F9F9',
  gray: '#F0F2F6',
};

// children: conteúdo todo da página

export default function PageContainer({ children, backgroundColor }: PageContainerProps) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: `${colorMapping[backgroundColor]}`,
        paddingTop: 40,
        paddingBottom: 10,
      }}
    >
      {children}
    </SafeAreaView>
  );
}
