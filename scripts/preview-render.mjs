import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {extname,join,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../dist/render/",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".xml":"application/xml; charset=utf-8",".txt":"text/plain; charset=utf-8",".webp":"image/webp"};
const port=Number(process.env.PORT||4173);

createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url||"/","http://localhost").pathname);
    let file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)) throw new Error("Invalid path");
    if((await stat(file).catch(()=>null))?.isDirectory()) file=join(file,"index.html");
    const body=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream"});
    res.end(body);
  } catch {
    res.writeHead(404,{"content-type":"text/html; charset=utf-8"});
    res.end(await readFile(join(root,"404.html")));
  }
}).listen(port,"127.0.0.1",()=>console.log(`ROB RUN preview: http://127.0.0.1:${port}/`));
