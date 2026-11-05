import { expect } from '@wdio/globals';
import { CNPJ_JA_CADASTRADO, criarApiFalsa, EMAIL_JA_CADASTRADO } from './apiFalsa.js';

/**
 * Testes E2E do fluxo de indicação no navegador (CH-753 / CH-715), no computador
 * e no celular (emulação de aparelho do Chrome).
 *
 * Dois modos:
 *
 * 1) API falsa (padrão). O teste sobe uma API local (testes/e2e/apiFalsa.js) e o
 *    web precisa apontar para ela. Não consome CNPJ, não cria conta em homologação
 *    e não manda mensagem no Slack, então qualquer pessoa roda a qualquer hora:
 *
 *      terminal 1:  npm run web:e2e
 *      terminal 2:  npm run teste:web:indicacao
 *
 *    Só prova o front. O contrato real com o backend fica para o modo 2.
 *
 * 2) API real (E2E_MODO=real), com o web em homologação (.env, npm run web). Usa
 *    massa de uso único, informada por variável de ambiente; sem a variável, o
 *    teste que depende dela fica pendente com o motivo no console:
 *
 *      E2E_MODO=real \
 *      E2E_CNPJ_COMPLETO_COMPUTADOR=<cnpj> E2E_CNPJ_COMPLETO_CELULAR=<cnpj> \
 *      E2E_CNPJ_MATRIZ=<cnpj> E2E_CODIGO_TESTE_A=<código> E2E_CODIGO_TESTE_B=<código> \
 *      npm run teste:web:indicacao
 *
 *    - E2E_CNPJ_COMPLETO_*: cada um finaliza um cadastro completo e fica consumido.
 *    - E2E_CNPJ_MATRIZ: fica associado a uma conta em "registering" para sempre,
 *      já que não há endpoint de reset de cadastro no ambiente de teste.
 *    - E2E_CODIGO_TESTE_A/B: dois códigos de promotor de teste (válidos, mas que
 *      não sejam de promotor de verdade). Código inexistente é descartado na
 *      criação da conta, o que invalida a matriz de reset.
 *    Cada execução cria uma conta com código sem promotor (PROMA), e o backend
 *    avisa o canal de bugs e erros do Slack. Mantenha um caso só por execução.
 *    Para rodar de novo, troque os CNPJs por CNPJs novos e válidos.
 *
 * O caso "cadastro em andamento há mais de 30 dias" não é coberto aqui — exigiria
 * forjar a data de criação da conta no backend, sem hook de teste disponível hoje.
 * Fica coberto só pelo teste unitário em src/utils/registerExpiration.spec.ts.
 */
describe('Programa de indicação - Web', () => {
  const APP_URL = 'http://localhost:8081';
  const MODO_REAL = process.env.E2E_MODO === 'real';
  const CEP = '22010020';
  const CNPJ_FALSO = '11.222.333/0001-81';
  const CNPJ_EXISTENTE = CNPJ_JA_CADASTRADO;
  const CNPJ_COMPLETO_COMPUTADOR = MODO_REAL
    ? process.env.E2E_CNPJ_COMPLETO_COMPUTADOR
    : CNPJ_FALSO;
  const CNPJ_COMPLETO_CELULAR = MODO_REAL ? process.env.E2E_CNPJ_COMPLETO_CELULAR : CNPJ_FALSO;
  const CNPJ_MATRIZ = MODO_REAL ? process.env.E2E_CNPJ_MATRIZ : CNPJ_FALSO;
  const CODIGO_TESTE_A = MODO_REAL ? process.env.E2E_CODIGO_TESTE_A : 'PROMOTOR1';
  const CODIGO_TESTE_B = MODO_REAL ? process.env.E2E_CODIGO_TESTE_B : 'PROMOTOR2';
  // No modo real, um código de promotor de verdade, só nos testes de fluxo completo,
  // pra validar de verdade o nome exibido na faixa. É o único lugar onde ele aparece.
  const CODIGO_PROMOTOR = MODO_REAL ? 'VMF47' : 'PROMOTOR1';
  // Código que não pertence a nenhum promotor.
  const CODIGO_SEM_PROMOTOR = MODO_REAL ? 'PROMA' : 'SEMPROMOTOR';
  const SENHA = 'Senha@12345';
  const RESPIRO_ROLAGEM = 16;
  const TOLERANCIA_ROLAGEM = 8;

  const IPHONE = 'iPhone 15';
  const ANDROID = 'Pixel 7';
  const COMPUTADOR = { width: 1280, height: 800, devicePixelRatio: 1 };

  const URL_APP_STORE = 'apps.apple.com';
  const ID_APP_STORE = 'id6471991824';
  const URL_GOOGLE_PLAY = 'play.google.com/store/apps/details?id=io.bubbleapps.app_conectar.twa';

  const api = MODO_REAL ? null : criarApiFalsa();

  let restaurarEmulacao = null;

  function emailUnico(prefixo) {
    return `${prefixo}.${Date.now()}@teste-e2e.com`;
  }

  // Marca o teste como pendente quando falta massa de uso único, dizendo o que falta.
  function exigirMassa(contexto, faltantes) {
    if (!MODO_REAL) return;
    const ausentes = Object.entries(faltantes)
      .filter(([, valor]) => !valor)
      .map(([nome]) => nome);
    if (ausentes.length > 0) {
      console.log(`[pendente] "${contexto.test.title}" — defina: ${ausentes.join(', ')}`);
      contexto.skip();
    }
  }

  async function usarComputador() {
    if (restaurarEmulacao) {
      await restaurarEmulacao();
      restaurarEmulacao = null;
    }
    await browser.setViewport(COMPUTADOR);
  }

  // A emulação de aparelho troca largura, user agent e proporção de pixels, e vale
  // para as próximas navegações do teste. Só mexe na sessão de quem a chama.
  async function emularCelular(dispositivo) {
    await usarComputador();
    restaurarEmulacao = await browser.emulate('device', dispositivo);
    await ligarToque();
  }

  // O navegador do celular tem toque, e é por isso que o Tamagui escolhe a folha em vez
  // do modal. A emulação de aparelho do WebdriverIO não liga o toque sozinha.
  async function ligarToque() {
    const contexto = await browser.getWindowHandle();
    await browser.send({
      method: 'emulation.setTouchOverride',
      params: { maxTouchPoints: 5, contexts: [contexto] },
    });
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

  // Na landing, "faixa ausente" e "ainda carregando" são idênticos no DOM. Esperar a
  // resposta de /register/promoter-name evita afirmar a ausência cedo demais.
  async function esperarConsultaDoPromotor() {
    await browser.waitUntil(
      () =>
        browser.execute(() =>
          performance
            .getEntriesByType('resource')
            .some((r) => r.name.includes('/register/promoter-name') && r.responseEnd > 0),
        ),
      { timeout: 20000, timeoutMsg: 'A consulta do promotor não terminou' },
    );
    await browser.pause(500);
  }

  async function existeNoDom(testId) {
    return (await $$(`[data-testid="${testId}"]`).length) > 0;
  }

  // Retângulo do elemento em relação à janela, ou null se não existir.
  async function retangulo(testId) {
    return browser.execute((seletor) => {
      const el = document.querySelector(seletor);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, altura: window.innerHeight };
    }, `[data-testid="${testId}"]`);
  }

  // Retângulo de um elemento que precisa estar inteiro dentro da janela.
  async function expectDentroDaJanela(testId, onde) {
    const r = await browser.execute((seletor) => {
      const el = document.querySelector(seletor);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        top: b.top,
        bottom: b.bottom,
        left: b.left,
        right: b.right,
        alturaJanela: window.innerHeight,
        larguraJanela: window.innerWidth,
      };
    }, `[data-testid="${testId}"]`);
    if (!r) throw new Error(`${testId} ausente (${onde})`);
    const dentro =
      r.top >= 0 && r.bottom <= r.alturaJanela && r.left >= 0 && r.right <= r.larguraJanela;
    if (!dentro) throw new Error(`${testId} fora da área visível (${onde}): ${JSON.stringify(r)}`);
  }

  async function semRolagemHorizontal(onde) {
    const medidas = await browser.execute(() => ({
      documento: document.documentElement.scrollWidth,
      corpo: document.body.scrollWidth,
      janela: window.innerWidth,
    }));
    if (medidas.documento > medidas.janela || medidas.corpo > medidas.janela) {
      throw new Error(`Rolagem horizontal em ${onde}: ${JSON.stringify(medidas)}`);
    }
  }

  // Posição vertical (do topo da página) dos elementos, na ordem em que aparecem
  // no DOM de cada seletor. Mede com a página no topo, antes de qualquer rolagem.
  async function topos(testIds) {
    return browser.execute(
      (ids) =>
        ids.map((id) => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          return el ? el.getBoundingClientRect().top : null;
        }),
      testIds,
    );
  }

  function expectEmOrdem(ids, posicoes) {
    posicoes.forEach((posicao, i) => {
      if (posicao === null) throw new Error(`Elemento ausente na landing: ${ids[i]}`);
    });
    for (let i = 1; i < posicoes.length; i += 1) {
      if (posicoes[i] <= posicoes[i - 1]) {
        throw new Error(
          `Ordem errada na landing: ${ids[i]} (${posicoes[i]}) não vem depois de ${ids[i - 1]} (${posicoes[i - 1]})`,
        );
      }
    }
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

  // O texto do aviso precisa ficar inteiro dentro do quadro, ao lado do ícone.
  async function expectAvisoDentroDoQuadro(idQuadro, idTexto, onde) {
    const m = await browser.execute(
      (quadro, texto) => {
        const q = document.querySelector(`[data-testid="${quadro}"]`);
        const t = document.querySelector(`[data-testid="${texto}"]`);
        if (!q || !t) return null;
        const rq = q.getBoundingClientRect();
        const rt = t.getBoundingClientRect();
        return { quadroDireita: rq.right, textoDireita: rt.right, textoEsquerda: rt.left, quadroEsquerda: rq.left };
      },
      idQuadro,
      idTexto,
    );
    if (!m) throw new Error(`${idQuadro} ou ${idTexto} ausente (${onde})`);
    if (m.textoDireita > m.quadroDireita + 0.5 || m.textoEsquerda < m.quadroEsquerda - 0.5) {
      throw new Error(`Texto do aviso fora do quadro (${onde}): ${JSON.stringify(m)}`);
    }
  }

  // A lista "Quero receber de" (com o placeholder) tem a mesma altura da lista "Até".
  async function expectListasDeHorarioComAMesmaAltura(onde) {
    const m = await browser.execute(() => {
      const altura = (id) => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        return el ? el.getBoundingClientRect().height : null;
      };
      return {
        minimo: altura('register-select-horario-minimo'),
        maximo: altura('register-select-horario-maximo'),
      };
    });
    const placeholder = await browser.execute(() => {
      const caixa = document.querySelector('[data-testid="register-select-horario-minimo"]');
      if (!caixa) return null;
      const texto = Array.from(caixa.querySelectorAll('*')).find(
        (el) => el.children.length === 0 && el.textContent.trim() === 'Escolha um horário',
      );
      if (!texto) return null;
      const estilo = getComputedStyle(texto);
      const r = texto.getBoundingClientRect();
      return {
        altura: r.height,
        largura: r.width,
        larguraDoTexto: texto.scrollWidth,
        fonte: parseFloat(estilo.fontSize),
      };
    });
    console.log(`[medida] ${onde}: ${JSON.stringify({ ...m, placeholder })}`);
    if (!placeholder) throw new Error(`Placeholder da lista "Quero receber de" ausente (${onde})`);
    if (placeholder.altura > placeholder.fonte * 1.6) {
      throw new Error(`Placeholder em mais de uma linha (${onde}): ${JSON.stringify(placeholder)}`);
    }
    if (m.minimo === null || m.maximo === null || Math.abs(m.minimo - m.maximo) > 0.5) {
      throw new Error(`Listas de horário com alturas diferentes (${onde}): ${JSON.stringify(m)}`);
    }
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
    await expectAvisoDentroDoQuadro('register-aviso-prazos', 'register-aviso-prazos-texto', 'etapa Contato');
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
    await expectAvisoDentroDoQuadro('register-aviso-horario', 'register-aviso-horario-texto', 'etapa Entrega');
    await expectListasDeHorarioComAMesmaAltura('etapa Entrega');
    await selecionarDropdown('register-select-horario-minimo', '09:00');
    // O horário final é auto-sugerido ao escolher o inicial (respeita 1h30 de diferença mínima)
    await selecionarDropdown('register-select-frequencia-pedidos', '3 dias');
    await $('[data-testid="register-input-valor-pedido"]').setValue('300');
    await clicarViaJS('register-botao-avancar');
    await esperarProximoStep('[data-testid="conclusao-titulo"]', 'step3->finalizado');
  }

  // Cria a conta pela landing e percorre as quatro etapas do /register até a
  // conclusão, conferindo o campo do código de indicação (bloqueado e preenchido).
  async function percorrerCadastroAteConclusao({ cnpj, codigo, prefixoEmail, nomeRestaurante }) {
    const email = emailUnico(prefixoEmail);
    await criarConta(email);

    await preencherStep0(cnpj, nomeRestaurante);
    await esperarProximoStep('[data-testid="register-input-cep"]', `step0->step1 (${nomeRestaurante})`);
    await preencherStep1();
    await preencherStep2();

    const codigoIndicacao = await $('[data-testid="invite-code-field"]');
    await codigoIndicacao.waitForDisplayed({ timeout: 20000 });
    expect(await codigoIndicacao.getValue()).toBe(codigo);
    expect(await codigoIndicacao.getAttribute('readonly')).not.toBeNull();

    await finalizarStep3();

    if (api) {
      const conta = api.conta(email);
      expect(conta.inviteCode).toBe(codigo);
      expect(conta.inviteCodeDiscarded).toBe(false);
      expect(conta.cadastroCompleto.inviteCode).toBe(codigo);
    }
  }

  // Troca window.open por uma função que guarda o endereço, para conferir para onde
  // o botão da loja aponta sem abrir a loja.
  async function interceptarAberturaDeLoja() {
    await browser.execute(() => {
      window.__urlsAbertas = [];
      window.open = (url) => {
        window.__urlsAbertas.push(String(url));
        return null;
      };
    });
  }

  async function urlAbertaPeloBotao(testId) {
    await browser.execute(() => {
      window.__urlsAbertas = [];
    });
    const botao = await $(`[data-testid="${testId}"]`);
    await botao.waitForDisplayed({ timeout: 10000 });
    await botao.click();
    await browser.waitUntil(
      async () => (await browser.execute(() => window.__urlsAbertas.length)) > 0,
      { timeout: 5000, timeoutMsg: `O botão ${testId} não abriu nenhuma loja` },
    );
    const urls = await browser.execute(() => window.__urlsAbertas);
    return decodeURIComponent(urls[0]);
  }

  async function lojaDoAparelhoVemPrimeiro(primeira, segunda) {
    const [topoPrimeira, topoSegunda] = await topos([
      `loja-botao-${primeira}`,
      `loja-botao-${segunda}`,
    ]);
    expect(topoPrimeira).not.toBeNull();
    expect(topoSegunda).not.toBeNull();
    expect(topoPrimeira).toBeLessThan(topoSegunda);
  }

  before(async function () {
    if (MODO_REAL) return;
    this.timeout(90000);

    await api.iniciar();

    // O web só conversa com a API falsa se foi iniciado com `npm run web:e2e`. Se
    // estiver apontando para homologação, os testes criariam contas de verdade.
    await browser.url(`${APP_URL}/cadastro?indicacao=${CODIGO_PROMOTOR}`);
    try {
      await browser.waitUntil(
        async () => api.requisicoes('GET', '/register/promoter-name').length > 0,
        { timeout: 60000 },
      );
    } catch {
      throw new Error(
        'O web não está falando com a API falsa (http://localhost:3333). ' +
          'Inicie com `npm run web:e2e` ou use E2E_MODO=real.',
      );
    }

    // ViaCEP é um serviço público de terceiros; no modo falso a resposta é fixa.
    const viaCep = await browser.mock('https://viacep.com.br/ws/**');
    viaCep.respond(
      { logradouro: 'Rua Teste', bairro: 'Centro', localidade: 'Rio de Janeiro', uf: 'RJ' },
      {
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      },
    );
  });

  beforeEach(async () => {
    if (api) api.reiniciarRegistro();
    await usarComputador();
  });

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

  after(async () => {
    await usarComputador();
    if (api) {
      const naoSimuladas = api.naoSimuladas();
      if (naoSimuladas.length > 0) {
        console.log(`Rotas chamadas e não simuladas pela API falsa: ${naoSimuladas.join(', ')}`);
      }
      await api.parar();
    }
  });

  describe('computador', () => {
    it('landing com código de promotor mostra faixa, chip e formulário sem rolar e finaliza o cadastro', async function () {
      // Fluxo completo (criar conta + 4 steps + chamadas reais de CNPJ/ViaCEP) é
      // mais lento que o timeout padrão do mochaOpts (40s).
      this.timeout(180000);
      exigirMassa(this, { E2E_CNPJ_COMPLETO_COMPUTADOR: CNPJ_COMPLETO_COMPUTADOR });

      await limparSessao();
      await acessarAplicacao(`/cadastro?indicacao=${CODIGO_PROMOTOR}`);

      // A faixa (PromoterBanner.tsx) só renderiza quando getPromoterNameByCode resolve
      // um nome de verdade (sem fallback genérico). Por isso usamos aqui um código
      // de promotor REAL, diferente do fictício usado nos outros testes.
      const banner = await $('[data-testid="cadastro-banner-indicacao"]');
      await banner.waitForDisplayed({ timeout: 20000 });
      expect(await banner.getText()).toContain('indicado');
      if (!MODO_REAL) expect(await banner.getText()).toContain('Promotora Teste Um');
      await $('[data-testid="cadastro-chip-codigo-indicacao"]').waitForDisplayed({ timeout: 5000 });
      await $('[data-testid="cadastro-titulo-landing"]').waitForDisplayed({ timeout: 5000 });

      // Faixa, chip e formulário inteiro (até o botão "Cadastrar") na primeira tela.
      for (const id of [
        'cadastro-banner-indicacao',
        'cadastro-chip-codigo-indicacao',
        'cadastro-cartao-formulario',
        'cadastro-botao-cadastrar',
      ]) {
        const r = await retangulo(id);
        expect(r).not.toBeNull();
        expect(r.top).toBeGreaterThanOrEqual(0);
        expect(r.bottom).toBeLessThanOrEqual(r.altura);
      }

      await percorrerCadastroAteConclusao({
        cnpj: CNPJ_COMPLETO_COMPUTADOR,
        codigo: CODIGO_PROMOTOR,
        prefixoEmail: 'indicacao.completo',
        nomeRestaurante: 'Restaurante Teste Indicacao Computador',
      });

      // Computador: sem botões das lojas e com o botão "Continuar".
      expect(await existeNoDom('loja-botao-ios')).toBe(false);
      expect(await existeNoDom('loja-botao-android')).toBe(false);
      expect(await existeNoDom('conclusao-convite')).toBe(false);
      expect(await existeNoDom('conclusao-continuar-web')).toBe(false);
      const continuar = await $('[data-testid="conclusao-continuar"]');
      await continuar.waitForDisplayed({ timeout: 10000 });
      expect(await continuar.getText()).toContain('Continuar');
    });

    it('landing com código sem promotor não mostra faixa nem chip, e o /register não mostra o campo do código', async function () {
      this.timeout(90000);

      await limparSessao();
      await acessarAplicacao(`/cadastro?indicacao=${CODIGO_SEM_PROMOTOR}`);

      await $('[data-testid="cadastro-titulo-landing"]').waitForDisplayed({ timeout: 20000 });
      await esperarConsultaDoPromotor();

      expect(await existeNoDom('cadastro-banner-indicacao')).toBe(false);
      expect(await existeNoDom('cadastro-chip-codigo-indicacao')).toBe(false);
      expect(await $$('[data-testid="cadastro-cartao-beneficio"]').length).toBe(4);
      await $('[data-testid="cadastro-cartao-formulario"]').waitForDisplayed({ timeout: 5000 });

      // No modo real, cada criação de conta com código inválido manda uma mensagem
      // real no Slack.
      const email = emailUnico('indicacao.sem.promotor');
      await criarConta(email);

      await $('[data-testid="register-input-nome-restaurante"]').waitForDisplayed({ timeout: 20000 });

      // O campo do código só existe na última etapa do /register. No modo real,
      // chegar lá consumiria um CNPJ; no modo falso, o teste percorre as etapas.
      if (api) {
        const conta = api.conta(email);
        expect(conta.inviteCode).toBe(CODIGO_SEM_PROMOTOR);
        expect(conta.inviteCodeDiscarded).toBe(true);

        await preencherStep0(CNPJ_FALSO, 'Restaurante Teste Sem Promotor');
        await esperarProximoStep('[data-testid="register-input-cep"]', 'sem promotor: step0->step1');
        await preencherStep1();
        await preencherStep2();
        await $('[data-testid="register-select-horario-minimo"]').waitForDisplayed({ timeout: 20000 });
        expect(await existeNoDom('invite-code-field')).toBe(false);
      }
    });

    it('landing enquanto a consulta do promotor demora: sem faixa nem chip, e a faixa aparece quando responde', async function () {
      if (MODO_REAL) this.skip();
      this.timeout(60000);

      await limparSessao();
      await browser.url(`${APP_URL}/cadastro?indicacao=LENTO1`);

      await $('[data-testid="cadastro-titulo-landing"]').waitForDisplayed({ timeout: 20000 });
      await $('[data-testid="cadastro-cartao-formulario"]').waitForDisplayed({ timeout: 5000 });
      expect(await existeNoDom('cadastro-banner-indicacao')).toBe(false);
      expect(await existeNoDom('cadastro-chip-codigo-indicacao')).toBe(false);

      await $('[data-testid="cadastro-banner-indicacao"]').waitForDisplayed({ timeout: 15000 });
      expect(await $('[data-testid="cadastro-banner-indicacao"]').getText()).toContain(
        'Promotor Lento',
      );
      await $('[data-testid="cadastro-chip-codigo-indicacao"]').waitForDisplayed({ timeout: 5000 });
    });

    it('landing quando a consulta do promotor falha: sem faixa, com o chip do código, e o cadastro continua', async function () {
      if (MODO_REAL) this.skip();
      this.timeout(90000);

      await limparSessao();
      await browser.url(`${APP_URL}/cadastro?indicacao=FALHA1`);

      await $('[data-testid="cadastro-titulo-landing"]').waitForDisplayed({ timeout: 20000 });
      await esperarConsultaDoPromotor();
      await $('[data-testid="cadastro-chip-codigo-indicacao"]').waitForDisplayed({ timeout: 10000 });
      expect(await existeNoDom('cadastro-banner-indicacao')).toBe(false);

      // Falha na consulta não é código inválido: o código segue com a conta.
      const email = emailUnico('indicacao.consulta.falhou');
      await criarConta(email);
      await $('[data-testid="register-input-nome-restaurante"]').waitForDisplayed({ timeout: 20000 });
      const conta = api.conta(email);
      expect(conta.inviteCode).toBe('FALHA1');
      expect(conta.inviteCodeDiscarded).toBe(false);
    });

    it('cadastro sem código mostra a tela de sempre, sem landing', async () => {
      await limparSessao();
      await acessarAplicacao('/cadastro');

      await $('[data-testid="cadastro-input-nome"]').waitForDisplayed({ timeout: 20000 });
      expect(await existeNoDom('cadastro-titulo-landing')).toBe(false);
      expect(await existeNoDom('cadastro-cartao-formulario')).toBe(false);
      expect(await existeNoDom('cadastro-banner-indicacao')).toBe(false);
      expect(await existeNoDom('cadastro-chip-codigo-indicacao')).toBe(false);
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
      exigirMassa(this, {
        E2E_CNPJ_MATRIZ: CNPJ_MATRIZ,
        E2E_CODIGO_TESTE_A: CODIGO_TESTE_A,
        E2E_CODIGO_TESTE_B: CODIGO_TESTE_B,
      });

      await limparSessao();
      await acessarAplicacao('/cadastro');
      await criarConta(emailUnico('indicacao.matriz'));

      // Sem indicação: preenche step 0 e avança pro step 1
      await preencherStep0(CNPJ_MATRIZ, 'Restaurante Teste Indicacao Matriz');
      await esperarProximoStep('[data-testid="register-input-cep"]', 'matriz: step0->step1 (1a vez)');

      // Revisita com um código novo (não havia nenhum antes) -> reseta pro step 0
      await acessarAplicacao(`/cadastro?indicacao=${CODIGO_TESTE_A}`);
      await esperarProximoStep(
        '[data-testid="register-input-documento"]',
        'matriz: revisita com código novo -> reset',
      );
      const documentoAposReset1 = await $('[data-testid="register-input-documento"]');
      expect(await documentoAposReset1.getValue()).toBe('');

      // Repreenche o step 0 (perdido no reset) e avança pro step 1 de novo
      await preencherStep0(CNPJ_MATRIZ, 'Restaurante Teste Indicacao Matriz');
      await esperarProximoStep('[data-testid="register-input-cep"]', 'matriz: step0->step1 (2a vez)');

      // Revisita com o MESMO código -> sem reset, continua no step 1
      await acessarAplicacao(`/cadastro?indicacao=${CODIGO_TESTE_A}`);
      await esperarProximoStep(
        '[data-testid="register-input-cep"]',
        'matriz: revisita com mesmo código -> sem reset',
      );

      // Revisita com um código DIFERENTE -> reseta de novo pro step 0
      await acessarAplicacao(`/cadastro?indicacao=${CODIGO_TESTE_B}`);
      await esperarProximoStep(
        '[data-testid="register-input-documento"]',
        'matriz: revisita com código diferente -> reset',
      );
      const documentoAposReset2 = await $('[data-testid="register-input-documento"]');
      expect(await documentoAposReset2.getValue()).toBe('');
    });
  });

  describe('celular', () => {
    for (const aparelho of [IPHONE, ANDROID]) {
      it(`landing no ${aparelho} segue a ordem do template, sem rolagem horizontal, e "Criar minha conta" leva ao formulário`, async function () {
        this.timeout(90000);

        await limparSessao();
        await emularCelular(aparelho);
        await acessarAplicacao(`/cadastro?indicacao=${CODIGO_SEM_PROMOTOR}`);

        await $('[data-testid="cadastro-titulo-landing"]').waitForDisplayed({ timeout: 20000 });
        await esperarConsultaDoPromotor();

        // Sem promotor, não há faixa: o resto da ordem do template continua.
        const ids = [
          'cadastro-titulo-landing',
          'cadastro-botao-criar-conta',
          'cadastro-cartao-beneficio',
          'cadastro-cartao-formulario',
        ];
        expectEmOrdem(ids, await topos(ids));
        await semRolagemHorizontal(`landing (${aparelho})`);

        expect(
          await $('[data-testid="cadastro-input-nome"]').isDisplayed({ withinViewport: true }),
        ).toBe(false);

        await $('[data-testid="cadastro-botao-criar-conta"]').click();
        // O topo do cartão chega perto do topo da janela, com o respiro de 16 px.
        await browser.waitUntil(
          async () => {
            const r = await retangulo('cadastro-cartao-formulario');
            return Math.abs(r.top - RESPIRO_ROLAGEM) <= TOLERANCIA_ROLAGEM;
          },
          { timeout: 5000, timeoutMsg: 'O topo do formulário não chegou perto do topo da janela' },
        );
        expect(
          await $('[data-testid="cadastro-input-nome"]').isDisplayed({ withinViewport: true }),
        ).toBe(true);
        await semRolagemHorizontal(`landing depois do clique (${aparelho})`);
      });
    }

    for (const aparelho of [IPHONE, ANDROID]) {
      it(`e-mail já usado no ${aparelho} mostra o modal com texto e "Ok" na área visível, e "Ok" fecha`, async function () {
        if (MODO_REAL) this.skip();
        this.timeout(90000);

        await limparSessao();
        await emularCelular(aparelho);
        await acessarAplicacao(`/cadastro?indicacao=${CODIGO_SEM_PROMOTOR}`);
        await $('[data-testid="cadastro-titulo-landing"]').waitForDisplayed({ timeout: 20000 });
        await criarConta(EMAIL_JA_CADASTRADO);

        const erro = await $('[data-testid="validation-dialog-erro"]');
        await erro.waitForDisplayed({ timeout: 20000 });
        expect(await erro.getText()).toContain('Este e-mail já existe na plataforma');
        await expectDentroDaJanela('validation-dialog-erro', aparelho);
        await expectDentroDaJanela('validation-dialog-ok', aparelho);
        await semRolagemHorizontal(`modal de e-mail já usado (${aparelho})`);

        await $('[data-testid="validation-dialog-ok"]').click();
        await erro.waitForExist({ reverse: true, timeout: 5000 });
      });
    }

    for (const largura of [360, 390]) {
      it(`avisos e listas de horário do /register cabem em ${largura} px`, async function () {
        if (MODO_REAL) this.skip();
        this.timeout(120000);

        await limparSessao();
        await usarComputador();
        await browser.setViewport({ width: largura, height: 800, devicePixelRatio: 2 });
        await acessarAplicacao(`/cadastro?indicacao=${CODIGO_SEM_PROMOTOR}`);
        await criarConta(emailUnico(`indicacao.${largura}`));

        await preencherStep0(CNPJ_COMPLETO_CELULAR, `Restaurante Teste ${largura}`);
        await esperarProximoStep('[data-testid="register-input-cep"]', `step0->step1 (${largura})`);
        await preencherStep1();
        await preencherStep2();

        await $('[data-testid="register-select-horario-minimo"]').waitForDisplayed({ timeout: 20000 });
        await expectAvisoDentroDoQuadro('register-aviso-horario', 'register-aviso-horario-texto', `Entrega, ${largura} px`);
        await expectListasDeHorarioComAMesmaAltura(`Entrega, ${largura} px`);
        await semRolagemHorizontal(`Entrega (${largura} px)`);
      });
    }

    it('fluxo completo no Android: landing, cadastro, conclusão com Google Play primeiro; iPhone com App Store primeiro', async function () {
      this.timeout(240000);
      exigirMassa(this, { E2E_CNPJ_COMPLETO_CELULAR: CNPJ_COMPLETO_CELULAR });

      await limparSessao();
      await emularCelular(ANDROID);
      await acessarAplicacao(`/cadastro?indicacao=${CODIGO_PROMOTOR}`);

      await $('[data-testid="cadastro-banner-indicacao"]').waitForDisplayed({ timeout: 20000 });
      const ids = [
        'cadastro-banner-indicacao',
        'cadastro-titulo-landing',
        'cadastro-botao-criar-conta',
        'cadastro-cartao-beneficio',
        'cadastro-cartao-formulario',
      ];
      expectEmOrdem(ids, await topos(ids));
      await semRolagemHorizontal('landing (Android, com promotor)');

      await percorrerCadastroAteConclusao({
        cnpj: CNPJ_COMPLETO_CELULAR,
        codigo: CODIGO_PROMOTOR,
        prefixoEmail: 'indicacao.celular',
        nomeRestaurante: 'Restaurante Teste Indicacao Celular',
      });
      await semRolagemHorizontal('conclusão (Android)');

      await $('[data-testid="conclusao-convite"]').waitForDisplayed({ timeout: 10000 });
      expect(await existeNoDom('conclusao-continuar')).toBe(false);
      await lojaDoAparelhoVemPrimeiro('android', 'ios');

      await interceptarAberturaDeLoja();
      expect(await urlAbertaPeloBotao('loja-botao-android')).toContain(URL_GOOGLE_PLAY);
      const urlAppStoreNoAndroid = await urlAbertaPeloBotao('loja-botao-ios');
      expect(urlAppStoreNoAndroid).toContain(URL_APP_STORE);
      expect(urlAppStoreNoAndroid).toContain(ID_APP_STORE);

      // A mesma conclusão no iPhone: a sessão do cadastro continua valendo.
      await emularCelular(IPHONE);
      await acessarAplicacao('/registerFinished');
      await $('[data-testid="conclusao-titulo"]').waitForDisplayed({ timeout: 20000 });
      await semRolagemHorizontal('conclusão (iPhone)');
      await lojaDoAparelhoVemPrimeiro('ios', 'android');

      await interceptarAberturaDeLoja();
      const urlAppStore = await urlAbertaPeloBotao('loja-botao-ios');
      expect(urlAppStore).toContain(URL_APP_STORE);
      expect(urlAppStore).toContain(ID_APP_STORE);
      expect(await urlAbertaPeloBotao('loja-botao-android')).toContain(URL_GOOGLE_PLAY);

      await $('[data-testid="conclusao-continuar-web"]').click();
      await browser.waitUntil(async () => (await browser.getUrl()).includes('/products'), {
        timeout: 20000,
        timeoutMsg: '"Continuar na web" não levou para a tela de produtos',
      });
    });
  });
});
