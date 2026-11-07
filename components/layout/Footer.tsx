import { Facebook, Mail, WhatsApp } from "@/components/icons";
import type { Dictionary, Locale } from "@/lib/i18n";
import { t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { siteName, whatsappHref } from "@/lib/site";

// `new Date()` no se puede usar fuera de una caché con cacheComponents:
// el año queda fijado en el build y se actualiza con cada despliegue.
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  const year = await currentYear();
  const phones = [settings?.whatsappPrimary, settings?.whatsappSecondary].filter(
    (p): p is string => !!p,
  );
  const languages = t(settings?.contactLanguages, lang);

  return (
    <footer className="bg-forest-950 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-2xl text-white">{siteName}</p>
          <p className="mt-2 text-sm">Cochabamba, Bolivia</p>
          {languages && <p className="mt-4 max-w-xs text-sm">{languages}</p>}
        </div>

        {phones.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand-300">
              {dict.contact.whatsapp}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={whatsappHref(phone, dict.whatsapp.general) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <WhatsApp className="size-4" />
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(settings?.email || settings?.facebook) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sand-300">
              {dict.nav.contact}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Mail className="size-4" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.facebook && (
                <li>
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Facebook className="size-4" />
                    {dict.contact.facebook}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/50 md:px-8">
          © {year} {siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
