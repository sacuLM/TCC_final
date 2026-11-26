import {
  pgTable,
  serial,
  integer,
  text,
  decimal,
  varchar
} from "drizzle-orm/pg-core";

import { users } from "./schema.user.js";

export const avaliacoes = pgTable("avaliacoes", {
  id_avaliacao: serial("id_avaliacao").primaryKey(),

  id_usuario: integer("id_usuario")
    .notNull()
    .references(() => users.id_usuario),

  nome: text("nome").notNull(),
  nota: decimal("nota").notNull(),
  resenha: text("resenha").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  genero: varchar("genero", { length: 20 }).notNull(),
  capa: text("capa")
});
