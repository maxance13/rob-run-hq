import {renderToString} from "react-dom/server";
import {getMetadata,paths,PublicSite} from "./site";

export {getMetadata,paths};
export const render=(path:string)=>renderToString(<PublicSite path={path}/>);
