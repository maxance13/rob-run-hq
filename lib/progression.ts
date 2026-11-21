import {initial,type Catalog,type Entry,type Progression} from "./catalog";

const keys = "https://robrunstatus.com/guides/keys";
const heists = "https://robrunstatus.com/guides/heists";
const planner = "https://metaforge.app/rob-run/heists/";
const mini = "https://robrunwiki.com/en/items/mini_drill_1/";
const tablets = "https://robrun-game.com/guides/code-tablet";
const usb = "https://wikily.gg/rob-run/valuables/usb-hacking-tool-usb-1-full";

export const miniDrillPrice = 18000;
const drillGear = ["mini-foret","tablette-code","outil-usb"];
const progress = (source: string, miniDrills: number, tabletPoints: number, note: string, usbPoints?: number): Progression =>
  ({source,miniDrills,tabletPoints,note,...(usbPoints===undefined?{}:{usbPoints})});

const basePatches: Record<string, Partial<Entry>> = {
  banque: {
    progression:progress(heists+"#bank-vault",3,3,"Les trois grands coffres prennent environ 120 s chacun. Le coffre principal demande la grande perceuse. Les 12 coffrets de dépôt alimentent le jeu de clés séparément (+1 chacun selon le relevé communautaire)."),
    details:[{label:"Échange de la perceuse",value:"2 outils USB remplis (5 points chacun), 1 caméra d’action épique pleine (70 points à notoriété 3) et 50 000 $."}],
  },
  galerie: {
    progression:progress(keys+"#gallery-vault",2,2,"Les deux coffres et l’ordinateur sont dans la salle accessible avec la carte-clé. Le découpeur et ses trois tablettes servent à la vitrine du BIG EGG #53.",2),
    details:[{label:"Obtenir le découpeur",value:"Échange 3 tablettes remplies de 4 points chacune. Cela représente 12 ouvertures éligibles à +1 point."}],
  },
  commissariat: {
    progression:progress(heists+"#armory",3,3,"Les trois coffres renforcés et l’ordinateur sont documentés dans l’armurerie, accessible avec la carte d’identité échangée contre 20 preuves.",2),
  },
  perceuse: {
    description:"La grande perceuse ouvre le coffre principal de la banque. Pour l’obtenir, échange deux outils USB pleins, une caméra d’action épique pleine et 50 000 $.",
    details:[{label:"Remplir les USB",value:"5 points par outil. Trois ordinateurs à +2 points suffisent pour un outil, ou cinq à +1."},
      {label:"Remplir la caméra épique",value:"70 points à notoriété 3. Le guide communautaire indique notamment +5 par coffre renforcé et +10 par coffre de banque."}],
  },
  "jeu-cles-coffret": {
    details:[{label:"Progression",value:"60 points au total. Le relevé communautaire indique +1 par coffret de dépôt éligible, avec 12 coffrets recensés à la banque."},
      {label:"Palier III",value:"100 000 $ de recherche et 100 000 $ pour acheter le jeu de clés vide."}],
  },
  decoupeur: {
    details:[{label:"Tablettes nécessaires",value:"3 tablettes de code pleines, à raison de 4 points chacune."},
      {label:"Lieu de l’échange",value:"Porte d’échange du motel de Lenny."}],
  }
};

const additions: Entry[] = [
  {
    slug:"mini-foret",name:"Mini-foret (Mini Drill)",kind:"Outil",district:"Looty Bay",source:mini,rarity:"Épique",
    aliases:["mini forets","mini perceuse","mini drill","mini foreuse"],
    links:["tablette-code","banque","galerie","commissariat","station-service","grand-hotel","club","equipement-est"],
    description:"Ouvre les coffres renforcés et les grands coffres de la banque. Prévois un mini-foret par coffre que tu comptes ouvrir.",
    details:[{label:"Achat au portable de troc II",value:"18 000 $ l’unité après la recherche."},
      {label:"Recherche du mini-foret",value:"100 000 $ pour le nœud de recherche, hors prérequis."},
      {label:"Temps par coffre",value:"Environ 60 s pour les coffres renforcés ordinaires et 120 s pour les grands coffres de la banque."}]
  },
  {
    slug:"tablette-code",name:"Tablette de code (Code Tablet)",kind:"Outil",district:"Looty Bay",source:tablets,rarity:"Épique",
    aliases:["tablettes de codes","tablettes de code","tablette de codes","cartouche de code","cartouches de codes","code tablet"],
    links:["mini-foret","decoupeur","galerie","station-service","outil-usb"],
    description:"Garde une tablette vide ou entamée dans ton inventaire quand tu ouvres les coffres de Looty Bay. Les coffres éligibles ajoutent un point à sa progression.",
    details:[{label:"Remplissage",value:"4 points, soit 4 coffres éligibles à +1. Un coffre qui s’ouvre avec sa propre clé peut aussi compter."},
      {label:"Achat au portable de troc II",value:"25 000 $ de recherche pour le nœud, puis 20 000 $ par tablette vide."},
      {label:"Échange",value:"3 tablettes pleines pour 1 découpeur de verre, soit 12 points répartis sur les trois tablettes."},
      {label:"Revente documentée",value:"75 000 $ par tablette pleine au receleur à notoriété 1."}]
  },
  {
    slug:"outil-usb",name:"Outil de piratage USB",kind:"Outil",district:"Looty Bay",source:usb,rarity:"Légendaire",
    aliases:["piratage","outil usb","usb hacking tool","cle usb","points de piratage","ordinateur"],
    links:["tablette-code","perceuse","commissariat","galerie","station-service","grand-hotel","club","equipement-est"],
    description:"Emporte l’outil dans ton inventaire pour obtenir des points quand tu pirates les ordinateurs sécurisés dans les salles verrouillées.",
    details:[{label:"Remplissage",value:"5 points par USB, avec +1 ou +2 selon l’ordinateur. Exemple : Grand Hotel +2, galerie +2, magasin d’équipement Est +1."},
      {label:"Achat au portable de troc II",value:"50 000 $ de recherche pour le nœud après la tablette de code, puis 50 000 $ par outil vide."},
      {label:"Échange",value:"2 USB pleins pour la recette de la grande perceuse, en plus de la caméra épique pleine et des 50 000 $."}]
  },
  {
    slug:"station-service",name:"Station-service du centre-ville",kind:"Braquage",district:"Centre-ville",source:planner+"gas-station",
    aliases:["gas station","clé violette","clé dorée","pièce gauche","pièce droite"],links:drillGear,
    description:"Deux pièces cachées avec chacune sa clé. Un coffre séparé s’ouvre avec la clé de coffre de la station.",
    progression:progress(keys+"#locked-rooms",3,4,"Trois coffres au mini-foret et un à la clé de coffre. Chaque pièce cachée a un ordinateur à +1 point USB, soit +2 au total si tu ouvres les deux.",2),
    guide:{goal:"Progression",min:1,max:3,budget:54000,steps:["Vérifie quelle pièce ta clé ouvre. Les deux pièces ont des clés différentes.","Emporte une tablette de code et un outil USB en cours de remplissage.","Prévois trois mini-forets pour couvrir les trois coffres renforcés, puis la clé de coffre pour le quatrième."],alternative:"Une seule clé de pièce permet d’accéder à un seul ordinateur à +1 USB. Le budget couvre l’achat des mini-forets."}
  },
  {
    slug:"grand-hotel",name:"Grand Hotel · Entrepôt secret",kind:"Braquage",district:"Sunny Beach",source:planner+"grand-hotel",
    aliases:["grand hôtel","salle de poker","clé dorée","carte grand hotel"],links:drillGear,
    description:"La carte-clé du Grand Hotel donne accès à l’entrepôt secret, aussi appelé salle de poker.",
    progression:progress(keys+"#grand-hotel",2,2,"Les coffres et l’ordinateur sont derrière l’accès par carte. Le brouilleur sert à la voiture d’exposition.",2),
    guide:{goal:"Progression",min:1,max:3,budget:36000,steps:["Vérifie que ta carte-clé est celle du Grand Hotel.","Prévois deux mini-forets pour les deux coffres. Garde ta tablette et ton USB dans ton inventaire.","Pirate l’ordinateur de l’entrepôt pour +2 points."],alternative:"Si ton objectif est uniquement la progression USB, vise l’ordinateur. Le budget couvre les deux mini-forets."}
  },
  {
    slug:"club",name:"Strip Club · Salle VIP",kind:"Braquage",district:"Sunny Beach",source:planner+"strip-club",
    aliases:["strip club","club de strip-tease","clé dorée","clé vip"],links:drillGear,
    description:"La clé de pièce légendaire ouvre la salle VIP. Une deuxième clé est prévue pour le coffre à serrure.",
    progression:progress("https://metaforge.app/rob-run/how-to-rob-the-strip-club-and-gas-station-in-rob-run",2,3,"Deux coffres au mini-foret et un coffre à clé. L’ordinateur rapporte +2 points USB.",2),
    guide:{goal:"Progression",min:1,max:3,budget:36000,steps:["Prépare la clé VIP et la clé de coffre si tu vises les trois ouvertures.","Prévois deux mini-forets pour les deux coffres compatibles.","Emporte l’USB pour les deux points documentés."],alternative:"La clé VIP t’intéresse surtout si tu vises l’accès et le piratage. Le budget couvre les deux mini-forets."}
  },
  {
    slug:"equipement-est",name:"Magasin d’équipement Est",kind:"Braquage",district:"Centre-ville",source:planner+"equipment-store-east",
    aliases:["equipment store east","clé violette","magasin equipement"],links:drillGear,
    description:"La clé de pièce du magasin d’équipement du centre-ville donne accès à sa salle verrouillée.",
    progression:progress(planner+"equipment-store-east",2,2,"Deux coffres sont indiqués au mini-foret. L’ordinateur donne +1 point USB, pratique lorsqu’il te manque un seul point.",1),
    guide:{goal:"Progression",min:1,max:3,budget:36000,steps:["Prends la clé de pièce correspondant au magasin d’équipement Est.","Prévois deux mini-forets pour les deux coffres et une tablette à remplir.","Utilise ton outil USB sur l’ordinateur de la pièce verrouillée."],alternative:"Tu peux viser uniquement le point USB si ton outil est déjà à 4/5. Le budget couvre les deux mini-forets."}
  }
];

export const progressionCatalog: Catalog = {
  ...initial,
  id:"progression-2026-11-21",
  entries:[...initial.entries.map(original=>{
    const patch=basePatches[original.slug];
    if(!patch) return original;
    const extraLinks=original.kind==="Braquage"?drillGear:original.slug==="perceuse"?["outil-usb"]:original.slug==="decoupeur"?["tablette-code"]:[];
    return {...original,...patch,links:[...original.links,...extraLinks]};
  }),...additions]
};
