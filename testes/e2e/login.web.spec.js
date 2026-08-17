import { expect } from '@wdio/globals';

describe('Tela de Login - Web', () => {
  const APP_URL = 'http://10.0.2.2:8081';

  async function acessarAplicacao() {
    await browser.url(APP_URL);

    // Aguarda a página carregar
    await browser.pause(2000);

    // Caso apareça a tela do ngrok, clica em "Visit Site" / "Visitar Site"
    try {
      const botaoVisitar = await $('button=Visit Site');

      if (await botaoVisitar.isExisting()) {
        await botaoVisitar.click();
        // Aguarda a página carregar
        await browser.pause(2000);
      }
    } catch {
      try {
        const botaoVisitar = await $('button=Visitar Site');

        if (await botaoVisitar.isExisting()) {
          await botaoVisitar.click();
          await browser.pause(2000);
        }
      } catch {
        // Tela do ngrok não apareceu
      }
    }

    await $('[data-testid="input-email"]').waitForDisplayed({
      timeout: 20000
    });
  }

  beforeEach(async () => {
    // await browser.url(APP_URL);
    // await $('[data-testid="input-email"]').waitForDisplayed({ timeout: 20000 });

    acessarAplicacao();
  });

  it('deve mostrar erro com e-mail inválido', async () => {
    await $('[data-testid="input-email"]').setValue('email-errado.COM');
    await $('[data-testid="input-senha"]').setValue('123456');
    await $('[data-testid="botao-entrar"]').click();

    const mensagemErro = await $('[data-testid="mensagem-erro"]');
    await mensagemErro.waitForDisplayed({ timeout: 10000 });
    const texto = await mensagemErro.getText();
    expect(texto).toMatch('Formato de e-mail inválido');
  });

  

  it('deve mostrar erro com senha ou usuário incorreto', async () => {
    await $('[data-testid="input-email"]').setValue('teste@seudominio.com.br');
    await $('[data-testid="input-senha"]').setValue('senhaerrada');
    await $('[data-testid="botao-entrar"]').click();

    const mensagemErro = await $('[data-testid="mensagem-erro"]');
    await mensagemErro.waitForDisplayed({ timeout: 10000 });
    
    // ✅ Correção: primeiro aguarda o texto ser retornado, depois usa trim()
    const texto = (await mensagemErro.getText()).trim();
    
    expect(texto).toContain('Usuário ou senha inválidos');
  });

  it('deve logar com sucesso e acessar a página de produtos', async () => {
    await $('[data-testid="input-email"]').setValue('teste20@teste.com');
    await $('[data-testid="input-senha"]').setValue('teste20@teste.com');
    await $('[data-testid="botao-entrar"]').click();

    // Espera o carregamento terminar
    try {
      await $('[role="progressbar"]').waitForDisplayed({ timeout: 30000 });
    } catch {}
    await $('[role="progressbar"]').waitForDisplayed({ timeout: 25000, reverse: true });

    // Verifica pelo elemento visível (mais confiável que URL)
    const paginaProdutos = await $('[data-testid="pagina-produtos"]');
    await paginaProdutos.waitForDisplayed({ timeout: 25000 });
    expect(await paginaProdutos.getText()).toBe('Meus Restaurantes');
  });
});