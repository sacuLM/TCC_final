import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schemas/schema.user.js"; // Ajuste o caminho do schema conforme seu projeto

export async function buscarUsuarioPorEmail(email) {
  const [usuario] = await db
    .select({
      id: users.id_usuario,
      email: users.email,
      senha: users.senha,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return usuario;
}

export async function buscarUsuarioPorId(id) {
  const [usuario] = await db.select({ id: users.id_usuario, email: users.email })
    .from(users).where(eq(users.id_usuario, id)).limit(1);
  return usuario;
}

export async function buscarSenhaPorId(id) {
  const [usuario] = await db.select({ senha: users.senha })
    .from(users).where(eq(users.id_usuario, id)).limit(1);
  return usuario?.senha;
}

// console.log("Users:", users);
// console.log("ID:", users.id_usuario);
// console.log("Email:", users.email);
// console.log("Senha:", users.senha);

export async function criarUsuario(email, hash) {
  
  const resultado = await db
    .insert(users)
    .values({ email, senha: hash })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id_usuario, email: users.email });

  return resultado[0]; // Retorna undefined se houver conflito (e-mail duplicado)
}

export async function atualizarUsuario(id, dados) {
  const [usuario] = await db.update(users).set(dados)
    .where(eq(users.id_usuario, id)).returning({ id: users.id_usuario, email: users.email });
  return usuario;
}
