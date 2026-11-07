import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale } from "@/lib/i18n";

// Con cacheComponents activo, generateStaticParams no puede devolver []
// (error de build). Mientras los slugs no vengan de Sanity, se usa un
// placeholder que responde 404. Los demás slugs se renderizan al pedirlos.
const PLACEHOLDER_SLUG = "__placeholder__";

export function generateStaticParams() {
  // TODO: obtener los slugs desde Sanity.
  return [{ slug: PLACEHOLDER_SLUG }];
}

// Con partialPrefetching, el App Shell se comparte entre todos los tours:
// `params` no se puede leer fuera de <Suspense> o el shell quedaría atado a
// una URL. La página pasa la promesa sin esperarla y el hijo la resuelve
// dentro del límite.
export default function TourPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <TourContent params={params} />
    </Suspense>
  );
}

async function TourContent({ params }: Pick<PageProps<"/[lang]/tours/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || slug === PLACEHOLDER_SLUG) notFound();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold">Tour: {slug}</h1>
    </div>
  );
}
