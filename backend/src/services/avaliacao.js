import * as repository from "../repositories/avaliacao.js";

export async function cadastrarAvaliacaoService(id_usuario, dados) {

  if (!id_usuario || !Number.isInteger(Number(id_usuario))) {
    throw new Error("USUARIO_INVALIDO");
  }

  if (
    !dados.nome ||
    dados.nota === undefined ||
    !dados.resenha ||
    !dados.status ||
    !dados.genero
  ) {
    throw new Error("CAMPOS_OBRIGATORIOS");
  }
  validarCapa(dados.capa);

  const nota = Number(dados.nota);

  if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
    throw new Error("NOTA_INVALIDA");
  }

  const avaliacao = await repository.criarAvaliacao(
    Number(id_usuario),
    {
      ...dados,
      nota
    }
  );

  return avaliacao;
}

export async function listarAvaliacoesService(id_usuario) {

  if (!id_usuario || !Number.isInteger(Number(id_usuario))) {
    throw new Error("USUARIO_INVALIDO");
  }

  const avaliacoes = await repository.listarAvaliacoesPorUsuario(
    Number(id_usuario)
  );

  return avaliacoes;
}

export async function atualizarAvaliacaoService(id_usuario, id_avaliacao, dados) {
  if (!id_usuario || !Number.isInteger(Number(id_usuario))) throw new Error("USUARIO_INVALIDO");
  if (!Number.isInteger(Number(id_avaliacao)) || Number(id_avaliacao) <= 0) throw new Error("AVALIACAO_NAO_ENCONTRADA");
  validarDadosAvaliacao(dados);
  validarCapa(dados.capa);
  const nota = Number(dados.nota);
  if (!Number.isFinite(nota) || nota < 0 || nota > 10) throw new Error("NOTA_INVALIDA");
  const avaliacao = await repository.atualizarAvaliacao(Number(id_usuario), Number(id_avaliacao), { ...dados, nota });
  if (!avaliacao) throw new Error("AVALIACAO_NAO_ENCONTRADA");
  return avaliacao;
}

export async function excluirAvaliacaoService(id_usuario, id_avaliacao) {
  if (!id_usuario || !Number.isInteger(Number(id_usuario))) throw new Error("USUARIO_INVALIDO");
  if (!Number.isInteger(Number(id_avaliacao)) || Number(id_avaliacao) <= 0) throw new Error("AVALIACAO_NAO_ENCONTRADA");
  const removida = await repository.excluirAvaliacao(Number(id_usuario), Number(id_avaliacao));
  if (!removida) throw new Error("AVALIACAO_NAO_ENCONTRADA");
  return removida;
}

function validarDadosAvaliacao(dados) {
  if (!dados.nome?.trim() || dados.nota === undefined || !dados.resenha?.trim() || !dados.status || !dados.genero) {
    throw new Error("CAMPOS_OBRIGATORIOS");
  }
}

function validarCapa(capa) {
  if (capa == null || capa === "") return;
  if (typeof capa !== "string" || capa.length > 700000 || !/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(capa)) {
    throw new Error("CAPA_INVALIDA");
  }
}
