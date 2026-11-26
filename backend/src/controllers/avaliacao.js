import * as avaliacaoService from "../services/avaliacao.js";

// Cadastrar avaliação
export async function cadastrarAvaliacao(req, res) {
  try {
    const id_usuario = req.user?.id;

    const avaliacao = await avaliacaoService.cadastrarAvaliacaoService(
      id_usuario,
      req.body
    );

    return res.status(201).json({
      mensagem: "Avaliação cadastrada com sucesso.",
      avaliacao
    });

  } catch (error) {
    console.error("Erro ao cadastrar avaliação:", error);

    if (error.message === "USUARIO_INVALIDO") {
      return res.status(401).json({
        erro: "Usuário não autenticado."
      });
    }

    if (error.message === "CAMPOS_OBRIGATORIOS") {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios."
      });
    }

    if (error.message === "NOTA_INVALIDA") {
      return res.status(400).json({
        erro: "A nota deve ser um número entre 0 e 10."
      });
    }
    if (error.message === "CAPA_INVALIDA") return res.status(400).json({ erro: "A capa deve ser uma imagem WebP válida e ter até 700 KB." });

    return res.status(500).json({
      erro: "Não foi possível cadastrar a avaliação."
    });
  }
}

// Listar avaliações do usuário
export async function listarAvaliacoes(req, res) {
  try {
    const id_usuario = req.user?.id;

    const avaliacoes = await avaliacaoService.listarAvaliacoesService(
      id_usuario
    );

    return res.status(200).json({
      mensagem: "Avaliações recuperadas com sucesso.",
      total: avaliacoes.length,
      avaliacoes
    });

  } catch (error) {
    console.error("Erro ao listar avaliações:", error);

    if (error.message === "USUARIO_INVALIDO") {
      return res.status(401).json({
        erro: "Usuário não autenticado."
      });
    }

    return res.status(500).json({
      erro: "Não foi possível listar as avaliações."
    });
  }
}

export async function atualizarAvaliacao(req, res) {
  try {
    const avaliacao = await avaliacaoService.atualizarAvaliacaoService(req.user?.id, req.params.id, req.body);
    return res.status(200).json({ mensagem: "Avaliação atualizada com sucesso.", avaliacao });
  } catch (error) {
    if (error.message === "USUARIO_INVALIDO") return res.status(401).json({ erro: "Usuário não autenticado." });
    if (error.message === "AVALIACAO_NAO_ENCONTRADA") return res.status(404).json({ erro: "Avaliação não encontrada." });
    if (error.message === "CAMPOS_OBRIGATORIOS") return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    if (error.message === "NOTA_INVALIDA") return res.status(400).json({ erro: "A nota deve ser um número entre 0 e 10." });
    if (error.message === "CAPA_INVALIDA") return res.status(400).json({ erro: "A capa deve ser uma imagem WebP válida e ter até 700 KB." });
    console.error("Erro ao atualizar avaliação:", error);
    return res.status(500).json({ erro: "Não foi possível atualizar a avaliação." });
  }
}

export async function excluirAvaliacao(req, res) {
  try {
    await avaliacaoService.excluirAvaliacaoService(req.user?.id, req.params.id);
    return res.status(200).json({ mensagem: "Avaliação excluída com sucesso." });
  } catch (error) {
    if (error.message === "USUARIO_INVALIDO") return res.status(401).json({ erro: "Usuário não autenticado." });
    if (error.message === "AVALIACAO_NAO_ENCONTRADA") return res.status(404).json({ erro: "Avaliação não encontrada." });
    console.error("Erro ao excluir avaliação:", error);
    return res.status(500).json({ erro: "Não foi possível excluir a avaliação." });
  }
}
