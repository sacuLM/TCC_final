
import * as userService from "../services/services.js";

export async function cadastrarUsuario(req, res) {
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase()
    : "";

  const senha = req.body?.senha;

  if (!email || typeof senha !== "string" || senha.length < 8) {
    return res.status(400).json({
      erro: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres."
    });
  }

  try {
    const resultado = await userService.cadastrarUsuarioService(email, senha);
    return res.status(201).json(resultado);

  } catch (error) {
    if (error.message === "EMAIL_EXISTENTE") {
      return res.status(409).json({
        erro: "Já existe uma conta com esse e-mail."
      });
    }

    console.error("Erro ao cadastrar usuário:", error);

    return res.status(500).json({
      erro: "Não foi possível cadastrar o usuário."
    });
  }
}

export async function consultarPerfil(req, res) {
  try {
    const usuario = await userService.consultarPerfilService(req.user.id);
    return res.status(200).json({ usuario });
  } catch (error) {
    if (error.message === "USUARIO_NAO_ENCONTRADO") return res.status(404).json({ erro: "Usuário não encontrado." });
    console.error("Erro ao consultar perfil:", error);
    return res.status(500).json({ erro: "Não foi possível consultar o perfil." });
  }
}

export async function atualizarPerfil(req, res) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : undefined;
  const senha = req.body?.senha;
  const senhaAtual = req.body?.senhaAtual;
  if (email === undefined && senha === undefined) return res.status(400).json({ erro: "Informe ao menos um dado para atualizar." });
  if (email !== undefined && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 50)) return res.status(400).json({ erro: "Informe um e-mail válido com até 50 caracteres." });
  if (senha !== undefined && (typeof senha !== "string" || senha.length < 8 || senha.length > 10)) return res.status(400).json({ erro: "A senha deve ter entre 8 e 10 caracteres." });
  if (senha !== undefined && (typeof senhaAtual !== "string" || !senhaAtual)) return res.status(400).json({ erro: "Informe sua senha atual para definir uma nova senha." });
  try {
    const resultado = await userService.atualizarPerfilService(req.user.id, { email, senha, senhaAtual });
    return res.status(200).json(resultado);
  } catch (error) {
    if (error.message === "EMAIL_EXISTENTE") return res.status(409).json({ erro: "Já existe uma conta com esse e-mail." });
    if (error.message === "USUARIO_NAO_ENCONTRADO") return res.status(404).json({ erro: "Usuário não encontrado." });
    if (error.message === "SENHA_ATUAL_INVALIDA") return res.status(400).json({ erro: "A senha atual está incorreta." });
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ erro: "Não foi possível atualizar o perfil." });
  }
}

export async function fazerLogin(req, res) {
  const email = typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase()
    : "";

  const senha = req.body?.senha;

  if (!email || typeof senha !== "string") {
    return res.status(400).json({
      erro: "Informe e-mail e senha."
    });
  }

  try {
    const resultado = await userService.fazerLoginService(email, senha);

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
      usuario: resultado.usuario,
      token: resultado.token
    });

  } catch (error) {
    if (error.message === "CREDENCIAIS_INVALIDAS") {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos."
      });
    }

    console.error("Erro ao fazer login:", error);

    return res.status(500).json({
      erro: "Não foi possível realizar o login."
    });
  }
}
