import { ComposerProps } from 'react-native-gifted-chat';
import { Platform, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function CustomComposer({ text, textInputProps }: ComposerProps) {
  const [height, setHeight] = useState(40);

  useEffect(() => {
    if (!text) {
      setHeight(40);
    }
  }, [text]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 6 }}>
      <View
        style={{
          minHeight: 40,
          height: Math.max(40, height),
          backgroundColor: '#f0f2f5',
          borderRadius: 20,
          marginRight: 8,
          paddingHorizontal: 16,
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
            setHeight(Math.min(100, Math.max(40, contentHeight)));
          }}
          style={[
            {
              fontSize: 16,
              color: '#000',
              textAlignVertical: 'center',
              paddingTop: Platform.OS === 'ios' ? 10 : 8,
              paddingBottom: Platform.OS === 'ios' ? 10 : 8,
              paddingLeft: 12,
              paddingRight: 12,
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
