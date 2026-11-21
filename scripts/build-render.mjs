import {mkdir,mkdtemp,readFile,rm,writeFile} from "node:fs/promises";
import {join,dirname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {build} from "vite";

const project=fileURLToPath(new URL("../",import.meta.url));
const root=join(project,"render-site");
const dist=join(project,"dist");
const output=join(dist,"render");
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
    const html=template
      .replace("<title>ROB RUN HQ</title>",()=>`<title>${escapeHtml(metadata.title)}</title>\n    <meta name="description" content="${escapeHtml(metadata.description)}">`)
      .replace('<div id="root"></div>',()=>`<div id="root">${render(path)}</div>`);
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,html);
  }
  await Promise.all([...paths.map(path=>writePage(path,join(output,path.slice(1),"index.html"))),writePage("/404",join(output,"404.html"))]);
  console.log(`${paths.length} routes statiques dans dist/render.`);
} finally {
  await rm(temporary,{recursive:true,force:true});
}
