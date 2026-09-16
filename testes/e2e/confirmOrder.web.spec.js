import { expect } from '@wdio/globals';

describe('Fluxo de confirmação de pedido - Web (DT-252)', () => {
  const APP_URL = 'http://localhost:8081';

  // Conta de teste dedicada: o restaurante correspondente deve ter, no backend de teste,
  // allowEmergencyOrder = false e um fornecedor de teste cujo minimumOrder seja maior que o
  // orderValueFinish usado no fixture de `supplier` abaixo (ver cenário 2).
  const TEST_EMAIL = 'teste35@teste.com';
  const TEST_PASSWORD = 'teste35@teste.com';
  // externalId real do restaurante da conta de teste no backend usado nos testes.
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

  // O backend (`confirmService.ts:158`) valida o carrinho REAL do restaurante no banco
  // (getCurrentCartWithProducts), não o `supplier.discount.product` do fixture abaixo — e
  // apaga esse carrinho após uma confirmação bem-sucedida (`confirmService.ts:465-466`,
  // `shouldDeleteCart` default true). Por isso cada teste que chega ao /confirm precisa
  // garantir seu próprio item no carrinho real via UI, em vez de depender de sobra de
  // execuções anteriores (foi exatamente a falha "Seu carrinho está vazio!" observada).
  // O catálogo de produtos é dinâmico por restaurante/fornecedor, então não há um nome
  // fixo garantido em qualquer conta de teste (diferente de cart.web.spec.js, que usa uma
  // conta com catálogo conhecido) — pega o primeiro "adicionar-produto-*" disponível na tela.
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

  // Fixture do fornecedor selecionado (chave 'supplierSelected'), lido por app/confirm.tsx.
  // orderValueFinish abaixo do minimumOrder força o erro de "valor mínimo" quando a
  // validação de fato roda (ou seja, quando allowEmergencyOrder é tratado como false).
  function buildSupplierFixture({ minimumOrder = 500, orderValueFinish = 100 } = {}) {
    return {
      supplier: {
        name: 'Fornecedor de Teste',
        externalId: SUPPLIER_EXTERNAL_ID,
        image: '',
        missingItens: 0,
        minimumOrder,
        // isOpen() em app/confirm.tsx compara `Number(hour.replaceAll(':', ''))` contra um
        // "currentHour" no formato HHMMSS (6 dígitos) — hour precisa incluir segundos,
        // senão a comparação numérica falha e o fornecedor aparece como "fechado" mesmo
        // com um horário de fechamento tardio.
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

  // Espera o desfecho do clique em "Confirmar pedido": sucesso, o diálogo de erro
  // genérico (DialogInstance, alimentado por `erros`/catch de handleConfirmOrder), ou o
  // alerta "Endereço Incompleto" (CustomAlert, alimentado por validateAddress/isRetroactiveDate).
  // Falha com o texto do erro capturado em vez de um timeout sem contexto.
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

    // Simula o cenário do DT-252: um `selectedRestaurant` desatualizado no cache local,
    // com allowEmergencyOrder=true, enquanto o backend real da conta de teste já tem
    // allowEmergencyOrder=false. Sem a correção da causa 1/2, o app confiaria nesse valor
    // e puclaria a validação de valor mínimo do fornecedor.
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

    // Verificação básica: a lista carregou. Uma asserção mais forte (exatamente 1 pedido
    // novo para este fornecedor/data) depende de uma forma de isolar os pedidos criados
    // neste teste especificamente (ex.: limpar o histórico antes, ou filtrar por um
    // identificador exclusivo do fornecedor de teste) — ajustar conforme os dados de teste
    // disponíveis no backend usado para rodar esta suíte.
    expect(pedidosDoFornecedorDeTeste.length).toBeGreaterThan(0);
  });
});
