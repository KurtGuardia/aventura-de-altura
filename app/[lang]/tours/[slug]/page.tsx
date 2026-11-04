import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

// Con cacheComponents activo, generateStaticParams no puede devolver []
// (error de build). Mientras los slugs no vengan de Sanity, se usa un
// placeholder que responde 404. Los demás slugs se renderizan al pedirlos.
const PLACEHOLDER_SLUG = "__placeholder__";

export function generateStaticParams() {
  // TODO: obtener los slugs desde Sanity.
  return [{ slug: PLACEHOLDER_SLUG }];
}

export default async function TourPage({
  params,
}: PageProps<"/[lang]/tours/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || slug === PLACEHOLDER_SLUG) notFound();

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold">Tour: {slug}</h1>
    </main>
  );
}
