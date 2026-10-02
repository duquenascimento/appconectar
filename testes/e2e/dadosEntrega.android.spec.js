import { expect } from '@wdio/globals';

// Fora da automação: salvar o formulário (mudaria os dados do restaurante de teste), os
// seletores de horário e o CEP que não traz cidade e bairro. A web cobre os demais casos.
describe('Dados de entrega nas cotações - Android (CH-777)', function () {
  this.timeout(240000);

  const TEST_EMAIL = 'teste35@teste.com';
  const TEST_PASSWORD = 'teste35@teste.com';
  const RESTAURANT_INCOMPLETE_NAME = 'Bar Nabé Testes do Gustavo';
  const RESTAURANT_COMPLETE_NAME = 'Teste Gustavo';
  const LOAD_TIMEOUT = 60000;

  // No Android, o testID do React Native vira o resource-id do elemento, e não a descrição de
  // acessibilidade que o seletor `~` procura.
  const byId = (id) => `android=new UiSelector().resourceId("${id}")`;
  const byIdPrefix = (prefix) => `android=new UiSelector().resourceIdMatches("^${prefix}.*")`;

  // Toque no centro do elemento, como o dedo do cliente. Rodar com o APK release: no debug, o
  // aviso de erro do React Native no rodapé cobre botões como o "Ver cotações".
  async function tap(selectorOrElement) {
    const element =
      typeof selectorOrElement === 'string' ? await $(selectorOrElement) : selectorOrElement;
    await element.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await driver.execute('mobile: clickGesture', { elementId: element.elementId });
  }

  async function login() {
    await $(byId('input-email')).waitForDisplayed({ timeout: 20000 });
    await $(byId('input-email')).setValue(TEST_EMAIL);
    await $(byId('input-senha')).setValue(TEST_PASSWORD);
    await tap(byId('botao-entrar'));

    await $(byId('seletor-restaurante')).waitForDisplayed({ timeout: LOAD_TIMEOUT });
  }

  async function selectRestaurant(name) {
    const selector = await $(byId('seletor-restaurante'));
    await selector.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await tap(selector);
    const option = await $(`android=new UiSelector().text("${name}")`);
    await option.waitForDisplayed({ timeout: 15000 });
    await tap(option);

    await browser.waitUntil(
      async () => {
        const label = await $(`android=new UiSelector().text("${name}")`);
        return label.isDisplayed();
      },
      { timeout: LOAD_TIMEOUT, timeoutMsg: `O restaurante "${name}" não ficou selecionado` },
    );
  }

  async function addProductToCart() {
    const addButton = await $(byIdPrefix('adicionar-produto-'));
    await addButton.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await tap(addButton);
  }

  async function enterQuotations(restaurantName) {
    await login();
    await selectRestaurant(restaurantName);
    await addProductToCart();
    await tap(byId('botao-carrinho'));
    await tap(byId('botao-ver-cotacoes'));
    await $(byId('aba-por-fornecedor')).waitForDisplayed({
      timeout: LOAD_TIMEOUT,
      timeoutMsg: 'A tela de cotações não saiu do carregamento em tela cheia',
    });
  }

  async function openForm() {
    await tap(byId('botao-editar-dados-entrega'));
    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
  }

  async function cancelForm() {
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await tap(byId('dados-entrega-cancelar'));
    await $(byId('modal-dados-entrega')).waitForDisplayed({ reverse: true, timeout: 15000 });
  }

  async function replaceInput(testId, text) {
    const input = await $(byId(testId));
    await tap(input);
    await input.clearValue();
    if (text) await input.addValue(text);
  }

  async function isSaveEnabled() {
    return $(byId('dados-entrega-salvar')).isEnabled();
  }

  async function expectFieldError(field, message) {
    const error = await $(byId(`dados-entrega-erro-${field}`));
    await error.waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `A mensagem de "${field}" não apareceu`,
    });
    await expect(error).toHaveText(message);
    expect(await isSaveEnabled()).toBe(false);
  }

  let appId;

  before(async () => {
    appId = await driver.getCurrentPackage();
  });

  // Limpar os dados do app desloga a conta e apaga o carrinho local, para um teste não herdar
  // o estado do anterior.
  beforeEach(async () => {
    await driver.execute('mobile: clearApp', { appId });
    await driver.activateApp(appId);
  });

  it('dados pendentes: o formulário abre sozinho com as mensagens dos campos pendentes', async () => {
    await enterQuotations(RESTAURANT_INCOMPLETE_NAME);

    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await expectFieldError('responsavel', 'Responsável pelo recebimento é obrigatório');
    await expectFieldError('telefone', 'Telefone do responsável é obrigatório');
    expect(await $(byId('dados-entrega-erro-cep')).isExisting()).toBe(false);
  });

  it('dados pendentes: depois de cancelar, abrir uma combinação reabre o formulário', async () => {
    await enterQuotations(RESTAURANT_INCOMPLETE_NAME);
    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await cancelForm();

    await tap(byId('aba-conectar-plus'));
    const combination = await $(byIdPrefix('combinacao-'));
    await combination.waitForDisplayed({ timeout: LOAD_TIMEOUT });
    await tap(combination);

    await $(byId('modal-dados-entrega')).waitForDisplayed({ timeout: 15000 });
    await expect($(byId('aba-conectar-plus'))).toBeDisplayed();
  });

  it('cancelar descarta o que foi digitado e reabre com os dados salvos', async () => {
    await enterQuotations(RESTAURANT_COMPLETE_NAME);
    await openForm();

    const savedName = await $(byId('dados-entrega-input-responsavel')).getText();
    const savedPhone = await $(byId('dados-entrega-input-telefone')).getText();
    const savedZipCode = await $(byId('dados-entrega-input-cep')).getText();

    await replaceInput('dados-entrega-input-responsavel', 'Nome Digitado Sem Salvar');
    await replaceInput('dados-entrega-input-telefone', '119999999');
    await replaceInput('dados-entrega-input-cep', '0130500');
    await cancelForm();
    await openForm();

    expect(await $(byId('dados-entrega-input-responsavel')).getText()).toBe(savedName);
    expect(await $(byId('dados-entrega-input-telefone')).getText()).toBe(savedPhone);
    expect(await $(byId('dados-entrega-input-cep')).getText()).toBe(savedZipCode);
    await cancelForm();
  });
});
