# Guia de Execução dos Testes E2E

## Pré-requisitos

-   Node.js instalado

-   Android Studio com um emulador Android

-   Appium 3 instalado

-   Driver `uiautomator2` instalado:

    ``` bash
    appium driver install uiautomator2
    ```

-   Google Chrome instalado no emulador

-   Projeto com as dependências instaladas:

    ``` bash
    npm install
    ```

## Iniciar o emulador

Abra o Android Studio e inicie um AVD ou execute:

``` bash
emulator -avd <NOME_DO_AVD>
```

Verifique se o dispositivo está disponível:

``` bash
adb devices
```

## Iniciar o Appium

Em um terminal separado:

``` bash
appium
```

O servidor deve iniciar em:

``` text
http://127.0.0.1:4723
```

## Configuração do WebdriverIO

No `wdio.web.conf.js`, utilize:

``` js
hostname: '127.0.0.1',
port: 4723,
path: '/',
```

Para testes no Chrome Android:

``` js
capabilities: [{
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:browserName': 'Chrome'
}]
```

## Executar a aplicação

Inicie a aplicação React Native Web (Expo) normalmente.

Caso utilize ngrok, copie a URL pública e atualize a constante `APP_URL`
utilizada pelos testes.

## Executar os testes

``` bash
npx wdio run wdio.web.conf.js
```

## Problemas comuns

### Appium não encontrado

``` text
appium: command not found
```

Instale:

``` bash
npm install -g appium
```

### UiAutomator2 não instalado

``` text
Could not find a driver for automationName 'UiAutomator2'
```

Execute:

``` bash
appium driver install uiautomator2
```

### Chromedriver incompatível

Atualize o Chrome do emulador ou habilite o download automático de
Chromedriver, conforme a versão do Appium/UiAutomator2.

## Encerrando

Após os testes, encerre:

-   Appium (`Ctrl + C`)
-   Emulador Android (opcional)