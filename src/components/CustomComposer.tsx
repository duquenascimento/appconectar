import { ComposerProps } from 'react-native-gifted-chat';
import { Platform, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function CustomComposer(props: any) {
  const { text, textInputProps, onSend } = props;
  const [height, setHeight] = useState(40);

  useEffect(() => {
    if (!text) {
      setHeight(44);
    }
  }, [text]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <View
        style={{
          minHeight: 44,
          height: Math.max(44, height),
          backgroundColor: '#f0f2f5',
          borderRadius: 20,
          marginRight: 8,
          paddingLeft: 16,
          paddingRight: 16,
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <TextInput
          {...textInputProps}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#8e8e93"
          multiline
          value={text}
          showsVerticalScrollIndicator={false}
          underlineColorAndroid="transparent"
          scrollEnabled={height >= 100}
          onContentSizeChange={(e) => {
            const contentHeight = e.nativeEvent.contentSize.height;
            setHeight(Math.min(100, Math.max(44, contentHeight)));
          }}
          onKeyPress={(e: any) => {
            if (Platform.OS === 'web') {
              if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                if (text && text.trim().length > 0 && onSend) {
                  onSend({ text: text.trim() }, true);
                }
              }
            }
          }}
          style={[
            {
              fontSize: 16,
              color: '#000',
              textAlignVertical: 'center',
              paddingTop: Platform.OS === 'ios' ? 12 : 10,
              paddingBottom: Platform.OS === 'ios' ? 10 : 8,
              paddingLeft: 4,
              paddingRight: 4,
              maxHeight: 100,
              outlineStyle: 'none' as unknown as 'none',
            },
            textInputProps?.style,
          ]}
        />
      </View>
    </View>
  );
}
