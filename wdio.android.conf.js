exports.config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/', // Appium 3 usa caminho raiz
  specs: ['./testes/e2e/*.android.spec.js'],
  maxInstances: 1,
  services: [], 
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { timeout: 40000 },
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:app':
    '/home/felipe/Downloads/application-9016da8b-aea3-48f6-b8bf-6b17f1d3daec.apk'
  }]
};