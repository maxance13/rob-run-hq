"use client";
import {useEffect,useState,type FormEvent} from "react";
import {Calculator,ChartNoAxesColumnIncreasing,ClipboardList,Copy,Database,FlaskConical,Plus,Scale,Trash2} from "lucide-react";
import {buildSource,containers,lootTargets,supportedBuild,type Catalog} from "@/lib/catalog";
import {atLeastOne,blank,example,maxLines,profit,readLootLines,scenarioKeys,type Scenario} from "@/lib/calculations";
import {date,Empty,Heading,money,Select} from "./hq";

const percentage=(value:number)=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:1}).format(value)+" %";
const signIn=(to:string)=>"/signin-with-chatgpt?return_to="+encodeURIComponent(to);
async function request<T>(url:string,body?:unknown,preview=false):Promise<T> {
  const response=await fetch("/api/"+url,body===undefined?undefined:{method:"POST",headers:{"Content-Type":"application/json",...(preview?{"X-Preview-Only":"1"}:{})},body:JSON.stringify(body)});
  const data=await response.json();
  if(!response.ok) {
    const error=data as {error?:string;issues?:string[]};
    throw new Error([error.error,...(error.issues??[])].filter(Boolean).join("\n")||"La requête a échoué.");
  }
  return data as T;
}
const numericFields:[keyof Scenario,string,string?][]=[
  ["quantity","Quantité","1"],["value","Valeur unitaire ($)","Inconnue"],["cash","Argent récupéré ($)","Inconnu"],
  ["costs","Consommables, frais et pertes ($)","Inconnus"],["key","Coût de la clé ($)","Inconnu"],["minutes","Durée totale (min)","Inconnue"],
  ["players","Joueurs","1"],["chance","Chance de réussite (%)","Facultatif"],["failure","Net en cas d’échec ($)","Facultatif"]
];
function readScenario(query:Record<string,string>,prefix:string,base:Scenario):Scenario {
  return Object.assign({},base,Object.fromEntries(scenarioKeys.filter(k=>query[prefix+k]!==undefined).map(k=>[k,query[prefix+k].slice(0,k==="extra"?800:120)])));
}
export function Calculators({catalog,query}:{catalog:Catalog;query:Record<string,string>}){
  const source=catalog.entries.find(e=>e.slug===query.fiche);
  const sample=source?.loot;
  const preset=sample?{...blank,item:sample.label,quantity:String(sample.quantity),value:String(sample.value)}:blank;
  const [a,setA]=useState(()=>readScenario(query,"a-",preset));
  const [b,setB]=useState(()=>readScenario(query,"b-",blank));
  const [compare,setCompare]=useState(query.comparaison==="1");
  const [tab,setTab]=useState(query.mode==="drop"?"drop":"profit");
  const [feedback,setFeedback]=useState("");
  async function share(){
    const params=new URLSearchParams({revision:catalog.id});
    if(source)params.set("fiche",source.slug);
    for(const key of scenarioKeys){if(key!=="item")params.set("a-"+key,a[key]);}
    if(compare){params.set("comparaison","1");for(const key of scenarioKeys){if(key!=="item")params.set("b-"+key,b[key]);}}
    const url=new URL("/calculateurs?"+params,location.origin).href;
    try{await navigator.clipboard.writeText(url);setFeedback("Lien copié.");}catch{setFeedback(url);}
  }
  return <>
    <Heading icon={<Calculator/>} title="Calculateurs">Simule tes gains et tes chances de drop dans ROB RUN.</Heading>
    <div className="tabs"><button aria-pressed={tab==="profit"} onClick={()=>setTab("profit")}>Rentabilité</button><button aria-pressed={tab==="drop"} onClick={()=>setTab("drop")}>Probabilité de drop</button></div>
    {tab==="drop"?<Drop/>:<>
      {source&&<p className="notice">Scénario lié à <a className="inline-link" href={"/wiki/"+source.slug}>{source.name}</a> · {catalog.version}. Les valeurs importées sont modifiables.</p>}
      <div className="toolbar"><button className="button secondary" onClick={()=>{setA(example);setFeedback("Exemple fictif chargé.");}}><FlaskConical size={17}/> Charger un exemple</button><button className="button secondary" onClick={()=>setCompare(!compare)}><Scale size={17}/>{compare?"Fermer la comparaison":"Comparer deux scénarios"}</button><button className="button secondary" onClick={share}><Copy size={17}/> Copier le lien</button></div>
      {feedback&&<p className="notice wrap" role="status">{feedback}</p>}
      <div className={"compare-grid"+(compare?" comparing":"")}><ScenarioCard name={compare?"Scénario A":"Scénario"} scenario={a} set={setA}/>{compare&&<ScenarioCard name="Scénario B" scenario={b} set={setB}/>}</div>
      {compare&&profit(a).net!==null&&profit(b).net!==null&&<p className="notice">Écart de bénéfice net (A − B) · <strong>{money(profit(a).net!-profit(b).net!)}</strong></p>}
    </>}
  </>;
}
function ScenarioCard({name,scenario,set}:{name:string;scenario:Scenario;set:(s:Scenario)=>void}){
  const figures=profit(scenario);
  const lines=readLootLines(scenario.extra)??[];
  const updateLine=(i:number,key:"quantity"|"value",value:string)=>set({...scenario,extra:JSON.stringify(lines.map((row,j)=>i===j?{...row,[key]:value}:row))});
  const labels={gross:"Butin brut",expenses:"Coûts",net:"Bénéfice net",hourly:"Net par heure",player:"Net par joueur",expected:"Bénéfice attendu"};
  return <article className="panel padding scenario">
    <h2>{name}</h2>
    <p>Indique 0 pour un poste sans montant. Les champs vides restent inconnus.</p>
    {scenario.item&&<p className="notice">{scenario.item}</p>}
    <div className="fields">{numericFields.map(([key,label,placeholder])=><label className="field" key={key}><span>{label}</span><input type="number" inputMode="decimal" min={key==="failure"?undefined:key==="minutes"?0.01:key==="players"?1:0} max={key==="chance"?100:undefined} step={key==="players"||key==="quantity"?1:"any"} placeholder={placeholder} value={scenario[key]} onChange={e=>set({...scenario,[key]:e.target.value})}/></label>)}</div>
    {lines.map((row,i)=><div className="loot-line" key={i}>
      <label className="field"><span>Butin {i+2} · Quantité</span><input type="number" min="0" step="1" value={row.quantity} onChange={e=>updateLine(i,"quantity",e.target.value.slice(0,24))}/></label>
      <label className="field"><span>Valeur unitaire ($)</span><input type="number" min="0" step="any" value={row.value} onChange={e=>updateLine(i,"value",e.target.value.slice(0,24))}/></label>
      <button className="icon-button" type="button" aria-label={`Retirer le butin ${i+2}`} onClick={()=>set({...scenario,extra:JSON.stringify(lines.filter((_,j)=>i!==j))})}><Trash2 size={18}/></button>
    </div>)}
    <button type="button" className="button secondary spaced" disabled={lines.length>=maxLines} onClick={()=>set({...scenario,extra:JSON.stringify([...lines,{quantity:"1",value:""}])})}><Plus size={17}/> Ajouter un lot de butin</button>
    <div className="metrics" aria-live="polite">{(Object.keys(labels) as (keyof typeof labels)[]).map(key=><div key={key} className={key==="net"?"accent":""}><span>{labels[key]}</span><strong>{money(figures[key])}{key==="hourly"&&figures[key]!==null?"/h":""}</strong></div>)}</div>
    <p className="muted">Estimation en dollars du jeu · partage égal · durée de la préparation à la sortie.</p>
  </article>;
}
function Drop(){
  const [p,setP]=useState(""),[n,setN]=useState(""),result=atLeastOne(p,n);
  return <section className="panel padding narrow"><h2>Obtenir au moins un drop</h2><p>Saisis une probabilité par ouverture et le nombre d’essais.</p><div className="fields"><label className="field"><span>Taux par essai (%)</span><input type="number" min="0" max="100" step="any" value={p} onChange={e=>setP(e.target.value)} placeholder="5"/></label><label className="field"><span>Nombre d’essais</span><input type="number" min="1" step="1" value={n} onChange={e=>setN(e.target.value)} placeholder="10"/></label></div><div className="metrics"><div className="accent"><span>Probabilité sur la série</span><strong>{result===null?"—":percentage(result)}</strong></div></div><p>Le modèle suppose des essais indépendants et un taux constant. Le taux saisi est une hypothèse.</p>{result===null&&(p||n)&&<p className="notice">Le taux doit être compris entre 0 et 100 % et le nombre d’essais doit être un entier positif.</p>}</section>;
}
type Observation={id:string;status:string;location:string;container:string;opened:string;version:string;items:string};
type Stats={n:number;hits:number;rate:number|null;interval:[number,number]|null;from?:string;to?:string};
const statuses:Record<string,string>={pending:"En attente",approved:"Validée",rejected:"Rejetée"};
export function Observations({catalog,loggedIn}:{catalog:Catalog;loggedIn:boolean}){
  const [view,setView]=useState("stats");
  const [versions,setVersions]=useState([supportedBuild]);
  const [loc,setLoc]=useState(""),[container,setContainer]=useState(""),[target,setTarget]=useState(""),[version,setVersion]=useState(supportedBuild);
  const [stats,setStats]=useState<Stats|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const [opened,setOpened]=useState(""),[items,setItems]=useState<string[]>([]),[mine,setMine]=useState<Observation[]>([]);
  const [complete,setComplete]=useState(false);
  const [submitVersion,setSubmitVersion]=useState(supportedBuild);
  const targets=lootTargets(catalog.entries).map(e=>({value:e.slug,label:e.name}));
  const locations=catalog.entries.filter(e=>e.kind==="Lieu").map(e=>({value:e.slug,label:e.name}));
  const nonce=()=>crypto.randomUUID();
  const [idempotency,setIdempotency]=useState("");
  useEffect(()=>{request<{versions:string[]}>("versions").then(x=>setVersions(x.versions)).catch(()=>{}); if(loggedIn)request<{observations:Observation[]}>("loot-sessions").then(x=>setMine(x.observations)).catch(()=>{});},[loggedIn]);
  useEffect(()=>{setStats(null);setMessage("");},[version,loc,container,target,view]);
  function label(slug:string){return catalog.entries.find(e=>e.slug===slug)?.name??slug;}
  async function getStats(e:FormEvent){
    e.preventDefault();setBusy(true);setStats(null);setMessage("");
    try{setStats(await request<Stats>("loot-stats?"+new URLSearchParams({location:loc,container,item:target,version})));}catch(err){setMessage((err as Error).message);}finally{setBusy(false);}
  }
  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setMessage("");
    const key=idempotency||nonce();setIdempotency(key);
    try{
      await request("loot-sessions",{nonce:key,location:loc,container,items,version:submitVersion,opened:new Date(opened).toISOString()});
      setMessage("Ouverture enregistrée, en attente de validation.");setItems([]);setOpened("");setComplete(false);setIdempotency("");
      setMine((await request<{observations:Observation[]}>("loot-sessions")).observations);
    }catch(err){setMessage((err as Error).message);}finally{setBusy(false);}
  }
  const verified=versions.filter(v=>v!=="Version exacte inconnue");
  return <>
    <Heading icon={<ChartNoAxesColumnIncreasing/>} title="Observations de drop">Consulte les fréquences mesurées par la communauté ou ajoute une ouverture.</Heading>
    <div className="tabs"><button aria-pressed={view==="stats"} onClick={()=>setView("stats")}>Statistiques</button><button aria-pressed={view==="submit"} onClick={()=>setView("submit")}>Contribuer</button></div>
    {view==="stats"?<>
      <form className="panel padding" onSubmit={getStats}><h2>Fréquence observée</h2><div className="fields"><Select label="Objet cible" value={target} set={setTarget} options={targets} placeholder="Sélectionner"/><Select label="Version du jeu" value={version} set={setVersion} options={versions} placeholder="Sélectionner"/><Select label="Lieu" value={loc} set={setLoc} options={locations} placeholder="Sélectionner"/><Select label="Conteneur" value={container} set={setContainer} options={containers} placeholder="Sélectionner"/></div><button className="button primary" disabled={busy||!loc||!container||!target||!version}>Afficher les statistiques</button></form>
      {stats&&<div className="panel padding spaced" role="status"><h2>{stats.rate===null?"Données insuffisantes":percentage(stats.rate)}</h2><p>{stats.hits} sur {stats.n} ouvertures validées ont donné l’objet.</p>{stats.from&&stats.to&&<p>Période du {date(stats.from)} au {date(stats.to)}.</p>}{stats.interval?<p>Intervalle de Wilson à 95 % · {percentage(stats.interval[0])} à {percentage(stats.interval[1])}. La collecte peut présenter des biais.</p>:<p>Seuil de publication · 30 ouvertures validées pour cette combinaison.</p>}</div>}
      {!stats&&<p className="notice">Les probabilités officielles du serveur sont inconnues. Les calculs utilisent uniquement les ouvertures validées. <a className="inline-link" href={buildSource} target="_blank" rel="noreferrer">Source du build Steam</a></p>}
    </>:!loggedIn?<Empty><a className="button primary" href={signIn("/observations")} target="_top">Se connecter avec ChatGPT</a></Empty>:<>
      <form className="panel padding" onSubmit={submit} onChange={()=>setIdempotency("")}><h2>Enregistrer une ouverture</h2><p>Indique tous les objets relevés. Si le conteneur est vide, laisse la liste vide.</p><div className="fields"><Select label="Version du jeu" value={submitVersion} set={setSubmitVersion} options={verified} placeholder="Sélectionner"/><Select label="Lieu" value={loc} set={setLoc} options={locations} placeholder="Sélectionner"/><Select label="Conteneur" value={container} set={setContainer} options={containers} placeholder="Sélectionner"/><label className="field"><span>Date et heure d’ouverture</span><input type="datetime-local" required value={opened} onChange={e=>setOpened(e.target.value)}/></label></div>
        <fieldset><legend>Objets obtenus</legend><div className="check-grid">{targets.map(o=><label key={o.value}><input type="checkbox" checked={items.includes(o.value)} onChange={e=>setItems(e.target.checked?[...items,o.value]:items.filter(s=>s!==o.value))}/>{o.label}</label>)}</div></fieldset><label className="checkbox"><input type="checkbox" checked={complete} onChange={e=>setComplete(e.target.checked)} required/> J’ai renseigné cette ouverture, y compris si elle n’a donné aucun objet.</label>
        {!verified.length&&<p className="notice">Les contributions ouvrent dès qu’une version exacte du jeu est publiée dans le catalogue.</p>}
        <button className="button primary" disabled={busy||!submitVersion||!loc||!container||!opened||!complete}>Soumettre l’ouverture</button></form>
      <section className="panel padding spaced"><h2>Mes observations</h2>{mine.length?mine.map(o=><div className="related" key={o.id}><span>{label(o.location)} · {o.container}<small>{date(o.opened)} · {o.version}</small></span><span className="tag">{statuses[o.status]}</span></div>):<p>Aucune ouverture enregistrée.</p>}</section>
    </>}
    {message&&<p className="notice wrap" role="status">{message}</p>}
  </>;
}

type AdminData={setup?:boolean;latest?:Catalog;imports?:{digest:string;created:string;released:string|null}[];releases?:{id:string;created:string}[];observations?:Observation[];history?:{action:string;subject:string;created:string}[]};
type Preview={digest:string;changes:{added:string[];changed:string[];removed:string[]}};
export function Admin({loggedIn,catalog}:{loggedIn:boolean;catalog:Catalog}){
  const [data,setData]=useState<AdminData|null>(null),[text,setText]=useState(""),[preview,setPreview]=useState<Preview|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const refresh=()=>request<AdminData>("admin").then(setData);
  useEffect(()=>{if(loggedIn)refresh().catch(e=>setMessage(e.message));},[loggedIn]);
  async function action(path:string,body:unknown,done:string){
    setBusy(true);setMessage("");
    try{await request("admin/"+path,body);await refresh();setMessage(done);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
  }
  async function importCatalog(save:boolean){
    setBusy(true);setMessage("");
    try{const parsed=JSON.parse(text);setPreview(await request<Preview>("admin/imports",parsed,!save));if(save){await refresh();setMessage("Brouillon enregistré.");}}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}
  }
  return <>
    <Heading icon={<Database/>} title="Administration">Gère les sources, les versions publiées et les observations de la communauté.</Heading>
    {!loggedIn?<Empty><a className="button primary" href={signIn("/admin/imports")} target="_top">Se connecter avec ChatGPT</a></Empty>:data?.setup?<div className="panel padding"><h2>Activer l’espace éditeur</h2><p>Associe l’administration du site privé à ton compte.</p><button className="button primary" disabled={busy} onClick={()=>action("setup",{},"Espace éditeur activé.")}>Activer mon accès éditeur</button></div>:data?.latest?<>
      <p className="notice">Révision active · {data.latest.id.slice(0,12)} · {data.latest.version}</p>
      <section className="panel padding"><h2>Importer un catalogue JSON</h2><p>Pars du catalogue actif, renseigne la version exacte du jeu et conserve les identifiants stables existants.</p>
        <div className="toolbar"><button className="button secondary" onClick={()=>{const {id,...latest}=data.latest??catalog;setText(JSON.stringify(latest,null,2));setPreview(null);}}>Charger le catalogue actif</button><label className="field"><span>Choisir un fichier JSON</span><input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(file){if(file.size>550000){setMessage("Le fichier dépasse la taille autorisée.");return;}setText(await file.text());setPreview(null);}}}/></label></div>
        <label className="field"><span>Contenu du catalogue</span><textarea rows={9} value={text} onChange={e=>{setText(e.target.value);setPreview(null);}}/></label>
        <div className="buttons"><button className="button secondary" disabled={busy||!text.trim()} onClick={()=>importCatalog(false)}>Valider et prévisualiser</button><button className="button primary" disabled={busy||!preview} onClick={()=>importCatalog(true)}>Enregistrer le brouillon</button></div>
        {preview&&<div className="notice">{(["added","changed","removed"] as const).map((key,i)=><p key={key}>{["Ajouts","Modifications","Suppressions"][i]} · {preview.changes[key].join(", ")||"Aucun écart"}</p>)}</div>}
      </section>
      <section className="panel padding spaced"><h2>Brouillons et publications</h2>{data.imports?.filter(row=>!row.released).map(row=><div className="related" key={row.digest}><span>Brouillon {row.digest.slice(0,12)}<small>{date(row.created)}</small></span><button className="button primary" disabled={busy} onClick={()=>action("publish",{id:row.digest},"Catalogue publié.")}>Publier</button></div>)}{data.releases?.map(r=><div className="related" key={r.id}><span>Révision {r.id.slice(0,12)} <small>{date(r.created)}</small></span>{r.id!==data.latest!.id?<button className="button secondary" disabled={busy} onClick={()=>action("rollback",{id:r.id},"Révision réactivée.")}>Réactiver</button>:<span className="tag">Active</span>}</div>)}</section>
      <section className="panel padding spaced"><h2>Observations à modérer</h2>{data.observations?.length?data.observations.map(o=><div className="related" key={o.id}><span>{o.location} · {o.container}<small>{date(o.opened)} · {o.version} · {JSON.parse(o.items).join(", ")||"Ouverture sans objet"}</small></span><div className="buttons"><button className="button primary" disabled={busy} onClick={()=>action("review",{id:o.id,status:"approved"},"Observation validée.")}>Valider</button><button className="button secondary" disabled={busy} onClick={()=>action("review",{id:o.id,status:"rejected"},"Observation rejetée.")}>Rejeter</button></div></div>):<p>Aucune observation en attente.</p>}</section>
      <section className="panel padding spaced"><h2>Historique éditorial</h2>{data.history?.length?data.history.map((row,i)=><div className="related" key={row.subject+i}><span>{statuses[row.action]??row.action} <small>{row.subject.slice(0,12)}</small></span><small>{date(row.created)}</small></div>):<p>Aucune action enregistrée.</p>}</section>
    </>:!message&&<p>Chargement…</p>}
    {message&&<p className="notice wrap" role="status">{message}</p>}
  </>;
}
