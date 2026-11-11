"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StatusLinks, StatusPage } from "@/components/StatusPage";
import { button } from "@/components/ui";
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Error en el propio layout raíz (por ejemplo, si falla la carga de Sanity en
 * el layout). Reemplaza al layout, así que trae su documento, fuentes y estilos.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const lang = usePathname()?.startsWith("/en") ? "en" : "es";
  const { status } = lang === "en" ? en : es;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={lang} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-navy-950 font-sans">
        <title>{status.error.title}</title>
        <main>
          <StatusPage
            eyebrow={status.error.eyebrow}
            title={status.error.title}
            text={status.error.text}
            actions={
              <>
                <button type="button" onClick={() => retry()} className={`${button.base} ${button.large} ${button.accent}`}>
                  {status.error.retry}
                </button>
                <StatusLinks lang={lang} home={status.home} tours={status.tours} />
              </>
            }
          />
        </main>
      </body>
    </html>
  );
}
