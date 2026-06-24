exports.config = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/', // Appium 3 usa caminho raiz
  specs: ['./testes/e2e/login.web.spec.js'],
  maxInstances: 1,

  services: [['appium', { command: 'appium' }]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { timeout: 40000 },

  capabilities: [{
    platformName: 'windows',        // ← NÃO é "web"
    browserName: 'chrome',
    'appium:automationName': 'chromium',
    'goog:chromeOptions': {
      args: ['--start-maximized', '--no-sandbox', '--disable-dev-shm-usage', '--disable-infobars']
    }
  }]
};