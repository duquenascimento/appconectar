import { openURL } from 'expo-linking'
import { Platform } from 'react-native'
import {WebView} from 'react-native-webview'
import { Button, Dialog, YStack, Text, XStack } from "tamagui"

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PdfViewerModal({pdfUrl, open, onClose}: { pdfUrl: string, open: boolean, onClose: ()=> void}) {
  
  const uri = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`

 const handleDownload = async () => {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', pdfUrl.split('/').pop() || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error);
      // Fallback para a abordagem anterior se houver problemas com CORS
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', '');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } else {
    try {
      const fileName = pdfUrl.split('/').pop() || 'documento.pdf';
      const fileUri = FileSystem.documentDirectory + fileName;
      const { uri: localUri } = await FileSystem.downloadAsync(
        pdfUrl,
        fileUri
      );
      await Sharing.shareAsync(localUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Salvar documento',
        UTI: 'com.adobe.pdf' 
      });
    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error);
    }
  }
};

  return <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <Dialog.Overlay 
        key='overlay'
        fullscreen
        style={{
          position: 'absolute',
          top:0,
          left:0,
          width: '100%',
          height: '100%',
          zIndex: 100
        }}
      />
       <Dialog.Content
        key="content"
        style={{
          position:'absolute',
          top: 0,
          left: 0,
          marginTop: Platform.OS === "web" ? 20:0
        }}
        bordered
        elevate
        width= {Platform.OS === "web" ? "75%" : '100%'}
        height={Platform.OS === "web" ? "95%" : '100%'}
        zIndex={101}
      >
        <YStack flex={1} gap="$3">
          {Platform.OS === "web" ? (
            <iframe
              src={uri}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: 6,
              }}
              title="PDF Viewer"
            />
          ) : (
            <WebView
              source={{
                uri
              }}
              originWhitelist={["*"]}
              startInLoadingState
              useWebKit
              javaScriptEnabled
              style={{ flex: 1 }}
              allowsFullscreenVideo
              allowsBackForwardNavigationGestures
              scalesPageToFit
              onError={(e) => {
                console.error("Erro ao carregar PDF:", e.nativeEvent);
              }}
            />
          )}
          <XStack gap='$4' >
            <Button 
              backgroundColor='black'
              flex={1}
              onPress={onClose}
              width="50%"
            >
              <Text pl={5} fontSize={12} color="white">
                Fechar
              </Text>
            </Button>
            <Button 
              backgroundColor='#04BF7B'
              flex={1}
              onPress={handleDownload}
              width="50%"
            >
              <Text pl={5} fontSize={12} color="white">
                Download
              </Text>
            </Button>
          </XStack>
        </YStack>
      </Dialog.Content>
    </Dialog>
}