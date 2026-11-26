import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import * as userRepository from "../repositories/repository.js";
import jwt from "jsonwebtoken";

const scrypt = promisify(scryptCallback);

async function gerarHash(senha, salt = randomBytes(16).toString("hex")) {
  const hash = await scrypt(senha, salt, 64);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

async function validarSenha(senha, hashArmazenado) {
  const [algoritmo, salt, hashHex] = hashArmazenado.split(":");
  if (algoritmo !== "scrypt" || !salt || !hashHex) return false;

  const hashEsperado = Buffer.from(hashHex, "hex");
  const hashRecebido = await scrypt(senha, salt, hashEsperado.length);
  return hashEsperado.length === hashRecebido.length && timingSafeEqual(hashEsperado, hashRecebido);
}

export async function cadastrarUsuarioService(email, senha) {
  const hash = await gerarHash(senha);

  const usuario = await userRepository.criarUsuario(email, hash);

  if (!usuario) {
    throw new Error("EMAIL_EXISTENTE");
  }

  return {
    usuario,
    token: criarToken(usuario),
  };
}

function criarToken(usuario) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET_NAO_CONFIGURADO");
  return jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

export async function consultarPerfilService(id) {
  const usuario = await userRepository.buscarUsuarioPorId(id);
  if (!usuario) throw new Error("USUARIO_NAO_ENCONTRADO");
  return usuario;
}

export async function atualizarPerfilService(id, { email, senha, senhaAtual }) {
  const dados = {};
  if (email !== undefined) dados.email = email;
  if (senha !== undefined) {
    const hashAtual = await userRepository.buscarSenhaPorId(id);
    if (!hashAtual || !(await validarSenha(senhaAtual, hashAtual))) throw new Error("SENHA_ATUAL_INVALIDA");
    dados.senha = await gerarHash(senha);
  }
  try {
    const usuario = await userRepository.atualizarUsuario(id, dados);
    if (!usuario) throw new Error("USUARIO_NAO_ENCONTRADO");
    return { usuario, token: criarToken(usuario) };
  } catch (error) {
    if (error.code === "23505") throw new Error("EMAIL_EXISTENTE");
    throw error;
  }
}


export async function fazerLoginService(email, senha) {
  const usuario = await userRepository.buscarUsuarioPorEmail(email);

  if (!usuario || !(await validarSenha(senha, usuario.senha))) {
    throw new Error("CREDENCIAIS_INVALIDAS");
  }

  const token = criarToken(usuario);

  return {
    usuario: {
      id: usuario.id,
      email: usuario.email
    },
    token
  };
}
