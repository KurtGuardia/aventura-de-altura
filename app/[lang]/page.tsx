import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">Home {lang}</h1>
      <a href={`/${lang}/tours/test`} className="underline">
        {dict.buttons.viewTours}
      </a>
    </main>
  );
}
