import { sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const releases = sqliteTable("releases", {
  id: text("id").primaryKey(), content: text("content").notNull(), created: text("created").notNull()
});
export const publication = sqliteTable("publication", {
  key: text("key").primaryKey(), release: text("release").notNull().references(() => releases.id)
});
export const imports = sqliteTable("imports", {
  digest: text("digest").primaryKey(), content: text("content").notNull(), author: text("author").notNull(),
  created: text("created").notNull(), released: text("released").references(() => releases.id)
});
export const audit = sqliteTable("audit", {
  id: text("id").primaryKey(), actor: text("actor").notNull(), action: text("action").notNull(),
  subject: text("subject").notNull(), created: text("created").notNull()
});
export const observations = sqliteTable("observations", {
  id: text("id").primaryKey(), author: text("author").notNull(), nonce: text("nonce").notNull(),
  fingerprint: text("fingerprint").notNull(), version: text("version").notNull(), location: text("location").notNull(),
  container: text("container").notNull(), opened: text("opened").notNull(), items: text("items").notNull(),
  status: text("status").notNull().default("pending"), created: text("created").notNull()
}, t=>[uniqueIndex("observations_nonce").on(t.author,t.nonce),uniqueIndex("observations_duplicate").on(t.author,t.fingerprint),index("observations_aggregate").on(t.status,t.version,t.location,t.container)]);
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(), value: text("value").notNull()
});
