import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const journals = sqliteTable('journals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  size: text('size').notNull(), // 'pocket' | 'standard' | 'large'
  coverColor: text('cover_color').notNull(),
  pageCount: integer('page_count').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  journalId: text('journal_id')
    .notNull()
    .references(() => journals.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  content: text('content').notNull().default(''),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
