# Rotas da API

Este documento descreve os endpoints registrados atualmente pela aplicação Express. O servidor inicia na porta `3000` (ver `index.js`). Os exemplos usam `http://localhost:3000` como endereço base.

Todas as rotas recebem e retornam JSON quando há corpo ou resposta. Para enviar JSON, use o cabeçalho `Content-Type: application/json`.

## Resumo

| Método | Caminho | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/cadastro` | Não | Cria uma conta de usuário |
| `POST` | `/login` | Não | Valida as credenciais e retorna um token JWT |
| `POST` | `/avaliacoes` | Sim | Cadastra uma avaliação para o usuário autenticado |
| `GET` | `/avaliacoes` | Sim | Lista as avaliações do usuário autenticado |

## Autenticação

As rotas de avaliações exigem um token JWT emitido por `/login`. Envie-o no cabeçalho:

```http
Authorization: Bearer <token>
```

O token expira após um dia. Sem token, a API responde `401`; com token inválido ou expirado, responde `403`.

## `POST /cadastro`

Cria um usuário.

### Corpo

```json
{
  "email": "jogador@example.com",
  "senha": "minha-senha-segura"
}
```

O e-mail é removido de espaços nas extremidades e convertido para letras minúsculas. A senha precisa ter pelo menos 8 caracteres.

### Respostas

- `201 Created`: `{ "usuario": { "id": 1, "email": "jogador@example.com" } }`
- `400 Bad Request`: e-mail ausente ou senha inválida.
- `409 Conflict`: já existe uma conta com esse e-mail.
- `500 Internal Server Error`: falha inesperada ao cadastrar.

## `POST /login`

Autentica um usuário e fornece o token para as rotas protegidas.

### Corpo

```json
{
  "email": "jogador@example.com",
  "senha": "minha-senha-segura"
}
```

### Respostas

- `200 OK`:

  ```json
  {
    "mensagem": "Login realizado com sucesso.",
    "usuario": { "id": 1, "email": "jogador@example.com" },
    "token": "<jwt>"
  }
  ```

- `400 Bad Request`: e-mail ou senha ausentes/em formato inválido.
- `401 Unauthorized`: e-mail ou senha incorretos.
- `500 Internal Server Error`: falha inesperada ao autenticar.

## `POST /avaliacoes`

Cadastra uma avaliação associada ao usuário identificado pelo token.

### Cabeçalhos

`Authorization: Bearer <token>`

### Corpo

Todos os campos abaixo são obrigatórios. `nota` deve ser numérica e estar entre `0` e `10`, inclusive.

```json
{
  "nome": "Jogo de exemplo",
  "nota": 8.5,
  "resenha": "Uma experiência muito divertida.",
  "status": "zerado",
  "genero": "aventura"
}
```

### Respostas

- `201 Created`: mensagem de sucesso e objeto `avaliacao` criado.
- `400 Bad Request`: campo obrigatório ausente ou nota fora do intervalo/formato aceito.
- `401 Unauthorized`: token ausente ou usuário do token inválido.
- `403 Forbidden`: token inválido ou expirado.
- `500 Internal Server Error`: falha inesperada ao cadastrar.

## `GET /avaliacoes`

Retorna somente as avaliações pertencentes ao usuário identificado pelo token.

### Cabeçalhos

`Authorization: Bearer <token>`

### Resposta

- `200 OK`:

  ```json
  {
    "mensagem": "Avaliações recuperadas com sucesso.",
    "total": 1,
    "avaliacoes": [
      {
        "id_avaliacao": 1,
        "id_usuario": 1,
        "nome": "Jogo de exemplo",
        "nota": "8.5",
        "resenha": "Uma experiência muito divertida.",
        "status": "zerado",
        "genero": "aventura"
      }
    ]
  }
  ```

  A representação da nota pode vir como texto decimal, conforme o tipo retornado pelo banco.

- `401 Unauthorized`: token ausente ou usuário do token inválido.
- `403 Forbidden`: token inválido ou expirado.
- `500 Internal Server Error`: falha inesperada ao consultar.

## Observações sobre o registro atual

- Os caminhos `/cadastro` e `/login` são montados diretamente na raiz da aplicação.
- O roteador de avaliações é montado em `/avaliacoes`; seus caminhos `/` resultam em `/avaliacoes`.
- `src/app.js` também registra um segundo `GET /avaliacoes` sem autenticação após montar o roteador. Na ordem atual, o handler autenticado do roteador responde primeiro, portanto essa rota pública duplicada não é alcançada em condições normais.
- Não há, no momento, rotas implementadas para editar ou excluir avaliações.
