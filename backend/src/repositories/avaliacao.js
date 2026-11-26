import { and, eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { avaliacoes } from "../db/schemas/schema.avaliacao.js";

// Cadastrar avaliação
export async function criarAvaliacao(id_usuario, dados) {
  const [avaliacao] = await db
    .insert(avaliacoes)
    .values({
      id_usuario,
      nome: dados.nome,
      nota: String(dados.nota),
      resenha: dados.resenha,
      status: dados.status,
      genero: dados.genero,
      capa: dados.capa || null
    })
    .returning();

  return avaliacao;
}

// Listar avaliações de um usuário específico
export async function listarAvaliacoesPorUsuario(id_usuario) {
  const resultado = await db
    .select()
    .from(avaliacoes)
    .where(eq(avaliacoes.id_usuario, id_usuario))
    .orderBy(desc(avaliacoes.id_avaliacao));

  return resultado;
}

export async function atualizarAvaliacao(id_usuario, id_avaliacao, dados) {
  const [avaliacao] = await db.update(avaliacoes)
    .set({
      nome: dados.nome,
      nota: String(dados.nota),
      resenha: dados.resenha,
      status: dados.status,
      genero: dados.genero,
      capa: dados.capa || null,
    })
    .where(and(eq(avaliacoes.id_avaliacao, id_avaliacao), eq(avaliacoes.id_usuario, id_usuario)))
    .returning();
  return avaliacao;
}

export async function excluirAvaliacao(id_usuario, id_avaliacao) {
  const [avaliacao] = await db.delete(avaliacoes)
    .where(and(eq(avaliacoes.id_avaliacao, id_avaliacao), eq(avaliacoes.id_usuario, id_usuario)))
    .returning({ id_avaliacao: avaliacoes.id_avaliacao });
  return avaliacao;
}
