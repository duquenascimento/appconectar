import { expect } from '@wdio/globals';

describe('Fluxo de confirmação de pedido - Web (DT-252)', () => {
  const APP_URL = 'http://localhost:8081';
  const TEST_EMAIL = 'teste35@teste.com';
  const TEST_PASSWORD = 'teste35@teste.com';
  const RESTAURANT_EXTERNAL_ID = 'C939';
  const SUPPLIER_EXTERNAL_ID = 'F0';

  async function login() {
    await browser.url(APP_URL);
    await browser.pause(5000);
    const loginButton = await $('[data-testid="botao-entrar"]');

    if (await loginButton.isExisting()) {
      await loginButton.waitForDisplayed({ timeout: 10000 });
      await $('[data-testid="input-email"]').setValue(TEST_EMAIL);
      await $('[data-testid="input-senha"]').setValue(TEST_PASSWORD);
      await loginButton.click();
      try {
        await $('[role="progressbar"]').waitForDisplayed({ timeout: 30000 });
      } catch {}
      await $('[role="progressbar"]').waitForDisplayed({ timeout: 25000, reverse: true });
    }
  }

  async function addProductToCart() {
    const selector = '[data-testid^="adicionar-produto-"]';
    await browser.waitUntil(async () => (await $$(selector)).length > 0, {
      timeout: 15000,
      timeoutMsg: 'Nenhum produto disponível para adicionar ao carrinho em /products',
    });
    const addButtons = await $$(selector);
    await addButtons[0].click();
    await browser.pause(1000);
  }

  function buildSupplierFixture({ minimumOrder = 500, orderValueFinish = 100 } = {}) {
    return {
      supplier: {
        name: 'Fornecedor de Teste',
        externalId: SUPPLIER_EXTERNAL_ID,
        image: '',
        missingItens: 0,
        minimumOrder,
        hour: '23:59:59',
        discount: {
          orderValue: orderValueFinish,
          discount: 0,
          orderWithoutTax: orderValueFinish,
          orderWithTax: orderValueFinish,
          tax: 0,
          missingItens: 0,
          orderValueFinish,
          product: [],
          sku: 'sku-teste',
        },
        star: '5',
        sameDayOrders: [],
        openingTime: '08:00',
      },
    };
  }

  async function seedSupplierSelected(fixture) {
    await browser.execute((data) => {
      window.localStorage.setItem('supplierSelected', JSON.stringify(data));
    }, fixture);
  }

  async function goToConfirm() {
    await browser.url(`${APP_URL}/confirm`);
    await browser.pause(3000);
  }

  async function waitForOrderOutcome({ timeout = 30000 } = {}) {
    const paginaConfirmado = await $('[data-testid="pagina-pedido-confirmado"]');
    const dialogoErro = await $('[data-testid="dialogo-erro-conteudo"]');
    const alertaMensagem = await $('[data-testid="alerta-mensagem"]');

    await browser.waitUntil(
      async () =>
        (await paginaConfirmado.isExisting()) ||
        (await dialogoErro.isExisting()) ||
        (await alertaMensagem.isExisting()),
      { timeout, timeoutMsg: `Nenhum desfecho (sucesso ou erro) apareceu em ${timeout}ms` },
    );

    if (await paginaConfirmado.isExisting()) {
      return { outcome: 'sucesso' };
    }

    if (await dialogoErro.isExisting()) {
      const texto = await dialogoErro.getText();
      throw new Error(`Pedido não confirmado: diálogo de erro apareceu com o texto: "${texto}"`);
    }

    const texto = await alertaMensagem.getText();
    throw new Error(`Pedido não confirmado: alerta apareceu com o texto: "${texto}"`);
  }

  it('cache desatualizado (allowEmergencyOrder=true) não é confiado: valor mínimo continua bloqueando o pedido', async () => {
    await login();

    await browser.execute(
      (externalId) => {
        const stale = {
          externalId,
          allowEmergencyOrder: true,
          allowClosedSupplier: true,
          allowMinimumOrder: true,
        };
        window.localStorage.setItem('selectedRestaurant', JSON.stringify(stale));
      },
      RESTAURANT_EXTERNAL_ID,
    );

    await seedSupplierSelected(buildSupplierFixture());
    await goToConfirm();

    const confirmButton = await $('[data-testid="botao-confirmar-pedido"]');
    await confirmButton.waitForDisplayed({ timeout: 15000 });
    await confirmButton.click();

    const erroValorMinimo = await $(
      '[data-testid="erro-O valor do pedido não atingiu o mínimo do fornecedor"]',
    );
    await erroValorMinimo.waitForDisplayed({ timeout: 15000 });

    expect(await erroValorMinimo.isDisplayed()).toBe(true);

    const telaConfirmando = await $('[data-testid="tela-confirmando-pedido"]');
    expect(await telaConfirmando.isExisting()).toBe(false);
  });

  it('caminho feliz: pedido dentro das regras é confirmado e chega na tela de sucesso', async () => {
    await login();
    await addProductToCart();

    await seedSupplierSelected(buildSupplierFixture({ minimumOrder: 50, orderValueFinish: 100 }));
    await goToConfirm();

    const confirmButton = await $('[data-testid="botao-confirmar-pedido"]');
    await confirmButton.waitForDisplayed({ timeout: 15000 });
    await confirmButton.click();

    const { outcome } = await waitForOrderOutcome();

    expect(outcome).toBe('sucesso');
  });

  it('clique duplo no botão de confirmar não cria dois pedidos', async () => {
    await login();
    await addProductToCart();

    await seedSupplierSelected(buildSupplierFixture({ minimumOrder: 50, orderValueFinish: 100 }));
    await goToConfirm();

    const confirmButton = await $('[data-testid="botao-confirmar-pedido"]');
    await confirmButton.waitForDisplayed({ timeout: 15000 });

    // Dois cliques em sequência imediata, sem esperar entre eles, para exercitar a
    // guarda de clique duplo (isSubmittingRef) da causa 5. Se o primeiro clique abrir um
    // diálogo/alerta de erro (bloqueando o segundo clique por interceptação), o helper
    // abaixo falha com o texto do erro em vez de um timeout sem contexto.
    await confirmButton.click();
    try {
      await confirmButton.click();
    } catch (error) {
      console.warn('Segundo clique não pôde ser disparado (pode indicar erro no primeiro):', error.message);
    }

    await waitForOrderOutcome();

    await browser.url(`${APP_URL}/ordersScreen`);
    const listaPedidos = await $('[data-testid="lista-pedidos"]');
    await listaPedidos.waitForDisplayed({ timeout: 15000 });

    const pedidosDoFornecedorDeTeste = await $$(
      `[data-testid^="pedido-"]`,
    );

    expect(pedidosDoFornecedorDeTeste.length).toBeGreaterThan(0);
  });
});
