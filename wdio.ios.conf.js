exports.config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  specs: ['./testes/e2e/**/*.ios.spec.js'],
  maxInstances: 1,
  services: [],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    timeout: 60000
  },
  capabilities: [{
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    // Nome do simulador
    'appium:deviceName': 'iPhone 16',
    // Versão do iOS instalada no simulador
    'appium:platformVersion': '18.0',
    // Caminho para o aplicativo (.app para simulador)
    'appium:app': '/Users/felipe/Projects/conectar/ios/build/Build/Products/Debug-iphonesimulator/Conectar.app',
    // Inicia um novo estado da aplicação
    'appium:noReset': false,
    // Aceita alertas do sistema automaticamente
    'appium:autoAcceptAlerts': true
  }]
};