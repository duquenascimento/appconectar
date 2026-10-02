import { expect } from '@wdio/globals';
import { Key } from 'webdriverio';

// Fora da automação:
// - salvar o formulário e recalcular as cotações: mudaria os dados do restaurante de teste e a
//   suíte deixaria de rodar de novo (nenhum teste aqui salva);
// - os seletores de horário: a regra está coberta em src/utils/deliveryDataValidation.spec.ts;
// - o aviso de "campos incompletos" no fechamento pelo Conéctar+, que exige contornar o bloqueio;
// - o CEP que não traz cidade e bairro, que depende de serviço externo.
describe('Dados de entrega nas cotações - Web (CH-777)', function () {
  this.timeout(240000);

  const APP_URL = 'http://localhost:8081';
  const TEST_EMAIL = 'teste35@teste.com';
  const TEST_PASSWORD = 'teste35@teste.com';
  const RESTAURANT_INCOMPLETE = { externalId: 'C929', name: 'Bar Nabé Testes do Gustavo' };
  const RESTAURANT_COMPLETE = { externalId: 'C939', name: 'Teste Gustavo' };
  const LOAD_TIMEOUT = 60000;

  const byId = (testId) => `[data-testid="${testId}"]`;
  const byPrefix = (prefix) => `[data-testid^="${prefix}"]`;

  async function resetSession() {
    await browser.url(APP_URL);
    await browser.deleteCookies();
    await browser.execute(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  }

  async function login() {
    await browser.url(APP_URL);
    const loginButton = await $(byId('botao-entrar'));
    await loginButton.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await $(byId('input-email')).setValue(TEST_EMAIL);
    await $(byId('input-senha')).setValue(TEST_PASSWORD);
    await loginButton.click();
    await $(byId('botao-carrinho')).waitForDisplayed({
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'O login não chegou à tela de produtos',
    });
  }

  async function selectRestaurant(restaurant) {
    await browser.execute((externalId) => {
      window.localStorage.setItem('selectedRestaurant', JSON.stringify({ externalId }));
    }, restaurant.externalId);
    await browser.refresh();

    const selector = await $(byId('seletor-restaurante'));
    await selector.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await browser.waitUntil(async () => (await selector.getText()).includes(restaurant.name), {
      timeout: LOAD_TIMEOUT,
      timeoutMsg: `O restaurante "${restaurant.name}" não ficou selecionado`,
    });
  }

  async function addProductToCart() {
    const selector = byPrefix('adicionar-produto-');
    await browser.waitUntil(async () => (await $$(selector)).length > 0, {
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'Nenhum produto disponível para adicionar ao carrinho em /products',
    });
    const addButtons = await $$(selector);
    await addButtons[0].click();
    // O carrinho da conta é restaurado no login, então a contagem não parte de zero.
    await browser.waitUntil(
      async () => parseInt(await $(byId('quantidade-carrinho')).getText(), 10) >= 1,
      { timeout: 15000, timeoutMsg: 'O produto não entrou no carrinho' },
    );
  }

  async function waitForQuotationsScreen() {
    await $(byId('aba-por-fornecedor')).waitForDisplayed({
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'A tela de cotações não saiu do carregamento em tela cheia',
    });
    await browser.waitUntil(async () => !(await $('[role="progressbar"]').isDisplayed()), {
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'As cotações não terminaram de carregar',
    });
  }

  async function enterQuotations(restaurant) {
    await login();
    await selectRestaurant(restaurant);
    await addProductToCart();
    await $(byId('botao-carrinho')).click();
    const viewQuotations = await $(byId('botao-ver-cotacoes'));
    await viewQuotations.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await viewQuotations.click();
    await waitForQuotationsScreen();
  }

  async function openForm() {
    await $(byId('botao-editar-dados-entrega')).click();
    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
  }

  async function cancelForm() {
    await $(byId('dados-entrega-cancelar')).click();
    await $(byId('modal-dados-entrega')).waitForExist({ timeout: 15000, reverse: true });
  }

  async function clearInput(testId) {
    const input = await $(byId(testId));
    await input.click();
    await browser.keys([Key.Ctrl, 'a']);
    await browser.keys('Backspace');
    expect(await input.getValue()).toBe('');
  }

  async function replaceInput(testId, text) {
    await clearInput(testId);
    await $(byId(testId)).addValue(text);
  }

  async function isSaveDisabled() {
    const save = await $(byId('dados-entrega-salvar'));
    const disabled = await save.getAttribute('disabled');
    const ariaDisabled = await save.getAttribute('aria-disabled');
    return disabled !== null || ariaDisabled === 'true';
  }

  async function visibleErrorIds() {
    const ids = [];
    for (const error of await $$(byPrefix('dados-entrega-erro-'))) {
      ids.push(await error.getAttribute('data-testid'));
    }
    return ids;
  }

  async function expectFieldError(field, message) {
    const error = await $(byId(`dados-entrega-erro-${field}`));
    await error.waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `A mensagem de "${field}" não apareceu`,
    });
    // O texto só é lido depois que a animação de abertura do formulário termina.
    await browser.waitUntil(async () => (await error.getText()) === message, {
      timeout: 5000,
      timeoutMsg: `A mensagem de "${field}" não é "${message}"`,
    });
    expect(await isSaveDisabled()).toBe(true);
  }

  async function firstAvailableSupplier() {
    const selector = byPrefix('fornecedor-');
    await browser.waitUntil(async () => (await $$(selector)).length > 0, {
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'Nenhum fornecedor na lista de cotações',
    });
    for (const supplier of await $$(selector)) {
      const opacity = parseFloat((await supplier.getCSSProperty('opacity')).value);
      if (opacity >= 0.9) return supplier;
    }
    throw new Error('Nenhum fornecedor disponível na lista de cotações');
  }

  beforeEach(async () => {
    await resetSession();
  });

  it('dados completos: o formulário não abre e as cotações aparecem', async () => {
    await enterQuotations(RESTAURANT_COMPLETE);

    expect(await $(byId('modal-dados-entrega')).isExisting()).toBe(false);
    await browser.waitUntil(
      async () =>
        (await $$(byPrefix('combinacao-'))).length + (await $$(byPrefix('fornecedor-'))).length > 0,
      { timeout: LOAD_TIMEOUT, timeoutMsg: 'A lista de cotações não apareceu' },
    );
  });

  it('dados pendentes: o formulário abre sozinho com as mensagens dos campos pendentes', async () => {
    await enterQuotations(RESTAURANT_INCOMPLETE);

    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await expectFieldError('responsavel', 'Responsável pelo recebimento é obrigatório');
    await expectFieldError('telefone', 'Telefone do responsável é obrigatório');
    expect(await $(byId('dados-entrega-erro-cep')).isExisting()).toBe(false);
    expect((await visibleErrorIds()).sort()).toEqual([
      'dados-entrega-erro-responsavel',
      'dados-entrega-erro-telefone',
    ]);
  });

  it('dados pendentes: depois de cancelar, abrir uma combinação reabre o formulário', async () => {
    await enterQuotations(RESTAURANT_INCOMPLETE);
    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await cancelForm();

    await $(byId('aba-conectar-plus')).click();
    const combinationSelector = byPrefix('combinacao-');
    await browser.waitUntil(async () => (await $$(combinationSelector)).length > 0, {
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'Nenhuma combinação na aba Conéctar+',
    });
    const urlBefore = await browser.getUrl();
    await (await $$(combinationSelector))[0].click();

    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    // Dá tempo para uma navegação indevida acontecer antes de conferir a URL.
    await browser.pause(1500);
    expect(await browser.getUrl()).toBe(urlBefore);
  });

  it('dados pendentes: depois de cancelar, abrir uma cotação de fornecedor reabre o formulário', async () => {
    await enterQuotations(RESTAURANT_INCOMPLETE);
    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await cancelForm();

    await $(byId('aba-por-fornecedor')).click();
    const supplier = await firstAvailableSupplier();
    const urlBefore = await browser.getUrl();
    await supplier.click();

    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await browser.pause(1500);
    expect(await browser.getUrl()).toBe(urlBefore);
  });

  it('cada campo mostra a sua mensagem quando vazio ou fora do padrão', async () => {
    await enterQuotations(RESTAURANT_COMPLETE);
    await openForm();
    expect(await visibleErrorIds()).toEqual([]);
    expect(await isSaveDisabled()).toBe(false);

    const requiredFields = [
      { field: 'cep', message: 'CEP é obrigatório' },
      { field: 'cidade', message: 'Cidade é obrigatória' },
      { field: 'bairro', message: 'Bairro é obrigatório' },
      { field: 'rua', message: 'Rua é obrigatória' },
      { field: 'numero', message: 'Número é obrigatório' },
      { field: 'responsavel', message: 'Responsável pelo recebimento é obrigatório' },
      { field: 'telefone', message: 'Telefone do responsável é obrigatório' },
    ];

    // Reabrir o formulário restaura o valor salvo; digitar o CEP de volta consultaria o CEP
    // na internet e sobrescreveria rua e número.
    for (const { field, message } of requiredFields) {
      const input = await $(byId(`dados-entrega-input-${field}`));
      if (!(await input.isEnabled())) {
        console.warn(`Campo "${field}" travado pelo CEP: sem como esvaziá-lo pela tela`);
        continue;
      }
      await clearInput(`dados-entrega-input-${field}`);
      await expectFieldError(field, message);
      await cancelForm();
      await openForm();
      expect(await visibleErrorIds()).toEqual([]);
    }

    await replaceInput('dados-entrega-input-telefone', '119999999');
    await expectFieldError('telefone', 'Telefone inválido');
    await cancelForm();
    await openForm();

    await replaceInput('dados-entrega-input-cep', '0130500');
    await expectFieldError('cep', 'CEP inválido');
    await cancelForm();
  });

  it('cancelar descarta o que foi digitado e reabre com os dados salvos', async () => {
    await enterQuotations(RESTAURANT_COMPLETE);
    await openForm();

    const savedName = await $(byId('dados-entrega-input-responsavel')).getValue();
    expect(savedName).not.toBe('');
    await replaceInput('dados-entrega-input-responsavel', 'Nome Digitado Sem Salvar');
    await cancelForm();
    await openForm();

    expect(await $(byId('dados-entrega-input-responsavel')).getValue()).toBe(savedName);
    await cancelForm();
  });
});
