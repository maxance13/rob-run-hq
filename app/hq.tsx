"use client";

import {useEffect,useState,useRef,type ReactNode} from "react";
import {ArrowUpRight,BookOpen,Calculator,ChartNoAxesColumnIncreasing,ChevronRight,Crosshair,KeyRound,Landmark,MapPin,Route,Search,Shield,Target,Users,X,Clock,Image as ImageIcon} from "lucide-react";
import {search,types,type Catalog,type Entry} from "@/lib/catalog";
import {miniDrillPrice} from "@/lib/progression";
import {KeyHeists} from "./key-heists";
import {Calculators,Observations,Admin} from "./tools";

const navigation=[["Accueil","/"],["Wiki","/wiki"],["Calculateurs","/calculateurs"],["Stratégies","/strategies"],["Clés","/braquages-cles"],["Observations","/observations"]];
const sections=[
  {title:"Wiki du jeu",label:"Explorer le wiki",description:"Identifie tes clés, découvre ce qu’elles ouvrent et retrouve les prérequis de chaque braquage.",icon:BookOpen,href:"/wiki",color:"orange"},
  {title:"Calculateurs",label:"Lancer un calcul",description:"Estime tes gains nets, compare deux sorties et calcule la part de chaque joueur.",icon:Calculator,href:"/calculateurs",color:"purple"},
  {title:"Stratégies",label:"Consulter les guides",description:"Trouve un plan adapté à ton équipe, à ton équipement et au butin que tu vises.",icon:Route,href:"/strategies",color:"cyan"}
];

export const money=(n:number|null|undefined)=>n===null||n===undefined?"—":new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(n)+" $";
export const date=(value:string)=>new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(value));
export function Heading({icon,title,children}:{icon:ReactNode;title:string;children:ReactNode}){
  return <div className="page-heading"><div className="feature-icon orange">{icon}</div><h1>{title}</h1><p>{children}</p></div>;
}
export function Empty({children}:{children:ReactNode}){return <div className="empty">{children}</div>;}
export function HQ({page,slug,query,catalog,loggedIn,privateSite}:{page:string;slug:string;query:Record<string,string>;catalog:Catalog;loggedIn:boolean;privateSite?:string}){
  const [term,setTerm]=useState("");
  const [open,setOpen]=useState(false);
  const searchRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    const focus=(event:KeyboardEvent)=>{
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setOpen(true);}
      if(event.key==="Escape")setOpen(false);
    };
    window.addEventListener("keydown",focus);
    return ()=>window.removeEventListener("keydown",focus);
  },[]);
  useEffect(()=>{if(open)searchRef.current?.focus();},[open]);
  const hits=term.trim()?search(catalog.entries,term).slice(0,6):[];
  const selected=catalog.entries.find(e=>e.slug===slug);
  return <>
    <a className="skip" href="#main">Aller au contenu</a>
    <header className="topbar"><div className="nav-inner shell">
      <a href="/" className="brand" aria-label="ROB RUN HQ, accueil"><span className="brand-mark"><Crosshair size={23}/></span><strong>ROB RUN<span> HQ</span></strong></a>
      <nav aria-label="Navigation principale">{navigation.map(([label,url])=><a key={url} href={url} aria-current={(page==="accueil"?"/":"/"+page)===url?"page":undefined}>{label}</a>)}</nav>
      <button className="search-trigger" aria-label="Rechercher" onClick={()=>setOpen(true)}><Search size={17}/><span>Rechercher</span><kbd>Ctrl K</kbd></button>
    </div></header>
    <main id="main" className={page==="accueil"?"":"shell interior"}>
      {page==="accueil"&&<Home entries={catalog.entries}/>}
      {page==="wiki"&&(selected?<Detail item={selected} catalog={catalog}/>:<Wiki entries={catalog.entries} initialQuery={query.q??""}/>)}
      {page==="strategies"&&<Strategies catalog={catalog}/>}
      {page==="braquages-cles"&&<KeyHeists entries={catalog.entries}/>}
      {page==="calculateurs"&&<Calculators catalog={catalog} query={query}/>}
      {page==="observations"&&(privateSite?<><Heading icon={<ChartNoAxesColumnIncreasing/>} title="Observations de drop">Les relevés et les contributions sont disponibles dans l’espace privé.</Heading><a className="button primary" href={privateSite+"/observations"}>Ouvrir les observations</a></>:<Observations catalog={catalog} loggedIn={loggedIn}/>)}
      {page==="admin"&&!privateSite&&<Admin loggedIn={loggedIn} catalog={catalog}/>}
    </main>
    <footer><div className="shell foot"><a href="/" className="brand"><Crosshair size={19}/><strong>ROB RUN<span> HQ</span></strong></a><p>Compagnon communautaire indépendant · ROB RUN est un jeu de Kefir.</p><a href={(privateSite??"")+"/admin/imports"}>Administration</a></div></footer>
    {open&&<div className="modal-backdrop" onClick={()=>setOpen(false)}><section role="dialog" aria-modal="true" aria-label="Rechercher dans le wiki" className="search-modal" onClick={e=>e.stopPropagation()}>
      <form action="/wiki"><Search size={20}/><input ref={searchRef} name="q" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Rechercher une clé, un lieu, un braquage…" aria-label="Rechercher dans le wiki"/><button type="button" className="icon-button" aria-label="Fermer" onClick={()=>setOpen(false)}><X size={20}/></button></form>
      <div className="search-results">{hits.map(e=><a key={e.slug} href={"/wiki/"+e.slug}><span>{e.name}</span><small>{e.kind}</small></a>)}{!hits.length&&<p>{term?"Aucune fiche trouvée.":"Saisis un nom, un quartier ou un alias."}</p>}</div>
    </section></div>}
  </>;
}
function Home({entries}:{entries:Entry[]}){
  const featured=entries.filter(e=>e.kind==="Braquage").slice(0,3);
  return <>
    <section className="hero"><div className="shell hero-content">
      <div className="eyebrow"><span/> COMPAGNON COMMUNAUTAIRE FRANCOPHONE</div>
      <h1>Prépare ton prochain<br/><em>braquage.</em></h1>
      <p>Les clés, les gains et les stratégies de ROB RUN.<br className="desktop"/> Tout pour préparer ta prochaine sortie à Looty Bay.</p>
      <div className="buttons"><a className="button primary" href="/wiki"><BookOpen size={17}/> Explorer le wiki</a><a className="button secondary" href="/calculateurs"><Calculator size={17}/> Calculer mes gains</a></div>
    </div><div className="shell hero-location"><MapPin size={15}/> LOOTY BAY</div></section>
    <div className="shell home-body">
      <section aria-labelledby="tools"><div className="section-head"><h2 id="tools">Préparer une sortie</h2></div>
        <div className="feature-grid">{sections.map(({icon:Icon,...card})=><a className={"feature "+card.color} key={card.title} href={card.href}><div className={"feature-icon "+card.color}><Icon size={23}/></div><h3>{card.title}</h3><p>{card.description}</p><span className="feature-link">{card.label}<ChevronRight size={17}/></span></a>)}</div>
      </section>
      <section className="featured" aria-labelledby="ops"><div className="section-head"><h2 id="ops"><Target size={24}/> Braquages à explorer</h2><a href="/wiki?kind=Braquage">Tous les braquages <ChevronRight size={16}/></a></div>
        <div className="feature-grid">{featured.map((e,i)=><a href={"/wiki/"+e.slug} className={"operation tone-"+i} key={e.slug}><div className="op-art">{i===0?<Landmark/>:i===1?<ImageIcon/>:<Shield/>}</div><div><small><MapPin size={13}/>{e.district}</small><h3>{e.name}</h3><ChevronRight size={17} className="op-next"/></div></a>)}</div>
      </section>
      <section className="data-strip"><div className="feature-icon cyan"><ChartNoAxesColumnIncreasing size={23}/></div><div><h3>Statistiques de drop</h3><p>Consulte les relevés de la communauté ou ajoute une ouverture en jeu.</p></div><a className="button secondary" href="/observations">Voir les observations</a></section>
    </div>
  </>;
}
function Wiki({entries,initialQuery}:{entries:Entry[];initialQuery:string}){
  const [q,setQ]=useState(initialQuery),[kind,setKind]=useState(""),[district,setDistrict]=useState(""),[rarity,setRarity]=useState("");
  useEffect(()=>setKind(new URLSearchParams(location.search).get("kind")??""),[]);
  const districts=[...new Set(entries.map(e=>e.district))];
  const rarities=[...new Set(entries.flatMap(e=>e.rarity?[e.rarity]:[]))];
  const results=search(entries,q).filter(e=>(!kind||kind===e.kind)&&(!district||e.district===district)&&(!rarity||e.rarity===rarity));
  return <>
    <Heading icon={<BookOpen/>} title="Wiki de ROB RUN">Clés, braquages, outils et lieux de Looty Bay.</Heading>
    <div className="filter-bar"><label className="search-field"><Search size={18}/><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un nom ou un alias…" aria-label="Nom ou alias"/></label><Select label="Famille" value={kind} set={setKind} options={[...types]}/><Select label="Lieu" value={district} set={setDistrict} options={districts}/><Select label="Rareté" value={rarity} set={setRarity} options={rarities}/></div>
    <p className="result-count" aria-live="polite">{results.length} {results.length===1?"fiche":"fiches"}</p>
    <div className="card-grid">{results.map(e=><a className="listing panel" href={"/wiki/"+e.slug} key={e.slug}><span className="tag">{e.kind}</span><h2>{e.name}</h2><p>{e.description}</p><div className="meta"><MapPin size={15}/>{e.district}{e.rarity&&<span className="tag rarity">{e.rarity}</span>}</div></a>)}</div>
    {!results.length&&<Empty>Aucune fiche ne correspond à cette recherche. Essaie le nom affiché en jeu.</Empty>}
  </>;
}
export function Select({label,value,set,options,placeholder="Tous"}:{label:string;value:string;set:(s:string)=>void;options:(string|{value:string;label:string})[];placeholder?:string}){
  return <label className="field"><span>{label}</span><select value={value} onChange={e=>set(e.target.value)}><option value="">{placeholder}</option>{options.map(o=>typeof o==="string"?<option key={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
function Detail({item,catalog}:{item:Entry;catalog:Catalog}){
  const related=catalog.entries.filter(e=>item.links.includes(e.slug)||e.links.includes(item.slug));
  return <>
    <a href="/wiki" className="backlink">Wiki <ChevronRight size={15}/> {item.kind}</a>
    <Heading icon={item.kind==="Braquage"?<Landmark/>:<KeyRound/>} title={item.name}>{item.description}</Heading>
    <div className="detail-grid">
      <section className="panel padding"><h2>Informations</h2><dl><div><dt>Lieu</dt><dd>{item.district}</dd></div><div><dt>Rareté</dt><dd>{item.rarity??"Inconnue"}</dd></div><div><dt>Version du jeu</dt><dd>{catalog.version}</dd></div>{item.target&&<div><dt>Ouvre</dt><dd>{item.target}</dd></div>}<div><dt>Dernière revue</dt><dd>{date(catalog.reviewed)}</dd></div>{item.loot&&<div><dt>Butin documenté</dt><dd>{item.loot.label} · {money(item.loot.value)}</dd></div>}{item.details?.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}<div><dt>Source</dt><dd><a className="inline-link" href={item.source} target="_blank" rel="noreferrer">Guide communautaire <ArrowUpRight size={15}/></a></dd></div></dl>
      {item.guide&&<div className="buttons"><a className="button primary" href={calcLink(item,catalog)}><Calculator size={17}/> Simuler ce braquage</a><a className="button secondary" href={"/strategies#"+item.slug}>Voir le guide</a></div>}</section>
      <section className="panel padding"><h2>Fiches liées</h2>{related.length?related.map(e=><a key={e.slug} className="related" href={"/wiki/"+e.slug}><span>{e.name}<small>{e.kind}</small></span><ChevronRight size={16}/></a>):<p>Aucune fiche liée.</p>}</section>
    </div>
    {item.progression&&<section className="panel padding spaced"><h2>Matériel et points de progression</h2><Progression entry={item}/></section>}
  </>;
}
const calcLink=(e:Entry,c:Catalog)=>"/calculateurs?fiche="+encodeURIComponent(e.slug)+"&revision="+encodeURIComponent(c.id);
function Progression({entry}:{entry:Entry}){
  const p=entry.progression!;
  return <div className="progression">
    <dl className="metrics">
      <div><dt>Mini-forets à prévoir</dt><dd><strong>{p.miniDrills??"—"}</strong>{p.miniDrills!==undefined&&<small>{money(p.miniDrills*miniDrillPrice)} à l’achat</small>}</dd></div>
      <div><dt>Points USB</dt><dd><strong>{p.usbPoints===undefined?"Non documentés":"+"+p.usbPoints}</strong></dd></div>
      <div><dt>Points de tablette</dt><dd><strong>{p.tabletPoints===undefined?"Non documentés":"+"+p.tabletPoints}</strong></dd></div>
    </dl>
    <p>{p.note} <a className="inline-link" href={p.source} target="_blank" rel="noreferrer">Source <ArrowUpRight size={14}/></a></p>
  </div>;
}
function ProgressionTable({entries}:{entries:Entry[]}){
  if (!entries.length) return null;
  return <section id="progression" className="panel padding progression-summary"><h2>Mini-forets et points par braquage</h2>
    <p>Les chiffres supposent l’accès à tous les coffres et ordinateurs indiqués. Une tablette se remplit à 4 points et un USB à 5 points.</p>
    <div className="table-scroll" role="region" aria-label="Comparatif des braquages" tabIndex={0}><table><thead><tr><th scope="col">Braquage</th><th scope="col">Mini-forets</th><th scope="col">Points USB</th><th scope="col">Points de tablette</th></tr></thead>
    <tbody>{entries.map(e=><tr key={e.slug}><th scope="row"><a className="inline-link" href={"/wiki/"+e.slug}>{e.name}</a></th><td>{e.progression!.miniDrills??"—"}</td><td>{e.progression!.usbPoints===undefined?"Non documentés":"+"+e.progression!.usbPoints}</td><td>{e.progression!.tabletPoints===undefined?"—":"+"+e.progression!.tabletPoints}</td></tr>)}</tbody></table></div>
  </section>;
}
function Strategies({catalog}:{catalog:Catalog}){
  const [goal,setGoal]=useState(""),[group,setGroup]=useState(""),[equip,setEquip]=useState(""),[duration,setDuration]=useState(""),[budget,setBudget]=useState("");
  const guides=catalog.entries.filter(e=>e.guide);
  const results=guides.filter(e=>{const g=e.guide!;return (!goal||g.goal===goal)&&(!group||(+group>=g.min&&+group<=g.max))&&(!equip||e.links.includes(equip))&&(!duration||(g.minutes!==undefined&&g.minutes<=+duration))&&(!budget||(g.budget!==undefined&&g.budget<=+budget));});
  return <>
    <Heading icon={<Route/>} title="Stratégies de braquage">Choisis une sortie adaptée à ton groupe et aux accès que tu possèdes.</Heading>
    <p><a className="button secondary" href="/braquages-cles"><KeyRound size={17}/> Braquages à clé violette ou dorée</a></p>
    <ProgressionTable entries={guides.filter(e=>e.progression)}/>
    <div className="filter-bar"><Select label="Objectif" value={goal} set={setGoal} options={[...new Set(guides.map(e=>e.guide!.goal))]}/><Select label="Équipe" value={group} set={setGroup} options={[{value:"1",label:"Solo"},{value:"2",label:"Duo"},{value:"3",label:"3 joueurs"}]}/><Select label="Équipement disponible" value={equip} set={setEquip} options={catalog.entries.filter(e=>["Clé","Carte d’accès","Outil"].includes(e.kind)).map(e=>({value:e.slug,label:e.name}))}/><label className="field"><span>Durée max. (min)</span><input value={duration} type="number" min="1" onChange={e=>setDuration(e.target.value)} placeholder="Sans limite"/></label><label className="field"><span>Budget max. ($)</span><input value={budget} type="number" min="0" onChange={e=>setBudget(e.target.value)} placeholder="Sans limite"/></label></div>
    <p className="result-count">{results.length} {results.length===1?"guide":"guides"}</p>
    <div className="guide-list">{results.map(e=><article key={e.slug} id={e.slug} className="panel padding"><span className="tag">{e.guide!.goal}</span><h2>{e.name}</h2><div className="meta"><MapPin size={16}/>{e.district}<Users size={16}/>{e.guide!.min}–{e.guide!.max} joueurs <Clock size={16}/>{e.guide!.minutes?e.guide!.minutes+" min":"Durée inconnue"}</div><p>{e.description}</p>{e.progression&&<Progression entry={e}/>}<ol>{e.guide!.steps.map((s,i)=><li key={i}>{s}</li>)}</ol><p>{e.guide!.alternative}</p><div className="buttons"><a className="button primary" href={calcLink(e,catalog)}><Calculator size={17}/> Simuler la sortie</a><a className="button secondary" href={"/wiki/"+e.slug}>Fiche wiki</a></div></article>)}</div>
    {!results.length&&<Empty>Aucun guide ne correspond à ces critères. Les guides sans budget ou durée vérifiés sont exclus quand le filtre correspondant est renseigné.</Empty>}
  </>;
}
