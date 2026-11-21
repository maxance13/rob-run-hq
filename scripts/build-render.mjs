import {mkdir,mkdtemp,readFile,rm,writeFile} from "node:fs/promises";
import {join,dirname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {build} from "vite";

const project=fileURLToPath(new URL("../",import.meta.url));
const root=join(project,"render-site");
const dist=join(project,"dist");
const output=join(dist,"render");
const siteUrl=(process.env.SEO_SITE_URL||process.env.RENDER_EXTERNAL_URL||"").replace(/\/+$/,"");
if(siteUrl && !/^https:\/\/[^/]+$/.test(siteUrl)) throw new Error("SEO_SITE_URL doit être une origine HTTPS, sans chemin.");
const common={configFile:false,root,resolve:{alias:{"@":project}}};
const escapeHtml=(value)=>value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

await mkdir(dist,{recursive:true});
const temporary=await mkdtemp(join(dist,"render-prerender-"));
try {
  await build({...common,publicDir:join(project,"public"),build:{outDir:output,emptyOutDir:true}});
  await build({...common,publicDir:false,build:{ssr:join(root,"prerender.tsx"),outDir:temporary}});
  const {getMetadata,paths,render}=await import(pathToFileURL(join(temporary,"prerender.js")).href);
  const template=await readFile(join(output,"index.html"),"utf8");
  async function writePage(path,file){
    const metadata=getMetadata(path);
    const missing=path==="/404";
    const url=siteUrl+(path==="/"?"/":path);
    const socialImage=siteUrl+"/looty-bay.webp";
    const structuredData=siteUrl?JSON.stringify({"@context":"https://schema.org","@type":path==="/"?"WebSite":"WebPage",name:metadata.title,url,description:metadata.description,inLanguage:"fr",about:{"@type":"VideoGame",name:"ROB RUN"},...(path==="/"?{alternateName:["Rob Run HQ","Robrun HQ"]}:{isPartOf:{"@type":"WebSite",name:"ROB RUN HQ",url:siteUrl+"/"}})}).replace(/</g,"\\u003c"):"";
    const head=`<title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}">
    ${missing?'<meta name="robots" content="noindex, follow">':siteUrl?`<link rel="canonical" href="${escapeHtml(url)}">`:""}
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="ROB RUN HQ">
    <meta property="og:title" content="${escapeHtml(metadata.title)}">
    <meta property="og:description" content="${escapeHtml(metadata.description)}">
    ${siteUrl?`<meta property="og:url" content="${escapeHtml(url)}">
    <meta property="og:image" content="${escapeHtml(socialImage)}">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${structuredData}</script>`:""}`;
    const html=template
      .replace("<title>ROB RUN HQ</title>",()=>head)
      .replace('<div id="root"></div>',()=>`<div id="root" data-path="${escapeHtml(path)}">${render(path)}</div>`);
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,html);
  }
  await Promise.all([...paths.flatMap(path=>[
    writePage(path,join(output,path.slice(1),"index.html")),
    ...(path==="/"?[]:[writePage(path,join(output,path.slice(1)+".html"))])
  ]),writePage("/404",join(output,"404.html"))]);
  const aiLink=(path)=>{
    const {title,description}=getMetadata(path);
    return `- [${title}](${siteUrl+path}): ${description}`;
  };
  const mainPaths=["/","/wiki","/strategies","/braquages-cles","/calculateurs","/observations"];
  const wikiPaths=paths.filter(path=>path.startsWith("/wiki/"));
  await writeFile(join(output,"llms.txt"),[
    "# ROB RUN HQ",
    "",
    "> Wiki francophone indépendant du jeu vidéo ROB RUN (aussi écrit Rob Run ou Robrun), développé par Kefir. Guides communautaires sur les braquages, clés, outils, lieux et gains à Looty Bay.",
    "",
    "Les informations sont communautaires et peuvent varier selon la version du jeu. Chaque fiche indique sa source et sa date de revue ; consulter la page liée avant de citer un fait précis. ROB RUN HQ n'est pas un site officiel de Kefir.",
    "",
    "## Commencer ici",
    "",
    ...mainPaths.map(aiLink),
    "",
    "## Fiches du wiki",
    "",
    ...wikiPaths.map(aiLink),
    ""
  ].join("\n"));
  await writeFile(join(output,"robots.txt"),`User-agent: *\nAllow: /\n${siteUrl?`Sitemap: ${siteUrl}/sitemap.xml\n`:""}`);
  if(siteUrl) await writeFile(join(output,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`  <url><loc>${escapeHtml(siteUrl+(path==="/"?"/":path))}</loc></url>`).join("\n")}\n</urlset>\n`);
  console.log(`${paths.length} routes statiques dans dist/render.`);
} finally {
  await rm(temporary,{recursive:true,force:true});
}
