"use client";

import { StatusLinks, StatusPage, useStatusTexts } from "@/components/StatusPage";

/** 404 dentro del sitio (con header y footer), en el idioma de la URL. */
export default function NotFound() {
  const { lang, notFound, home, tours } = useStatusTexts();
  return (
    <StatusPage
      eyebrow={notFound.eyebrow}
      title={notFound.title}
      text={notFound.text}
      actions={<StatusLinks lang={lang} home={home} tours={tours} />}
    />
  );
}
