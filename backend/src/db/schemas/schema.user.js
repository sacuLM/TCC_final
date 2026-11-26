import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id_usuario: serial('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
});
