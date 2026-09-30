import { expect } from '@wdio/globals';

/**
 * Testes E2E do fluxo de indicação (CH-753 / CH-715).
 *
 * Fixtures de uso único: CNPJ_A e CNPJ_B ficam "consumidos" no ambiente de teste
 * depois da primeira execução (CNPJ_A finaliza um cadastro completo; CNPJ_B fica
 * associado a uma conta em "registering" para sempre, já que não há endpoint de
 * reset de cadastro no ambiente de teste). Para rodar a suíte de novo, troque por
 * CNPJs novos e válidos.
 *
 * O caso "cadastro em andamento há mais de 30 dias" não é coberto aqui — exigiria
 * forjar a data de criação da conta no backend, sem hook de teste disponível hoje.
 * Fica coberto só pelo teste unitário em src/utils/registerExpiration.spec.ts.
 */
describe('Programa de indicação - Web', () => {
  const APP_URL = 'http://localhost:8081';
  const CEP = '22010020';
  const CNPJ_A = '39.264.066/0001-24';
  const CNPJ_B = '24.201.731/0001-63';
  const CNPJ_EXISTENTE = '46423800000116';
  const CODIGO_A = 'PROMA';
  const CODIGO_B = 'PROMB';
  // Código de promotor real (fornecido pelo usuário) — usado só no teste de
  // fluxo completo, pra validar de verdade o nome exibido no banner. PROMA/PROMB
  // continuam fictícios no teste de matriz de reset (que nunca finaliza o
  // cadastro) pra não gerar atribuição de lead real pra um promotor de verdade.
  const CODIGO_PROMOTOR_REAL = 'VMF47';
  const SENHA = 'Senha@12345';

  function emailUnico(prefixo) {
    return `${prefixo}.${Date.now()}@teste-e2e.com`;
  }

  // Limpa cookies/localStorage e garante que a sessão do browser começa
  // desautenticada. Necessário porque o Firefox mantém a mesma sessão entre os
  // `it()`s da suíte: sem isso, um teste anterior que criou conta (mesmo sem
  // finalizar o cadastro) deixaria o próximo teste "preso" em /register, já que
  // o useAuthGuard redireciona /cadastro -> /register para quem já é "registering".
  // Chamar só uma vez no início de cada `it()` — os revisits internos de um mesmo
  // teste (matriz de reset) usam acessarAplicacao() sem limpar, propositalmente.
  async function limparSessao() {
    await browser.url(`${APP_URL}/`);
    await browser.pause(500);
    await browser.execute(() => {
      try {
        localStorage.clear();
      } catch {
        // ignorar (ex.: acesso a localStorage bloqueado)
      }
    });
    await browser.deleteCookies();
  }

  // Clica via DOM (bypassa a checagem de "obscured" do WebDriver). Necessário
  // porque o container do DropDownPicker às vezes deixa uma View absoluta
  // sobrepondo o botão logo abaixo, mesmo já fechado — artefato conhecido dessa
  // lib no React Native Web, não um bloqueio real para quem usa a tela.
  async function clicarViaJS(testId) {
    await browser.execute((seletor) => {
      const el = document.querySelector(seletor);
      if (el) el.click();
    }, `[data-testid="${testId}"]`);
  }

  // Espera o marcador do próximo step aparecer; se não aparecer, salva um
  // screenshot e tenta extrair mensagens de erro de validação visíveis na
  // página, pra transformar um timeout genérico em algo diagnosticável.
  async function esperarProximoStep(selector, contexto) {
    try {
      await $(selector).waitForDisplayed({ timeout: 15000 });
    } catch {
      const nomeArquivo = `testes/e2e/__falha-${contexto.replace(/[^a-z0-9]+/gi, '-')}-${Date.now()}.png`;
      try {
        await browser.saveScreenshot(nomeArquivo);
      } catch {
        // ignora falha ao salvar screenshot
      }

      let erros = [];
      try {
        const html = await browser.getPageSource();
        erros = [...html.matchAll(/>([^<]*(?:obrigat[óo]ri[ao]s?|inv[áa]lid[ao]s?)[^<]*)</gi)]
          .map((m) => m[1].trim())
          .filter(Boolean);
      } catch {
        // ignora falha ao capturar page source
      }

      throw new Error(
        `[${contexto}] Não chegou no elemento esperado (${selector}). ` +
          `Erros de validação visíveis na tela: ${erros.length ? erros.join(' | ') : 'nenhum encontrado'}. ` +
          `Screenshot salvo em ${nomeArquivo}`,
      );
    }
  }

  async function acessarAplicacao(path) {
    await browser.url(`${APP_URL}${path}`);
    await browser.pause(2000);

    // Caso apareça a tela do ngrok, clica em "Visit Site" / "Visitar Site"
    try {
      const botaoVisitar = await $('button=Visit Site');
      if (await botaoVisitar.isExisting()) {
        await botaoVisitar.click();
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
  }

  // Abre um DropDownPicker pelo testID do seletor fechado e clica na opção pelo
  // TEXTO visível (via JS direto). O react-native-dropdown-picker não repassa
  // o testID por item pro DOM no modo listMode="SCROLLVIEW" (confirmado: o item
  // renderiza só com a classe/estrutura padrão, sem data-testid) — casar pelo
  // texto do próprio label é a forma confiável de selecionar aqui.
  async function selecionarDropdown(testId, textoOpcao) {
    await $(`[data-testid="${testId}"]`).click();
    await browser.pause(500);

    const clicou = await browser.execute((texto) => {
      const candidatos = Array.from(document.querySelectorAll('[tabindex="0"]'));
      const alvo = candidatos.find((el) => el.textContent && el.textContent.trim() === texto);
      if (alvo) {
        alvo.click();
        return true;
      }
      return false;
    }, textoOpcao);

    if (!clicou) {
      const debugInfo = await browser.execute((sel) => {
        const picker = document.querySelector(sel);
        if (!picker) return 'Seletor fechado não encontrado no DOM.';
        const container = picker.parentElement || picker;
        return container.outerHTML.slice(0, 4000);
      }, `[data-testid="${testId}"]`);

      throw new Error(
        `Dropdown "${testId}" não encontrou a opção com texto "${textoOpcao}". ` +
          `HTML ao redor do seletor fechado:\n${debugInfo}`,
      );
    }

    await browser.pause(300);
  }

  async function criarConta(email) {
    await $('[data-testid="cadastro-input-nome"]').waitForDisplayed({ timeout: 20000 });
    await $('[data-testid="cadastro-input-nome"]').setValue('Usuário Teste Indicação');
    await selecionarDropdown('cadastro-select-cargo', 'Gerente');
    await $('[data-testid="cadastro-input-telefone"]').setValue('(99) 99999-9999');
    await $('[data-testid="cadastro-input-email"]').setValue(email);
    await $('[data-testid="cadastro-input-senha"]').setValue(SENHA);
    await $('[data-testid="cadastro-input-confirmar-senha"]').setValue(SENHA);
    await clicarViaJS('cadastro-botao-cadastrar');
  }

  async function preencherStep0(documento, nomeRestaurante) {
    await $('[data-testid="register-input-nome-restaurante"]').waitForDisplayed({ timeout: 20000 });
    await $('[data-testid="register-input-nome-restaurante"]').setValue(nomeRestaurante);
    await $('[data-testid="register-input-documento"]').setValue(documento);
    await clicarViaJS('register-botao-avancar');
  }

  async function preencherStep1() {
    await $('[data-testid="register-input-cep"]').waitForDisplayed({ timeout: 20000 });
    await $('[data-testid="register-input-cep"]').setValue(CEP);
    // Aguarda o autofill via ViaCEP (bairro/logradouro/tipo de logradouro)
    await browser.pause(3000);

    await $('[data-testid="register-input-numero"]').setValue('100');

    // A inscrição estadual pode já vir preenchida pela consulta do CNPJ feita no
    // step 0 (handleDocumentValidation); só preenche manualmente se ainda vazia.
    const inscricaoEstadual = await $('[data-testid="register-input-inscricao-estadual"]');
    if (await inscricaoEstadual.isExisting()) {
      const valorAtual = await inscricaoEstadual.getValue();
      if (!valorAtual) {
        await inscricaoEstadual.setValue('12345678');
      }
    }

    await clicarViaJS('register-botao-avancar');
    await esperarProximoStep('[data-testid="register-input-email"]', 'step1->step2');
  }

  async function preencherStep2() {
    await $('[data-testid="register-input-email"]').waitForDisplayed({ timeout: 20000 });
    await $('[data-testid="register-input-email"]').setValue(emailUnico('contato'));
    await selecionarDropdown('register-select-forma-pagamento', 'Diário: 7 dias após a entrega');
    await $('[data-testid="register-input-responsavel-financeiro"]').setValue(
      'Responsavel Financeiro Teste',
    );
    await $('[data-testid="register-input-telefone-financeiro"]').setValue('(99) 98888-8888');
    await $('[data-testid="register-input-email-cobranca"]').setValue(emailUnico('cobranca'));
    await clicarViaJS('register-botao-avancar');
    await esperarProximoStep('[data-testid="register-select-horario-minimo"]', 'step2->step3');
  }

  async function finalizarStep3() {
    await $('[data-testid="register-select-horario-minimo"]').waitForDisplayed({ timeout: 20000 });
    await selecionarDropdown('register-select-horario-minimo', '09:00');
    // O horário final é auto-sugerido ao escolher o inicial (respeita 1h30 de diferença mínima)
    await selecionarDropdown('register-select-frequencia-pedidos', '3 dias');
    await $('[data-testid="register-input-valor-pedido"]').setValue('300');
    await clicarViaJS('register-botao-avancar');
    await esperarProximoStep('div=Cadastro feito!', 'step3->finalizado');
  }

  // Se um teste falhar, despeja o console do navegador — ajuda a pegar erros de
  // JS que o WebDriver não reporta (precisa de 'goog:loggingPrefs' no wdio.web.conf.js).
  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const logs = await browser.getLogs('browser');
        if (logs.length === 0) {
          console.log('--- Console do navegador: vazio (ou não suportado neste driver) ---');
        } else {
          console.log('--- Console do navegador ---');
          logs.forEach((entry) => console.log(`[${entry.level}] ${entry.message}`));
        }
      } catch (err) {
        console.log(`Não foi possível capturar o console do navegador: ${err.message}`);
      }
    }
  });

  it('cadastro completo com código de indicação aplica o código e finaliza', async function () {
    // Fluxo completo (criar conta + 4 steps + chamadas reais de CNPJ/ViaCEP) é
    // mais lento que o timeout padrão do mochaOpts (40s).
    this.timeout(120000);

    await limparSessao();
    await acessarAplicacao(`/cadastro?indicacao=${CODIGO_PROMOTOR_REAL}`);

    // O banner (SignUpWeb.tsx) só renderiza quando getPromoterNameByCode resolve
    // um nome de verdade (props.promoterName ? ... : null — sem fallback genérico).
    // Por isso usamos aqui um código de promotor REAL (fornecido pelo usuário),
    // diferente do PROMA/PROMB fictícios usados no teste de matriz de reset.
    const banner = await $('[data-testid="cadastro-banner-indicacao"]');
    await banner.waitForDisplayed({ timeout: 20000 });
    expect(await banner.getText()).toContain('indicado');

    await criarConta(emailUnico('indicacao.completo'));

    await preencherStep0(CNPJ_A, 'Restaurante Teste Indicacao A');
    await esperarProximoStep('[data-testid="register-input-cep"]', 'step0->step1 (CNPJ_A)');
    await preencherStep1();
    await preencherStep2();

    const codigoIndicacao = await $('[data-testid="invite-code-field"]');
    await codigoIndicacao.waitForDisplayed({ timeout: 20000 });
    expect(await codigoIndicacao.getValue()).toBe(CODIGO_PROMOTOR_REAL);
    expect(await codigoIndicacao.getAttribute('readonly')).not.toBeNull();

    // finalizarStep3() já espera "Cadastro feito!" (com diagnóstico em caso de falha).
    await finalizarStep3();
  });

  it('documento já cadastrado direciona para modal de contato com a OP', async () => {
    await limparSessao();
    await acessarAplicacao('/cadastro');
    await criarConta(emailUnico('indicacao.existente'));

    await preencherStep0(CNPJ_EXISTENTE, 'Restaurante Documento Existente');

    const erro = await $('[data-testid="validation-dialog-erro"]');
    await erro.waitForDisplayed({ timeout: 20000 });
    expect(await erro.getText()).toContain('já existe na plataforma');

    const botaoSuporte = await $('[data-testid="validation-dialog-suporte"]');
    expect(await botaoSuporte.isExisting()).toBe(true);
  });

  it('erro de validação no cadastro de conta exibe modal com mensagem correta', async () => {
    await limparSessao();
    await acessarAplicacao('/cadastro');

    await $('[data-testid="cadastro-input-nome"]').waitForDisplayed({ timeout: 20000 });
    await $('[data-testid="cadastro-input-nome"]').setValue('Usuário Teste Validação');
    await selecionarDropdown('cadastro-select-cargo', 'Gerente');
    await $('[data-testid="cadastro-input-telefone"]').setValue('(21) 99999-9999');
    await $('[data-testid="cadastro-input-email"]').setValue('email-invalido');
    await $('[data-testid="cadastro-input-senha"]').setValue(SENHA);
    await $('[data-testid="cadastro-input-confirmar-senha"]').setValue(SENHA);
    await clicarViaJS('cadastro-botao-cadastrar');

    const erro = await $('[data-testid="validation-dialog-erro"]');
    await erro.waitForDisplayed({ timeout: 10000 });
    expect(await erro.getText()).toMatch('Formato de e-mail inválido');
  });

  it('matriz de reset do código de indicação ao retomar cadastro', async function () {
    // Envolve 4 navegações completas (reload) + preenchimento repetido do step 0.
    this.timeout(120000);

    await limparSessao();
    await acessarAplicacao('/cadastro');
    await criarConta(emailUnico('indicacao.matriz'));

    // Sem indicação: preenche step 0 e avança pro step 1
    await preencherStep0(CNPJ_B, 'Restaurante Teste Indicacao B');
    await esperarProximoStep('[data-testid="register-input-cep"]', 'matriz: step0->step1 (1a vez)');

    // Revisita com um código novo (não havia nenhum antes) -> reseta pro step 0
    await acessarAplicacao(`/cadastro?indicacao=${CODIGO_A}`);
    await esperarProximoStep(
      '[data-testid="register-input-documento"]',
      'matriz: revisita com código novo -> reset',
    );
    const documentoAposReset1 = await $('[data-testid="register-input-documento"]');
    expect(await documentoAposReset1.getValue()).toBe('');

    // Repreenche o step 0 (perdido no reset) e avança pro step 1 de novo
    await preencherStep0(CNPJ_B, 'Restaurante Teste Indicacao B');
    await esperarProximoStep('[data-testid="register-input-cep"]', 'matriz: step0->step1 (2a vez)');

    // Revisita com o MESMO código -> sem reset, continua no step 1
    await acessarAplicacao(`/cadastro?indicacao=${CODIGO_A}`);
    await esperarProximoStep(
      '[data-testid="register-input-cep"]',
      'matriz: revisita com mesmo código -> sem reset',
    );

    // Revisita com um código DIFERENTE -> reseta de novo pro step 0
    await acessarAplicacao(`/cadastro?indicacao=${CODIGO_B}`);
    await esperarProximoStep(
      '[data-testid="register-input-documento"]',
      'matriz: revisita com código diferente -> reset',
    );
    const documentoAposReset2 = await $('[data-testid="register-input-documento"]');
    expect(await documentoAposReset2.getValue()).toBe('');
  });
});
