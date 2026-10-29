import { expect } from '@wdio/globals';

// Requer uma conta/restaurante de homologação com forma de pagamento PIX
// (paymentWay 'AV01' ou 'AV00' — ver src/utils/paymentUtils.ts isPixPaymentMethod).
// Sem isso o backend não emite cobrança PIX para o pedido e o QR Code nunca aparece.
//
// Segue o fluxo real do usuário (produtos -> carrinho -> cotações -> confirmação),
// em vez de pular direto para /confirm via localStorage: o botão "fornecedor-*" só
// navega se o fornecedor estiver disponível (ver src/components/suppliersList.tsx),
// então a conta de teste precisa ter pelo menos um fornecedor aberto na aba
// "Por fornecedor" para o clique efetivamente levar à tela de confirmação.
describe('Fluxo de criação de pedido PIX - Web', () => {
  const APP_URL = 'http://localhost:8081';
  const TEST_EMAIL = 'TROCAR_PELA_CONTA_PIX@teste.com';
  const TEST_PASSWORD = 'TROCAR_PELA_CONTA_PIX@teste.com';

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

  async function goToCart() {
    const cartButton = await $('[data-testid="botao-carrinho"]');
    await cartButton.waitForDisplayed({ timeout: 10000 });
    await cartButton.click();
    await browser.pause(2000);
  }

  async function goToQuotations() {
    const verCotacoesButton = await $('[data-testid="botao-ver-cotacoes"]');
    await verCotacoesButton.waitForDisplayed({ timeout: 10000 });
    await verCotacoesButton.click();

    // app/prices.tsx mostra um LoadingActivityIndicator (role="progressbar") enquanto
    // busca restaurante/cotações antes de renderizar as abas e a lista de fornecedores.
    try {
      await $('[role="progressbar"]').waitForDisplayed({ timeout: 10000 });
    } catch {}
    await $('[role="progressbar"]').waitForDisplayed({ timeout: 30000, reverse: true });
  }

  async function selectFirstSupplierQuotation() {
    const porFornecedorTab = await $('[data-testid="aba-por-fornecedor"]');
    await porFornecedorTab.waitForDisplayed({ timeout: 10000 });
    await porFornecedorTab.click();

    const selector = '[data-testid^="fornecedor-"]';
    await browser.waitUntil(async () => (await $$(selector)).length > 0, {
      timeout: 20000,
      timeoutMsg: 'Nenhum fornecedor disponível na aba "Por fornecedor" em /prices',
    });
    const suppliers = await $$(selector);
    await suppliers[0].click();
  }

  it('pedido com forma de pagamento PIX chega na tela de sucesso com QR Code', async () => {
    await login();
    await addProductToCart();
    await goToCart();
    await goToQuotations();
    await selectFirstSupplierQuotation();

    const confirmButton = await $('[data-testid="botao-confirmar-pedido"]');
    await confirmButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg:
        'Tela de confirmação de pedido não apareceu — o fornecedor clicado pode estar indisponível, ou a conta de teste tem pendência de dados de entrega (diálogo "editar informações" em vez de navegar)',
    });
    await confirmButton.click();

    const paginaConfirmado = await $('[data-testid="pagina-pedido-confirmado"]');
    await paginaConfirmado.waitForDisplayed({ timeout: 30000 });

    const qrCode = await $('[data-testid="pix-qr-code"]');
    await qrCode.waitForDisplayed({ timeout: 15000 });
    expect(await qrCode.isDisplayed()).toBe(true);

    const botaoCopiar = await $('[data-testid="botao-copiar-pix"]');
    expect(await botaoCopiar.isEnabled()).toBe(true);
    await botaoCopiar.click();

    const toast = await $('*=Código copiado');
    expect(await toast.isDisplayed()).toBe(true);
  });
});
