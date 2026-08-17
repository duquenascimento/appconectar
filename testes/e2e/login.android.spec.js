import { expect } from '@wdio/globals';

describe('Tela de Login - Android', () => {

  beforeEach(async () => {
    // Aguarda a tela de login abrir
    await $('~input-email').waitForDisplayed({
      timeout: 20000
    });
  });

  it('deve mostrar erro com e-mail inválido', async () => {

    await $('~input-email').setValue('email-errado.COM');
    await $('~input-senha').setValue('123456');
    await $('~botao-entrar').click();

    const mensagemErro = await $('~mensagem-erro');

    await mensagemErro.waitForDisplayed({
      timeout: 10000
    });

    await expect(mensagemErro).toHaveText(
      expect.stringContaining('Formato de e-mail inválido')
    );
  });

  it('deve mostrar erro com senha ou usuário incorreto', async () => {

    await $('~input-email').setValue('teste@seudominio.com.br');
    await $('~input-senha').setValue('senhaerrada');
    await $('~botao-entrar').click();

    const mensagemErro = await $('~mensagem-erro');

    await mensagemErro.waitForDisplayed({
      timeout: 10000
    });

    await expect(mensagemErro).toHaveText(
      expect.stringContaining('Usuário ou senha inválidos')
    );
  });

  it('deve logar com sucesso e acessar a página de produtos', async () => {

    await $('~input-email').setValue('teste20@teste.com');
    await $('~input-senha').setValue('teste20@teste.com');

    await $('~botao-entrar').click();

    // Aguarda o loading desaparecer (caso exista)
    const loading = await $('~loading');

    if (await loading.isExisting()) {
      await loading.waitForDisplayed({ timeout: 5000 });

      await loading.waitForDisplayed({
        reverse: true,
        timeout: 25000
      });
    }

    const paginaProdutos = await $('~pagina-produtos');

    await paginaProdutos.waitForDisplayed({
      timeout: 25000
    });

    await expect(paginaProdutos).toHaveText('Produtos');
  });

});