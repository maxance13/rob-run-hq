"use client";

import {useState} from "react";
import {ArrowUpRight,KeyRound,MapPin,Search} from "lucide-react";
import {normalize,type Entry} from "@/lib/catalog";
import {keyHeists,keyGuideSource,type KeyHeist} from "@/lib/key-heists";
import {miniDrillPrice} from "@/lib/progression";
import {Empty,Heading,Select,money} from "./hq";

const families = [
  {id:"violet",label:"Clés violettes",rarity:"Épiques"},
  {id:"gold",label:"Clés dorées",rarity:"Légendaires"}
] as const;

function KeyCard({heist,related}:{heist:KeyHeist;related:boolean}){
  const points=(value:number|null)=>value===null?"—":"+"+value;
  return <article className="panel padding key-card" id={heist.id}>
    <p className="meta"><MapPin size={15}/>{heist.district}</p>
    <h3>{heist.name}</h3><p className="key-opening">{heist.opening}</p>
    <dl className="key-metrics">
      <div><dt>Mini-forets</dt><dd>{heist.mini??"—"}</dd></div>
      <div><dt>Points USB</dt><dd>{points(heist.usb)}</dd></div>
      <div><dt>Points tablette</dt><dd>{points(heist.tablet)}</dd></div>
    </dl>
    {heist.mini!==null&&<p className="key-budget">Mini-forets à l’achat · {money(heist.mini*miniDrillPrice)}</p>}
    {heist.note&&<p className="key-note">{heist.note}</p>}
    <div className="key-links">
      {related&&<a className="inline-link" href={"/wiki/"+heist.wiki}>Fiche wiki</a>}
      <a className="inline-link" href={heist.source} rel="noreferrer" target="_blank">Source <ArrowUpRight size={14}/></a>
    </div>
  </article>;
}

export function KeyHeists({entries}:{entries:Entry[]}){
  const [family,setFamily]=useState(""),[district,setDistrict]=useState(""),[query,setQuery]=useState("");
  const available=new Set(entries.map(e=>e.slug));
  const districts=[...new Set(keyHeists.map(h=>h.district))].sort();
  const tokens=normalize(query).split(" ").filter(Boolean);
  const visible=keyHeists.filter(h=>{
    const text=normalize([h.name,h.district,h.opening,h.note??""].join(" "));
    return (!family||h.family===family)&&(!district||h.district===district)&&tokens.every(t=>text.includes(t));
  });
  return <>
    <Heading icon={<KeyRound/>} title="Braquages à clé violette ou dorée">Trouve la pièce que ta clé ouvre et le matériel à prévoir pour la fouiller.</Heading>
    <div className="filter-bar">
      <label className="search-field"><Search size={18}/><input type="search" aria-label="Rechercher un braquage" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un lieu…"/></label>
      <Select label="Couleur" value={family} set={setFamily} options={families.map(f=>({value:f.id,label:f.label}))} placeholder="Toutes"/>
      <Select label="Quartier" value={district} set={setDistrict} options={districts}/>
    </div>
    <p className="result-count" aria-live="polite">{visible.length} accès sur {keyHeists.length}</p>
    <p className="notice">Les chiffres concernent l’accès indiqué. Certains coffres du bâtiment ont leur propre clé. Un tiret indique une donnée à confirmer.</p>
    {!visible.length&&<Empty>Aucun accès ne correspond à ces critères.</Empty>}
    {families.map(f=>{
      const rows=visible.filter(h=>h.family===f.id);
      if(!rows.length) return null;
      return <section key={f.id} className={"key-group "+f.id} aria-label={f.label}>
        <div className="section-head"><h2><KeyRound size={22}/>{f.label}</h2><span className="tag">{f.rarity} · {rows.length}</span></div>
        <div className="card-grid">{rows.map(h=><KeyCard key={h.id} heist={h} related={Boolean(h.wiki&&available.has(h.wiki))}/>)}</div>
      </section>;
    })}
    <p className="notice">La carte exotique du coffre doré de la banque et celle de l’armurerie du commissariat sont des accès d’échange. <a className="inline-link" href={keyGuideSource} target="_blank" rel="noreferrer">Guide des familles de clés <ArrowUpRight size={14}/></a></p>
  </>;
}
