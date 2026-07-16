import { expect } from '@wdio/globals';

describe('Recuperação de senha - Web', () => {
  const APP_URL = 'http://10.0.2.2:8081';

  async function acessarAplicacao() {
    await browser.url(APP_URL);
    await browser.pause(5000);
    const logoutButton = await $('[data-testid="botao-logout"]');
    
    if(await logoutButton.isExisting()) {
      await logoutButton.waitForDisplayed({ timeout: 10000 });
      await logoutButton.click();
      await browser.pause(5000)
    }
  }

  beforeEach(async () => {
    await acessarAplicacao();
  });

  it('enviar pedido de recuperação de senha', async () => {
    await $('[data-testid="botao-recuperar-senha"]').click();
    await browser.pause(1000);
    await $('[data-testid="input-email-recuperacao-senha"]').setValue('teste20@teste.com');

    await $('[data-testid="botao-avancar"]').click();

    const codeInput = await $('[data-testid="input-codigo-recuperacao-senha"]');
    await codeInput.waitForDisplayed({ timeout: 5000 });

    expect(await codeInput.isDisplayed()).toBe(true);
  });
});