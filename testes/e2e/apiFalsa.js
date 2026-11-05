import http from 'node:http';

/**
 * API falsa do cadastro, só para os testes e2e do navegador. Responde o mesmo
 * contrato que o app espera do backend (login, cadastro, progresso, promotor),
 * guarda o estado em memória e registra o que o app enviou.
 *
 * O web precisa ter sido iniciado apontando para ela:
 *   npm run web:e2e   (EXPO_PUBLIC_API_URL=http://localhost:3333)
 */

export const PORTA_API_FALSA = 3333;
export const CNPJ_JA_CADASTRADO = '46423800000116';

// Promotores conhecidos pela API falsa. `atrasoMs` e `falha` simulam a consulta
// lenta e a consulta que não consegue confirmar o código.
const PROMOTORES = {
  PROMOTOR1: { nome: 'Promotora Teste Um' },
  PROMOTOR2: { nome: 'Promotor Teste Dois' },
  LENTO1: { nome: 'Promotor Lento', atrasoMs: 4000 },
  FALHA1: { falha: true },
};

const CABECALHOS_CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function base64url(objeto) {
  return Buffer.from(JSON.stringify(objeto)).toString('base64url');
}

function criarToken(usuario) {
  const cabecalho = base64url({ alg: 'HS256', typ: 'JWT' });
  const corpo = base64url({
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    position: usuario.position,
    role: ['registering'],
    restaurant: [],
    active: true,
    createdAt: usuario.createdAt,
  });
  return `${cabecalho}.${corpo}.assinatura-falsa`;
}

function lerCorpo(req) {
  return new Promise((resolve) => {
    const partes = [];
    req.on('data', (parte) => partes.push(parte));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(partes).toString() || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

export function criarApiFalsa() {
  let usuarios = new Map();
  let requisicoes = [];
  let naoSimuladas = new Set();
  let servidor = null;

  function usuarioDaRequisicao(req) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    return usuarios.get(token) || null;
  }

  function responder(res, status, corpo, atrasoMs = 0) {
    const enviar = () => {
      res.writeHead(status, { ...CABECALHOS_CORS, 'content-type': 'application/json' });
      res.end(status === 204 ? undefined : JSON.stringify(corpo));
    };
    if (atrasoMs > 0) setTimeout(enviar, atrasoMs);
    else enviar();
  }

  async function tratar(req, res) {
    const url = new URL(req.url, `http://localhost:${PORTA_API_FALSA}`);
    const caminho = url.pathname;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CABECALHOS_CORS);
      res.end();
      return;
    }

    const corpo = req.method === 'GET' ? {} : await lerCorpo(req);
    requisicoes.push({ metodo: req.method, caminho, consulta: url.search, corpo });

    if (req.method === 'GET' && caminho === '/register/promoter-name') {
      const promotor = PROMOTORES[url.searchParams.get('code')];
      if (promotor?.falha) {
        responder(res, 500, { status: 500, msg: 'Algo de errado aconteceu. Tente novamente mais tarde.' });
        return;
      }
      responder(
        res,
        200,
        { status: 200, data: { name: promotor ? promotor.nome : null } },
        promotor?.atrasoMs,
      );
      return;
    }

    if (req.method === 'POST' && caminho === '/auth/signup') {
      const codigo = corpo.inviteCode;
      const promotor = codigo ? PROMOTORES[codigo] : null;
      const descartado = Boolean(codigo) && !promotor;
      const usuario = {
        id: `usuario-falso-${usuarios.size + 1}-${Date.now()}`,
        name: corpo.name,
        email: corpo.email,
        position: corpo.position,
        createdAt: new Date().toISOString(),
        inviteCode: codigo,
        inviteCodeDiscarded: descartado,
        progresso: null,
        cadastroCompleto: null,
      };
      const token = criarToken(usuario);
      usuarios.set(token, usuario);
      responder(res, 201, {
        status: 201,
        data: { token, role: ['registering'], inviteCodeDiscarded: descartado },
      });
      return;
    }

    if (req.method === 'POST' && caminho === '/register/checkDocument') {
      const documento = String(corpo.document || '').replace(/\D/g, '');
      if (documento === CNPJ_JA_CADASTRADO) {
        responder(res, 400, { status: 400, msg: 'already exists' });
        return;
      }
      responder(res, 200, {
        status: 200,
        data: {
          cnpj: documento,
          razao_social: 'Restaurante Falso LTDA',
          inscricao_estadual: '',
          inscricao_municipal: '',
        },
      });
      return;
    }

    if (caminho === '/register/save-progress' && req.method === 'POST') {
      const usuario = usuarioDaRequisicao(req);
      if (usuario) usuario.progresso = { step: corpo.step, values: corpo.values };
      responder(res, 200, { status: 200 });
      return;
    }

    if (caminho === '/register/progress' && req.method === 'GET') {
      const usuario = usuarioDaRequisicao(req);
      if (!usuario?.progresso) {
        responder(res, 204, null);
        return;
      }
      responder(res, 200, {
        status: 200,
        progress: { ...usuario.progresso, roleUser: 'registering' },
      });
      return;
    }

    if (caminho === '/register/full-register' && req.method === 'POST') {
      const usuario = usuarioDaRequisicao(req);
      if (usuario) usuario.cadastroCompleto = corpo;
      responder(res, 200, { status: 200 });
      return;
    }

    if (caminho === '/restaurant/list' && req.method === 'POST') {
      responder(res, 200, { status: 200, data: [] });
      return;
    }

    naoSimuladas.add(`${req.method} ${caminho}`);
    responder(res, 404, { status: 404, msg: 'Rota não simulada pela API falsa' });
  }

  return {
    iniciar() {
      return new Promise((resolve, reject) => {
        servidor = http.createServer((req, res) => {
          tratar(req, res).catch((erro) => {
            responder(res, 500, { status: 500, msg: String(erro) });
          });
        });
        servidor.once('error', reject);
        servidor.listen(PORTA_API_FALSA, '127.0.0.1', resolve);
      });
    },
    parar() {
      return new Promise((resolve) => {
        if (!servidor) {
          resolve();
          return;
        }
        servidor.close(() => resolve());
        servidor.closeAllConnections();
      });
    },
    reiniciarRegistro() {
      requisicoes = [];
    },
    requisicoes(metodo, caminho) {
      return requisicoes.filter((r) => r.metodo === metodo && r.caminho === caminho);
    },
    // Última conta criada com o e-mail dado.
    conta(email) {
      return [...usuarios.values()].find((u) => u.email === email.toLowerCase()) || null;
    },
    naoSimuladas() {
      return [...naoSimuladas];
    },
  };
}
