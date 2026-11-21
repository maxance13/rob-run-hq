export type KeyHeist = {
  id:string; name:string; district:string; opening:string; family:"violet"|"gold";
  mini:number|null; usb:number|null; tablet:number|null; note?:string;
  wiki?:string; source:string;
};

const guide="https://robrunstatus.com/guides/keys";
const planner="https://metaforge.app/rob-run/heists/";
const downtown="Centre-ville", beach="Sunny Beach", hills="Loraine Hills", park="Parkside";

export const keyHeists: KeyHeist[] = [
  {id:"armes-ouest",name:"Armurerie Ouest",district:beach,opening:"Pièce verrouillée",family:"violet",mini:2,usb:1,tablet:2,source:planner+"gun-shop-west"},
  {id:"equipement-ouest",name:"Magasin d’équipement Ouest",district:beach,opening:"Pièce verrouillée",family:"violet",mini:2,usb:1,tablet:2,source:planner+"equipment-store-west"},
  {id:"armes-est",name:"Armurerie Est",district:downtown,opening:"Pièce verrouillée",family:"violet",mini:2,usb:1,tablet:2,source:"https://metaforge.app/rob-run/robbing-jewellery-stores-and-shops-in-rob-run"},
  {id:"equipement-est",name:"Magasin d’équipement Est",district:downtown,opening:"Pièce verrouillée",family:"violet",mini:2,usb:1,tablet:2,wiki:"equipement-est",source:planner+"equipment-store-east"},
  {id:"station-gauche",name:"Station-service",district:downtown,opening:"Pièce cachée de gauche",family:"violet",mini:1,usb:1,tablet:1,note:"La clé de coffre du rez-de-chaussée est un accès supplémentaire.",wiki:"station-service",source:guide},
  {id:"cottage-sud",name:"Cottage sud",district:hills,opening:"Pièce verrouillée",family:"violet",mini:1,usb:2,tablet:1,source:"https://robrungame.com/locations/city-house-6/"},
  {id:"pharmacie-centre",name:"Pharmacie du centre-ville",district:downtown,opening:"Pièce verrouillée",family:"violet",mini:1,usb:1,tablet:1,note:"Un coffre supplémentaire est recensé avec sa propre clé.",source:"https://metaforge.app/rob-run/robbing-jewellery-stores-and-shops-in-rob-run"},
  {id:"pharmacie-plage",name:"Pharmacie de Sunny Beach",district:beach,opening:"Pièce verrouillée",family:"violet",mini:1,usb:1,tablet:1,note:"Un coffre supplémentaire est recensé avec sa propre clé.",source:planner+"pharmacy-sunny-beach"},
  {id:"epicerie-nord",name:"Supérette du nord-est",district:downtown,opening:"Pièce verrouillée",family:"violet",mini:1,usb:1,tablet:1,note:"Cherche la supérette du nord-est. Celle du centre a une autre clé de coffre.",source:planner+"convenience-store-downtown-north"},
  {id:"epicerie-plage",name:"Supérette de Sunny Beach",district:beach,opening:"Pièce verrouillée",family:"violet",mini:1,usb:1,tablet:1,note:"Un coffre supplémentaire est recensé avec sa propre clé.",source:planner+"convenience-store-sunny-beach"},
  {id:"reef",name:"Reef Hotel",district:beach,opening:"Pièce verrouillée",family:"violet",mini:2,usb:1,tablet:2,note:"La clé de pièce mentionne « l’un des hôtels ». Le coffre séparé demande sa propre clé.",source:planner+"reef-hotel"},
  {id:"station-droite",name:"Station-service",district:downtown,opening:"Pièce cachée de droite",family:"gold",mini:2,usb:1,tablet:2,note:"L’ordinateur de l’autre pièce demande la clé violette.",wiki:"station-service",source:guide},
  {id:"vip",name:"Strip Club",district:beach,opening:"Salle VIP",family:"gold",mini:2,usb:2,tablet:2,note:"Un troisième coffre dans le bâtiment s’ouvre avec sa propre clé.",wiki:"club",source:planner+"strip-club"},
  {id:"hotel",name:"Grand Hotel",district:beach,opening:"Entrepôt secret · carte-clé",family:"gold",mini:2,usb:2,tablet:2,note:"La voiture d’exposition demande le brouilleur.",wiki:"grand-hotel",source:guide},
  {id:"galerie",name:"Galerie d’art",district:park,opening:"Salle du coffre · carte-clé",family:"gold",mini:2,usb:2,tablet:2,note:"La vitrine du BIG EGG #53 demande un découpeur de verre.",wiki:"galerie",source:guide},
  {id:"commissariat",name:"Commissariat",district:park,opening:"Pièce verrouillée · carte-clé",family:"gold",mini:null,usb:null,tablet:null,note:"La porte exacte reste à confirmer. Les 3 mini-forets et les +2 points USB de la fiche concernent l’armurerie, accessible avec sa propre carte obtenue contre 20 preuves.",wiki:"commissariat",source:guide},
  {id:"cottage-nord-est",name:"Cottage nord-est",district:hills,opening:"Sous-sol · carte-clé",family:"gold",mini:2,usb:1,tablet:2,source:"https://robrungame.com/locations/city-drug-house/"}
];

export const keyGuideSource=guide;
