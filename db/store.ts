import {env} from "cloudflare:workers";
import {initial, type Catalog} from "@/lib/catalog";
import {progressionCatalog} from "@/lib/progression";

export const db = () => env.DB!;
export async function currentCatalog(revision?: string): Promise<Catalog | null> {
  const existing = await db().prepare("SELECT 1 AS active FROM publication WHERE key = 'live'").first();
  if (!existing) await db().batch([
    db().prepare("INSERT OR IGNORE INTO releases VALUES (?, ?, ?)").bind(initial.id,JSON.stringify(initial),initial.reviewed),
    db().prepare("INSERT OR IGNORE INTO publication VALUES (?, ?)").bind("live",initial.id)
  ]);
  const prepared = await db().prepare("SELECT 1 AS ready FROM settings WHERE key = ?").bind(progressionCatalog.id).first();
  if (!prepared) {
    const mark = progressionCatalog.id;
    const timestamp = new Date().toISOString();
    await db().batch([
      db().prepare("INSERT OR IGNORE INTO releases VALUES (?, ?, ?)").bind(mark,JSON.stringify(progressionCatalog),timestamp),
      db().prepare("INSERT OR IGNORE INTO audit SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM publication WHERE key='live' AND release=?) AND NOT EXISTS (SELECT 1 FROM settings WHERE key=?)")
        .bind(mark,"catalog","Publication",mark,timestamp,initial.id,mark),
      db().prepare("UPDATE publication SET release=? WHERE key='live' AND release=? AND NOT EXISTS (SELECT 1 FROM settings WHERE key=?)")
        .bind(mark,initial.id,mark),
      db().prepare("INSERT OR IGNORE INTO settings VALUES (?, ?)").bind(mark,timestamp)
    ]);
  }
  const statement = revision
    ? db().prepare("SELECT content FROM releases WHERE id = ?").bind(revision)
    : db().prepare("SELECT content FROM releases JOIN publication ON releases.id = publication.release WHERE publication.key = 'live'");
  const raw = await statement.first<string>("content");
  return raw ? JSON.parse(raw) : null;
}
export async function sha(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b=>b.toString(16).padStart(2,"0")).join("");
}
export function actor(req: Request) {return req.headers.get("oai-authenticated-user-id");}
export async function isEditor(user: string | null) {
  if (!user) return false;
  return user === await db().prepare("SELECT value FROM settings WHERE key = 'editor'").first<string>("value");
}
export function audit(user: string, action: string, subject: string) {
  return db().prepare("INSERT INTO audit VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(),user,action,subject,new Date().toISOString());
}
