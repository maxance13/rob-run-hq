import {headers} from "next/headers";
import {notFound} from "next/navigation";
import {currentCatalog} from "@/db/store";
import {HQ} from "../hq";

export const dynamic="force-dynamic";
type Props={params:Promise<{path?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({params}:Props) {
  const [page,slug]=(await params).path??[];
  if (page==="wiki"&&slug) return {title:(await currentCatalog())?.entries.find(e=>e.slug===slug)?.name??"Wiki"};
  return page?{title:({wiki:"Wiki",calculateurs:"Calculateurs",strategies:"Stratégies","braquages-cles":"Braquages à clé violette ou dorée",observations:"Observations",admin:"Administration"} as Record<string,string>)[page]??"ROB RUN HQ"}:{};
}
export default async function Page({params,searchParams}:Props) {
  const [page="accueil",slug="",...tail]=(await params).path??[];
  if (!["accueil","wiki","calculateurs","strategies","braquages-cles","observations","admin"].includes(page)||tail.length||
    (slug && !["wiki","admin"].includes(page)) || (page==="admin"&&slug&&!["imports","publications"].includes(slug))) notFound();
  const query=Object.fromEntries(Object.entries(await searchParams).filter((pair):pair is [string,string]=>typeof pair[1]==="string"));
  const catalog=await currentCatalog(query.revision||undefined);
  if (!catalog || (page==="wiki" && slug && !catalog.entries.some(e=>e.slug===slug))) notFound();
  const loggedIn=Boolean((await headers()).get("oai-authenticated-user-id"));
  return <HQ page={page} slug={slug} query={query} catalog={catalog} loggedIn={loggedIn}/>;
}
