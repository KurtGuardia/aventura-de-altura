"use client";

import { useEffect } from "react";
import { StatusLinks, StatusPage, useStatusTexts } from "@/components/StatusPage";
import { button } from "@/components/ui";

/** Error inesperado al renderizar una página de `[lang]` (header y footer se mantienen). */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { lang, error: texts, home, tours } = useStatusTexts();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow={texts.eyebrow}
      title={texts.title}
      text={texts.text}
      actions={
        <>
          <button type="button" onClick={() => retry()} className={`${button.base} ${button.large} ${button.accent}`}>
            {texts.retry}
          </button>
          <StatusLinks lang={lang} home={home} tours={tours} />
        </>
      }
    />
  );
}
