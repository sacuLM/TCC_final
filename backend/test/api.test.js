import { after, before, beforeEach, test, mock } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

const usuarios = [];
const avaliacoes = [];
let proximoUsuario = 1;
let proximaAvaliacao = 1;

const tabelaNome = (tabela) => tabela[Symbol.for("drizzle:Name")];

const dbFake = {
  select() {
    let tabela;
    const consulta = {
      from(valor) { tabela = tabelaNome(valor); return consulta; },
      where() { return consulta; },
      orderBy() { return consulta; },
      async limit() { return consulta.exec(); },
      async exec() { return tabela === "users" ? [...usuarios] : [...avaliacoes]; },
      then(resolve, reject) { return consulta.exec().then(resolve, reject); },
    };
    return consulta;
  },
  insert(tabelaSchema) {
    const tabela = tabelaNome(tabelaSchema);
    let valores;
    const consulta = {
      values(valor) { valores = valor; return consulta; },
      onConflictDoNothing() { return consulta; },
      async returning(projecao) {
        if (tabela === "users") {
          if (usuarios.some((usuario) => usuario.email === valores.email)) return [];
          const usuario = { id: proximoUsuario++, email: valores.email, senha: valores.senha };
          usuarios.push(usuario);
          return [{ id: usuario.id, email: usuario.email }];
        }
        const avaliacao = { id_avaliacao: proximaAvaliacao++, ...valores };
        avaliacoes.push(avaliacao);
        return [avaliacao];
      },
    };
    return consulta;
  },
};

mock.module("../src/db/index.js", { namedExports: { db: dbFake } });
process.env.JWT_SECRET = "segredo-de-teste";

let server;
let baseUrl;

before(async () => {
  const { default: app } = await import("../src/app.js");
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

beforeEach(() => {
  usuarios.length = 0;
  avaliacoes.length = 0;
  proximoUsuario = 1;
  proximaAvaliacao = 1;
});

async function requisitar(caminho, { metodo = "GET", corpo, token } = {}) {
  const resposta = await fetch(`${baseUrl}${caminho}`, {
    method: metodo,
    headers: {
      ...(corpo ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
  return { status: resposta.status, dados: await resposta.json() };
}

const usuarioValido = { email: " jogador@example.com ", senha: "senha123" };
const avaliacaoValida = {
  nome: "Jogo de teste", nota: 8.5, resenha: "Muito bom", status: "zerado", genero: "aventura",
};

test("POST /cadastro cria usuário, normaliza e-mail e rejeita dados inválidos e duplicados", async () => {
  const criado = await requisitar("/cadastro", { metodo: "POST", corpo: usuarioValido });
  assert.equal(criado.status, 201);
  assert.deepEqual(criado.dados.usuario, { id: 1, email: "jogador@example.com" });

  const duplicado = await requisitar("/cadastro", { metodo: "POST", corpo: { ...usuarioValido, email: "JOGADOR@example.com" } });
  assert.equal(duplicado.status, 409);

  const senhaCurta = await requisitar("/cadastro", { metodo: "POST", corpo: { email: "a@b.com", senha: "123" } });
  assert.equal(senhaCurta.status, 400);
});

test("POST /login valida credenciais e fornece token utilizável", async () => {
  await requisitar("/cadastro", { metodo: "POST", corpo: usuarioValido });
  const login = await requisitar("/login", { metodo: "POST", corpo: { email: "JOGADOR@example.com", senha: "senha123" } });
  assert.equal(login.status, 200);
  assert.ok(login.dados.token);
  assert.deepEqual(login.dados.usuario, { id: 1, email: "jogador@example.com" });

  const incorreto = await requisitar("/login", { metodo: "POST", corpo: { email: "jogador@example.com", senha: "errada123" } });
  assert.equal(incorreto.status, 401);
  assert.equal((await requisitar("/login", { metodo: "POST", corpo: { email: "", senha: "" } })).status, 400);
});

test("rotas de avaliações exigem token válido", async () => {
  assert.equal((await requisitar("/avaliacoes")).status, 401);
  assert.equal((await requisitar("/avaliacoes", { metodo: "POST", corpo: avaliacaoValida })).status, 401);
  assert.equal((await requisitar("/avaliacoes", { token: "token-invalido" })).status, 403);
});

test("POST e GET /avaliacoes criam e listam avaliações do usuário autenticado", async () => {
  await requisitar("/cadastro", { metodo: "POST", corpo: usuarioValido });
  const { dados: { token } } = await requisitar("/login", { metodo: "POST", corpo: { email: "jogador@example.com", senha: "senha123" } });

  const criada = await requisitar("/avaliacoes", { metodo: "POST", corpo: avaliacaoValida, token });
  assert.equal(criada.status, 201);
  assert.equal(criada.dados.avaliacao.nome, avaliacaoValida.nome);
  assert.equal(criada.dados.avaliacao.id_usuario, 1);

  const listagem = await requisitar("/avaliacoes", { token });
  assert.equal(listagem.status, 200);
  assert.equal(listagem.dados.total, 1);
  assert.equal(listagem.dados.avaliacoes[0].nome, avaliacaoValida.nome);
});

test("POST /avaliacoes rejeita campos obrigatórios ausentes e nota fora do intervalo", async () => {
  await requisitar("/cadastro", { metodo: "POST", corpo: usuarioValido });
  const { dados: { token } } = await requisitar("/login", { metodo: "POST", corpo: { email: "jogador@example.com", senha: "senha123" } });

  const incompleta = await requisitar("/avaliacoes", { metodo: "POST", corpo: { ...avaliacaoValida, resenha: "" }, token });
  assert.equal(incompleta.status, 400);
  const notaInvalida = await requisitar("/avaliacoes", { metodo: "POST", corpo: { ...avaliacaoValida, nota: 11 }, token });
  assert.equal(notaInvalida.status, 400);
});
