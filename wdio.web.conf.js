exports.config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/', // Appium 3 usa caminho raiz
  specs: ['./testes/e2e/*.web.spec.js'],
  maxInstances: 1,
  services: [], 
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { timeout: 40000 },
  // ANDROID BROWSER
  capabilities: [{
    // platformName: 'windows',        // ← NÃO é "web"
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:browserName': 'Chrome',
    'appium:chromedriverAutodownload': true,
  }]
};