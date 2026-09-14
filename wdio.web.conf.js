export const config = {
    runner: 'local',
    specs: [
        './test/specs/**/*.js'
    ],
    maxInstances: 5,

    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            // Opcional: Remova o comentário da linha abaixo se quiser rodar em background (sem abrir a janela)
            // args: ['--headless', '--disable-gpu']
        },
        'goog:loggingPrefs': { browser: 'ALL' }
    }],

    services: [], 

    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};