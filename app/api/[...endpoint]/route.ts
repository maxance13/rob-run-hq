import {z} from "zod";
import {actor,audit,currentCatalog,db,isEditor,isSiteOwner,sha} from "@/db/store";
import {containers,initial,lootTargets,search,supportedBuild,types,type Catalog} from "@/lib/catalog";
import {progressionCatalog} from "@/lib/progression";
import {blank,profit,scenarioKeys,wilson,type Scenario} from "@/lib/calculations";

export const dynamic = "force-dynamic";
const json = (body: unknown,status=200) => Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
const invalid = (message: string,status=400) => json({error:message},status);
const text = z.string().trim().min(1).max(4000);
const short = z.string().trim().min(1).max(120);
const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const urlSchema = z.string().url().refine(value=>value.startsWith("https://"),"URL HTTPS requise");
const amount = z.number().finite().min(0).max(1e12);
const rowSchema = z.object({
  slug,name:short,kind:z.enum(types),district:short,description:text,source:urlSchema,
  aliases:z.array(short).max(40),links:z.array(slug).max(40),rarity:short.optional(),target:short.optional(),
  progression:z.object({miniDrills:z.number().int().min(0).max(99).optional(),usbPoints:z.number().int().min(0).max(99).optional(),
    tabletPoints:z.number().int().min(0).max(99).optional(),source:urlSchema,note:text}).optional(),
  details:z.array(z.object({label:short,value:text})).max(25).optional(),
  loot:z.object({label:short,quantity:amount.int(),value:amount}).optional(),
  guide:z.object({goal:short,min:z.number().int().min(1).max(99),max:z.number().int().min(1).max(99),
    minutes:amount.positive().optional(),budget:amount.optional(),steps:z.array(text).min(1).max(20),alternative:text})
    .refine(g=>g.min<=g.max,"La taille maximale doit couvrir la taille minimale").optional()
});
const catalogSchema = z.object({version:short,reviewed:z.string().date(),entries:z.array(rowSchema).min(1).max(500)});
const observationSchema = z.object({nonce:z.string().uuid(),location:slug,container:z.enum(["Armoire","Coffre-fort","Étagère","Bureau","Autre"]),
  opened:z.string().datetime(), version:short, items:z.array(slug).max(40)});
function catalogErrors(data: z.infer<typeof catalogSchema>) {
  const seen = new Set<string>();
  const all = new Set(data.entries.map(row=>row.slug));
  const errors: string[] = [];
  data.entries.forEach((row,i)=>{
    if (seen.has(row.slug)) errors.push(`Fiche ${i+1} · identifiant en double (${row.slug})`);
    seen.add(row.slug);
    for (const link of row.links) if (!all.has(link) || link===row.slug) errors.push(`Fiche ${i+1} · référence invalide (${link})`);
  });
  return errors;
}
type Attempt = {items:string;opened:string};
const now = () => new Date().toISOString();
const publicEntry = async (url: URL) => currentCatalog(url.searchParams.get("revision") || undefined);

export async function GET(req: Request) {
  const url = new URL(req.url), route = url.pathname.slice(5);
  const user = actor(req);
  if (route==="search" || route.startsWith("heists/")) {
    const catalog=await publicEntry(url);
    if (!catalog) return invalid("Révision introuvable.",404);
    if (route==="search") {
      const results=search(catalog.entries,(url.searchParams.get("q")||"").slice(0,150));
      const page=Math.max(1,Math.trunc(Number(url.searchParams.get("page"))||1));
      return json({revision:catalog.id,total:results.length,results:results.slice((page-1)*20,page*20)});
    }
    const found = catalog.entries.find(e=>e.slug===route.split("/")[1] && e.kind==="Braquage");
    return found?json({revision:catalog.id,entry:found,related:catalog.entries.filter(e=>found.links.includes(e.slug))}):invalid("Braquage introuvable.",404);
  }
  if (route==="loot-stats") {
    const args = ["version","location","container","item"].map(k=>url.searchParams.get(k)||"");
    const [version,location,container,item]=args;
    if (args.some(v=>!v||v.length>120) || !containers.includes(container)) return invalid("Sélectionnez une version, un lieu, un conteneur et un objet.");
    const rows = await db().prepare("SELECT items, opened FROM observations WHERE status='approved' AND version=? AND location=? AND container=? ORDER BY opened").bind(version,location,container).all<Attempt>();
    const n=rows.results.length, hits=rows.results.filter(a=>(JSON.parse(a.items) as string[]).includes(item)).length;
    return json({n,hits,rate:n>=30?hits/n*100:null,interval:n>=30?wilson(hits,n):null,from:rows.results[0]?.opened,to:rows.results.at(-1)?.opened});
  }
  if (route==="versions") {
    const latest = (await currentCatalog())!;
    const result = await db().prepare("SELECT DISTINCT json_extract(content, '$.version') AS version FROM releases ORDER BY version").all<{version:string}>();
    return json({versions:[...new Set([supportedBuild,latest.version,...result.results.map(row=>row.version)].filter(v=>v && v!==initial.version))]});
  }
  if (route==="loot-sessions") {
    if (!user) return invalid("Connectez-vous pour voir vos observations.",401);
    const result=await db().prepare("SELECT id,version,location,container,opened,status,items FROM observations WHERE author=? ORDER BY created DESC LIMIT 100").bind(user).all();
    return json({observations:result.results});
  }
  if (route==="admin") {
    if (!user) return invalid("Connexion nécessaire.",401);
    if (!isSiteOwner(req)) return invalid("Accès éditeur requis.",403);
    const editor = await isEditor(user);
    if (!editor) {
      const provisioned=await db().prepare("SELECT 1 AS active FROM settings WHERE key='editor'").first();
      return provisioned ? invalid("Accès éditeur requis.",403) : json({setup:true});
    }
    const latest=(await currentCatalog())!;
    const [imports,releases,observations,history]=await Promise.all([
      db().prepare("SELECT digest,created,released FROM imports ORDER BY created DESC LIMIT 50").all(),
      db().prepare("SELECT id,created FROM releases ORDER BY created DESC LIMIT 50").all(),
      db().prepare("SELECT id,version,location,container,opened,items,status FROM observations WHERE status='pending' ORDER BY created LIMIT 100").all(),
      db().prepare("SELECT action,subject,created FROM audit ORDER BY created DESC LIMIT 100").all()
    ]);
    return json({latest,imports:imports.results,releases:releases.results,observations:observations.results,history:history.results});
  }
  return invalid("Route introuvable.",404);
}
export async function POST(req: Request) {
  const url=new URL(req.url),route=url.pathname.slice(5);
  if (req.headers.get("origin") && req.headers.get("origin")!==url.origin) return invalid("Origine non autorisée.",403);
  const raw=await req.text();
  if (raw.length>550000) return invalid("Le fichier dépasse la taille autorisée.",413);
  let body;
  try {body=JSON.parse(raw);} catch {return invalid("JSON invalide.");}
  if (route==="calculations/profit") {
    if (!body || typeof body!=="object" || !body.scenario || typeof body.scenario!=="object") return invalid("Scénario requis.");
    const revision = typeof body.revision==="string"?body.revision:undefined;
    const catalog=await currentCatalog(revision);
    if (!catalog) return invalid("Révision introuvable.",404);
    const preset=catalog.entries.find(e=>e.slug===body.entry)?.loot;
    const scenario: Scenario=preset?{...blank,item:preset.label,quantity:String(preset.quantity),value:String(preset.value)}:{...blank};
    for (const key of scenarioKeys) if (body.scenario[key]!==undefined) {
      if (typeof body.scenario[key]!=="string" || body.scenario[key].length>(key==="extra"?800:120)) return invalid("Paramètre invalide.");
      scenario[key]=body.scenario[key];
    }
    return json({revision:catalog.id,assumptions:scenario,...profit(scenario)});
  }
  const user=actor(req);
  if (!user) return invalid("Connectez-vous pour continuer.",401);
  if (route==="loot-sessions") {
    const parsed=observationSchema.safeParse(body);
    if (!parsed.success) return invalid("Vérifiez la version, le lieu, les objets et la date d’ouverture.");
    const a=parsed.data, catalog=(await currentCatalog())!;
    const version=await db().prepare("SELECT 1 AS active FROM releases WHERE json_extract(content, '$.version')=? LIMIT 1").bind(a.version).first();
    if ((!version && a.version!==supportedBuild) || a.version===initial.version || !catalog.entries.some(e=>e.slug===a.location&&e.kind==="Lieu") ||
      a.items.some(s=>!lootTargets(catalog.entries).some(e=>e.slug===s)) || Date.parse(a.opened)>Date.now()+300000) return invalid("Cette ouverture ne correspond pas à une version et à des fiches connues.");
    const existing=await db().prepare("SELECT id,status FROM observations WHERE author=? AND nonce=?").bind(user,a.nonce).first();
    if (existing) return json(existing);
    const id=crypto.randomUUID(), items=JSON.stringify([...new Set(a.items)].sort());
    const fingerprint=await sha(JSON.stringify([a.version,a.location,a.container,a.opened]));
    const result=await db().prepare("INSERT OR IGNORE INTO observations (id,author,nonce,fingerprint,version,location,container,opened,items,created) SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM observations WHERE author=? AND created>?)<30")
      .bind(id,user,a.nonce,fingerprint,a.version,a.location,a.container,a.opened,items,now(),user,new Date(Date.now()-3600000).toISOString()).run();
    if (!result.meta.changes) {
      const raced=await db().prepare("SELECT id,status FROM observations WHERE author=? AND nonce=?").bind(user,a.nonce).first();
      return raced ? json(raced) : invalid("Ouverture déjà enregistrée ou limite horaire atteinte.",409);
    }
    return json({id,status:"pending"},201);
  }
  if (route.startsWith("admin/") && !isSiteOwner(req)) return invalid("Accès éditeur requis.",403);
  if (route==="admin/setup") {
    await db().prepare("INSERT OR IGNORE INTO settings VALUES ('editor', ?)").bind(user).run();
    return (await isEditor(user)) ? json({ok:true}) : invalid("Accès éditeur requis.",403);
  }
  if (!(await isEditor(user))) return invalid("Accès éditeur requis.",403);
  if (route==="admin/imports") {
    const result=catalogSchema.safeParse(body);
    if (!result.success) return json({error:"Import invalide.",issues:result.error.issues.slice(0,60).map(i=>i.path.join(".")+" · "+i.message)},400);
    const issues=catalogErrors(result.data);
    if (issues.length) return json({error:"Import invalide.",issues},400);
    const content=JSON.stringify(result.data),digest=await sha(content);
    const latest=(await currentCatalog())!;
    const before=new Map(latest.entries.map(e=>[e.slug,JSON.stringify(rowSchema.parse(e))]));
    const after=new Set(result.data.entries.map(e=>e.slug));
    const changes={added:result.data.entries.filter(e=>!before.has(e.slug)).map(e=>e.name),
      changed:result.data.entries.filter(e=>before.has(e.slug)&&before.get(e.slug)!==JSON.stringify(e)).map(e=>e.name),
      removed:latest.entries.filter(e=>!after.has(e.slug)).map(e=>e.name)};
    if (!req.headers.has("x-preview-only")) await db().prepare("INSERT OR IGNORE INTO imports (digest,content,author,created) VALUES(?,?,?,?)").bind(digest,content,user,now()).run();
    return json({digest,changes});
  }
  if (route==="admin/publish" || route==="admin/rollback") {
    const id=body?.id;
    if (typeof id!=="string" || (id!==progressionCatalog.id && !/^(?:initial|[a-f0-9]{64})$/.test(id))) return invalid("Identifiant invalide.");
    const publish=route.endsWith("publish");
    if (publish) {
      const draft=await db().prepare("SELECT content,released FROM imports WHERE digest=?").bind(id).first<{content:string;released:string|null}>();
      if (!draft) return invalid("Brouillon introuvable.",404);
      if (draft.released) return json({ok:true,id});
      const content: Catalog={...JSON.parse(draft.content),id};
      await db().batch([
        db().prepare("INSERT OR IGNORE INTO releases VALUES (?,?,?)").bind(id,JSON.stringify(content),now()),
        db().prepare("UPDATE publication SET release=? WHERE key='live' AND EXISTS (SELECT 1 FROM imports WHERE digest=? AND released IS NULL)").bind(id,id),
        db().prepare("INSERT INTO audit SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM imports WHERE digest=? AND released IS NULL)").bind(crypto.randomUUID(),user,"Publication",id,now(),id),
        db().prepare("UPDATE imports SET released=? WHERE digest=? AND released IS NULL").bind(id,id)
      ]);
    } else {
      if (!(await currentCatalog(id))) return invalid("Révision introuvable.",404);
      await db().batch([db().prepare("UPDATE publication SET release=? WHERE key='live'").bind(id),audit(user,"Réactivation",id)]);
    }
    return json({ok:true,id});
  }
  if (route==="admin/review") {
    const {id,status}=body??{};
    if (typeof id!=="string" || !["approved","rejected"].includes(status)) return invalid("Décision invalide.");
    const results=await db().batch([
      db().prepare("INSERT INTO audit SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM observations WHERE id=? AND status='pending')").bind(crypto.randomUUID(),user,status,id,now(),id),
      db().prepare("UPDATE observations SET status=? WHERE id=? AND status='pending'").bind(status,id)
    ]);
    return results[1].meta.changes?json({ok:true}):invalid("Observation déjà traitée ou introuvable.",409);
  }
  return invalid("Route introuvable.",404);
}
