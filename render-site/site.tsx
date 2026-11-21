import {HQ} from "../app/hq";
import {initial} from "../lib/catalog";
import {progressionCatalog} from "../lib/progression";

const privateSite = "https://rob-run-hq.maxatimer.chatgpt.site";
const pages: Record<string, {title:string; description:string}> = {
  accueil:{title:"ROB RUN HQ",description:"Wiki, calculateurs, clés et stratégies pour ROB RUN."},
  wiki:{title:"Wiki",description:"Retrouve les braquages, les clés et le matériel de Looty Bay."},
  calculateurs:{title:"Calculateurs",description:"Estime la rentabilité, la part par joueur et les chances de drop de tes braquages."},
  strategies:{title:"Stratégies",description:"Compare les mini-forets, les points USB et les points de tablette par braquage."},
  "braquages-cles":{title:"Braquages à clé violette ou dorée",description:"Recherche les 17 accès violets et dorés, avec le matériel et les points par accès."},
  observations:{title:"Observations",description:"Accède aux observations de drop sur le site privé de ROB RUN HQ."}
};

export const paths = [
  "/", ...Object.keys(pages).filter(page=>page!=="accueil").map(page=>"/"+page),
  ...progressionCatalog.entries.map(entry=>"/wiki/"+entry.slug)
];

export const canonicalPath=(path:string)=>path.replace(/(?:\/index\.html|\.html|\/)$/,"")||"/";

function route(path:string) {
  const [page="accueil",slug=""]=canonicalPath(path).split("/").filter(Boolean);
  return {page,slug};
}

export function getMetadata(path:string) {
  const {page,slug}=route(path);
  const entry=page==="wiki" && progressionCatalog.entries.find(item=>item.slug===slug);
  const metadata=entry?{title:entry.name,description:entry.description}:pages[page];
  if (!metadata) return {title:"Page introuvable · ROB RUN HQ",description:"Retrouve les contenus de ROB RUN HQ."};
  return {...metadata,title:page==="accueil"?metadata.title:metadata.title+" · ROB RUN HQ"};
}

export function PublicSite({path,query={}}:{path:string;query?:Record<string,string>}) {
  const canonical=canonicalPath(path);
  if (!paths.includes(canonical)) return <main className="shell interior"><h1>Page introuvable</h1><p><a className="inline-link" href="/">Retour à l’accueil</a></p></main>;
  const {page,slug}=route(canonical);
  const catalog=query.revision===initial.id ? initial : progressionCatalog;
  return <HQ page={page} slug={slug} query={query} catalog={catalog} loggedIn={false} privateSite={privateSite}/>;
}
