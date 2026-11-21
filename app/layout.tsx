import type {Metadata} from "next";
import type {ReactNode} from "react";
import "./globals.css";
export const metadata: Metadata = {
  title:{default:"ROB RUN HQ — Wiki, Calculateurs et Stratégies",template:"%s · ROB RUN HQ"},
  icons: "/favicon.svg",
  description:"Retrouvez les clés, préparez vos braquages et calculez vos gains dans ROB RUN."
};
export default function Layout({children}:{children:ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
