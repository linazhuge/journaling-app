import { pgTable, text, integer, timestamp, boolean, unique, date } from 'drizzle-orm/pg-core';

// ── Better Auth required tables ──────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// ── App tables ────────────────────────────────────────────────────────────────

export const journals = pgTable('journals', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull().default('writing'), // 'writing' | 'habit_tracker'
  size: text('size').notNull(), // 'pocket' | 'standard' | 'large'
  coverColor: text('cover_color').notNull(),
  pageCount: integer('page_count').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pages = pgTable('pages', {
  id: text('id').primaryKey(),
  journalId: text('journal_id')
    .notNull()
    .references(() => journals.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  content: text('content').notNull().default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => [
  unique().on(t.journalId, t.pageNumber),
]);

export const habits = pgTable('habits', {
  id: text('id').primaryKey(),
  journalId: text('journal_id')
    .notNull()
    .references(() => journals.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#a8d8a8'),
  order: integer('order').notNull().default(0),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1–12
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  unique().on(t.journalId, t.year, t.month, t.name),
]);

export const habitLogs = pgTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  date: date('date').notNull(), // 'YYYY-MM-DD'
}, (t) => [
  unique().on(t.habitId, t.date),
]);
