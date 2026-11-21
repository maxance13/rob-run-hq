import {createRoot, hydrateRoot} from "react-dom/client";
import {getMetadata, PublicSite} from "./site";
import "../app/globals.css";

const path=window.location.pathname;
const query=Object.fromEntries(new URLSearchParams(window.location.search));
const site=<PublicSite path={path} query={query}/>;
const root=document.getElementById("root")!;
document.title=getMetadata(path).title;
if (window.location.search) createRoot(root).render(site);
else hydrateRoot(root,site);
