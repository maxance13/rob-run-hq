import {HQ} from "../app/hq";
import {initial} from "../lib/catalog";
import {progressionCatalog} from "../lib/progression";

const privateSite = "https://rob-run-hq.maxatimer.chatgpt.site";
const pages: Record<string, {title:string; description:string}> = {
  accueil:{title:"Rob Run : wiki, clés et guides de braquage | ROB RUN HQ",description:"Wiki francophone de Rob Run (Robrun) : braquages, clés, Looty Bay, mini-forets, outils USB, stratégies et calculateurs de gains."},
  wiki:{title:"Wiki Rob Run : braquages, clés, outils et lieux",description:"Explore le wiki Rob Run : banque de Looty Bay, galerie d’art, commissariat, clés, cartes d’accès, mini-foret et autres objets du jeu."},
  calculateurs:{title:"Calculateur Rob Run : gains et rentabilité des braquages",description:"Calcule tes gains nets, ta part par joueur et les chances de drop pour préparer tes braquages dans Rob Run."},
  strategies:{title:"Stratégies Rob Run : guides de braquages",description:"Prépare tes braquages Rob Run : mini-forets, points USB, tablettes de code, accès et butin à Looty Bay."},
  "braquages-cles":{title:"Clés violettes et dorées Rob Run : accès aux braquages",description:"Retrouve les accès à clé violette ou dorée de Rob Run, le matériel nécessaire et les points gagnés dans chaque salle."},
  observations:{title:"Observations de drop Rob Run",description:"Consulte les relevés communautaires de drop de Rob Run et contribue depuis l’espace privé de ROB RUN HQ."}
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
  const metadata=entry?{title:`${entry.name} | Wiki Rob Run`,description:`${entry.name} dans Rob Run : ${entry.description} Lieu : ${entry.district}.`}:pages[page];
  if (!metadata) return {title:"Page introuvable · ROB RUN HQ",description:"Retrouve les contenus de ROB RUN HQ."};
  return metadata;
}

export function PublicSite({path,query={}}:{path:string;query?:Record<string,string>}) {
  const canonical=canonicalPath(path);
  if (!paths.includes(canonical)) return <main className="shell interior"><h1>Page introuvable</h1><p><a className="inline-link" href="/">Retour à l’accueil</a></p></main>;
  const {page,slug}=route(canonical);
  const catalog=query.revision===initial.id ? initial : progressionCatalog;
  return <HQ page={page} slug={slug} query={query} catalog={catalog} loggedIn={false} privateSite={privateSite}/>;
}
