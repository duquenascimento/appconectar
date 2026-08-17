import { expect } from '@wdio/globals';

describe('Tela de Carrinho - Web', () => {
  const APP_URL = 'http://10.0.2.2:8081';

  async function acessarAplicacao() {
    await browser.url(APP_URL);
    await browser.pause(5000);
    const loginButton = await $('[data-testid="botao-entrar"]');
    
    if(await loginButton.isExisting()) {
      await loginButton.waitForDisplayed({ timeout: 10000 });
      await $('[data-testid="input-email"]').setValue('teste20@teste.com');
      await $('[data-testid="input-senha"]').setValue('teste20@teste.com');
      await loginButton.click();
       try {
        await $('[role="progressbar"]').waitForDisplayed({ timeout: 30000 });
      } catch {}
      await $('[role="progressbar"]').waitForDisplayed({ timeout: 25000, reverse: true });
    }
    
    const cartSizeText = await $('[data-testid="quantidade-carrinho"]');
    await cartSizeText.waitForDisplayed({ timeout: 10000 });

    if(await cartSizeText.getText() !== '0') {
      await $('[data-testid="botao-carrinho"]').click();

      const deleteCartButton = await $('[data-testid="deletar-carrinho"]');
      await deleteCartButton.waitForDisplayed({ timeout: 10000 });
      await deleteCartButton.click();

      await browser.pause(2000);

      await $('[data-testid="deletar-carrinho-confirmacao"]').click();

      await browser.pause(5000);
    }
  }

  beforeEach(async () => {
    await acessarAplicacao();
  });

  it('adicionar/remover produto no carrinho', async () => {
    const cartSizeText = await $('[data-testid="quantidade-carrinho"]');
    const addProductButton1 = await $('[data-testid="adicionar-produto-Abacate"]');
    await addProductButton1.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('1');

    const addProductButton2 = await $('[data-testid="adicionar-produto-Abacaxi"]');
    await addProductButton2.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('2');

    const removeroductButton1 = await $('[data-testid="remover-produto-Abacate"]');
    await removeroductButton1.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('1');

    const removeProductButton2 = await $('[data-testid="remover-produto-Abacaxi"]');
    await removeProductButton2.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('0');
  });

  it('Adicionar produto e deletar carrinho', async () => {
    const cartSizeText = await $('[data-testid="quantidade-carrinho"]');
    const addProductButton1 = await $('[data-testid="adicionar-produto-Abacate"]');
    await addProductButton1.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('1');

    const addProductButton2 = await $('[data-testid="adicionar-produto-Abacaxi"]');
    await addProductButton2.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('2');

    await $('[data-testid="botao-carrinho"]').click();

    const deleteCartButton = await $('[data-testid="deletar-carrinho"]');
    await deleteCartButton.waitForDisplayed({ timeout: 10000 });
    await deleteCartButton.click();

    await browser.pause(2000);

    await $('[data-testid="deletar-carrinho-confirmacao"]').click();

    await browser.pause(5000);

    const newCartSizeText = await $('[data-testid="quantidade-carrinho"]');
    newCartSizeText.waitForDisplayed({ timeout: 5000 });
    expect(await newCartSizeText.getText()).toBe('0');
  });

  it('Adicionar, visualizar e remover produtos no carrinho', async () => {
    const cartSizeText = await $('[data-testid="quantidade-carrinho"]');
    const addProductButton1 = await $('[data-testid="adicionar-produto-Abacate"]');
    await addProductButton1.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('1');

    const addProductButton2 = await $('[data-testid="adicionar-produto-Abacaxi"]');
    await addProductButton2.click();
    await browser.pause(2000);
    expect(await cartSizeText.getText()).toBe('2');

    await $('[data-testid="botao-carrinho"]').click();

    await browser.pause(5000);

    const abacateCard = await $('[data-testid="produto-cartao-570"]');
    const abacaxiCard = await $('[data-testid="produto-cartao-568"]');

    await abacateCard.click();

    const addAbacateButton = await $('[data-testid="adicionar-produto-570"]');
    await addAbacateButton.waitForDisplayed({ timeout: 2000 });
    await addAbacateButton.click();
    await browser.pause(1000);

    await abacaxiCard.click();
    const deleteAbacaxiButton = await $('[data-testid="remover-produto-568"]');
    await deleteAbacaxiButton.waitForDisplayed({ timeout: 2000 });
    await deleteAbacaxiButton.click();
    await browser.pause(1000);

    await $('[data-testid="deletar-produto-carrinho-confirmacao"]').click();
    await browser.pause(2000);

    const abacateCard2 = await $('[data-testid="produto-cartao-570"]');
    abacateCard2.waitForDisplayed({ timeout: 1000 });

    expect(await abacateCard2.isExisting()).toBe(true);

    const abacaxiCard2 = await $('[data-testid="produto-cartao-568"]');

    expect(await abacaxiCard2.isExisting()).toBe(false);
  });

});