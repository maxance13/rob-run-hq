export const types = ["Braquage", "Lieu", "Clé", "Carte d’accès", "Outil", "Butin"] as const;
type Kind = typeof types[number];

export type Progression = {
  miniDrills?: number; usbPoints?: number; tabletPoints?: number; source: string; note: string;
};

export type Entry = {
  slug: string; name: string; kind: Kind; district: string; description: string;
  source: string; aliases: string[]; links: string[]; rarity?: string; target?: string;
  guide?: { goal: string; min: number; max: number; minutes?: number; budget?: number; steps: string[]; alternative: string };
  progression?: Progression;
  details?: { label: string; value: string }[];
  loot?: { label: string; quantity: number; value: number };
};

export type Catalog = { id: string; version: string; reviewed: string; entries: Entry[] };
export const sourceRoot = "https://www.robrun.fit/fr/heists/";
const bank = sourceRoot + "bank-vault", art = sourceRoot + "art-gallery", police = sourceRoot + "police-station", keys = sourceRoot + "keys";
const entry = (slug: string, name: string, kind: Kind, district: string, description: string, source: string, links: string[], extras: Partial<Entry> = {}): Entry =>
  ({slug, name, kind, district, description, source, links, aliases: [], ...extras});

export const initial: Catalog = {
  id: "initial", version: "Version exacte inconnue", reviewed: "2026-11-21",
  entries: [
    entry("banque", "Banque de Looty Bay", "Braquage", "Centre-ville", "La perceuse ouvre le coffre principal. Le coffre doré intérieur exige sa propre carte d’identité.", bank, ["centre-ville","perceuse","carte-coffre-dore","lingot"], {
      aliases: ["coffre de banque", "coffre doré"], guide: { goal:"Rentabilité", min:1,max:3, budget:50000,
      steps:["Préparez la perceuse et vérifiez si vous avez la carte d’identité du coffre doré.", "Ouvrez le coffre principal avec la perceuse.", "Utilisez la carte sur le coffre doré si vous l’avez. Notez le butin réellement récupéré."], alternative:"Sans carte, limitez la sortie au coffre principal. Le budget du filtre couvre seulement la part en espèces de l’échange de la perceuse." } }),
    entry("galerie", "Galerie d’art", "Braquage", "Parkside", "Deux accès distincts à Parkside. Le découpeur ouvre la vitrine du BIG EGG #53 et la carte-clé ouvre la salle du coffre.", art, ["parkside","decoupeur","carte-galerie","big-egg"], {
      aliases:["art gallery","œuf","big egg"], loot:{label:"BIG EGG #53 · revente communautaire à notoriété 1",quantity:1,value:550000},
      guide:{goal:"Butin rare",min:1,max:3,steps:["Choisissez la vitrine ou la salle du coffre avant votre départ.", "Prenez le découpeur pour la vitrine, ou la carte-clé correspondant à la galerie pour le coffre.", "Pour la vitrine, réservez quatre cases d’inventaire pour l’œuf."],alternative:"Avec la carte seule, préparez la salle du coffre. Le prix de l’œuf est une estimation communautaire."} }),
    entry("commissariat", "Commissariat de Parkside", "Braquage", "Parkside", "L’armurerie s’ouvre avec une carte d’identité. Une carte-clé correspondant au commissariat donne accès à la pièce verrouillée.", police, ["parkside","carte-armurerie","carte-commissariat","preuves"], {
      aliases:["police station","armurerie"], guide:{goal:"Progression",min:1,max:3,steps:["Choisissez entre l’armurerie et la pièce verrouillée.", "Pour l’armurerie, échangez 20 preuves contre la carte d’identité au motel de Lenny.", "Pour la pièce verrouillée, vérifiez que la description de votre carte-clé mentionne le commissariat."],alternative:"Si vous manquez de preuves, consultez la fiche de la carte-clé pour préparer l’autre accès."} }),
    entry("perceuse", "Perceuse", "Outil", "Centre-ville", "Ouvre le coffre principal de la banque. L’échange documenté demande une caméra d’action, deux outils USB remplis et 50 000 $ en jeu.", bank, ["banque"], {rarity:"Légendaire",target:"Coffre principal de la banque"}),
    entry("carte-coffre-dore", "Carte d’identité du coffre doré", "Carte d’accès", "Centre-ville", "S’obtient contre un jeu de clés de coffret rempli.", bank, ["banque","jeu-cles-coffret"], {aliases:["carte du coffre doré"],target:"Coffre doré intérieur de la banque"}),
    entry("carte-galerie", "Carte-clé de la galerie", "Carte d’accès", "Parkside", "Carte associée à la salle du coffre d’après le guide communautaire.", keys, ["galerie"], {aliases:["carte clé galerie"],rarity:"Légendaire",target:"Salle du coffre de la galerie"}),
    entry("carte-commissariat", "Carte-clé du commissariat", "Carte d’accès", "Parkside", "Cette carte-clé peut être obtenue dans des contenants en jeu selon le guide communautaire.", police, ["commissariat"], {aliases:["carte clé police"],rarity:"Légendaire",target:"Pièce verrouillée du commissariat"}),
    entry("carte-armurerie", "Carte d’identité de l’armurerie", "Carte d’accès", "Parkside", "Échangez 20 preuves au motel de Lenny.", police, ["commissariat","preuves"], {rarity:"Exotique",target:"Armurerie du commissariat"}),
    entry("jeu-cles-coffret", "Jeu de clés de coffret", "Clé", "Centre-ville", "Objet cumulatif à remplir en piratant les coffrets de la banque. Le jeu rempli s’échange contre la carte du coffre doré.", bank, ["carte-coffre-dore"], {aliases:["clés de coffret"]}),
    entry("decoupeur", "Découpeur de verre", "Outil", "Parkside", "L’échange documenté demande trois cartouches de code remplies.", art, ["galerie","big-egg"], {aliases:["glass cutter"],rarity:"Légendaire",target:"Vitrine du BIG EGG #53"}),
    entry("preuves", "Preuves", "Butin", "Parkside", "Lot de butin échangeable contre l’accès à l’armurerie du commissariat.", police, ["carte-armurerie","commissariat"], {rarity:"Épique"}),
    entry("big-egg", "BIG EGG #53", "Butin", "Parkside", "Trophée exposé dans la vitrine de la galerie.", art, ["galerie","decoupeur"], {rarity:"Exotique"}),
    entry("lingot", "Lingot d’or", "Butin", "Centre-ville", "Objet de valeur répertorié dans le coffre de la banque.", bank, ["banque"]),
    entry("centre-ville", "Centre-ville de Looty Bay", "Lieu", "Centre-ville", "Quartier où se trouve la banque de Looty Bay.", bank, ["banque"]),
    entry("parkside", "Parkside", "Lieu", "Parkside", "Quartier de Looty Bay qui comprend le commissariat et la galerie d’art.", art, ["galerie","commissariat"])
  ]
};

export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
export function search(entries: Entry[], query: string) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  return entries.filter(item => {
    const haystack = normalize([item.name,item.district,...item.aliases].join(" "));
    return tokens.every(token => haystack.includes(token));
  });
}
export const supportedBuild = "Steam 26807668 · 20/11/2026";
export const buildSource = "https://steamdb.info/patchnotes/26807668/";
export const containers = ["Armoire","Coffre-fort","Étagère","Bureau","Autre"];
export const lootTargets = (entries: Entry[]) => entries.filter(item => item.kind === "Clé" || item.kind === "Carte d’accès" || item.kind === "Butin");
