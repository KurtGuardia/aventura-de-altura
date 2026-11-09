import Link from "next/link";
import { Facebook } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n";
import { siteName } from "@/lib/site";
import type { NavLink } from "./Header";

// `new Date()` no se puede usar fuera de una caché con cacheComponents:
// el año queda fijado en el build y se actualiza con cada despliegue.
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

/**
 * Footer mínimo. Los datos de contacto (WhatsApp, correo, idiomas) viven solo
 * en la sección Contacto de la home para no repetirlos.
 */
export async function Footer({
  dict,
  links,
  facebook,
}: {
  dict: Dictionary;
  links: NavLink[];
  facebook?: string | null;
}) {
  const year = await currentYear();

  return (
    <footer className="bg-forest-950 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-2xl text-white">{siteName}</p>
          <p className="mt-1 text-sm">Cochabamba, Bolivia</p>
        </div>

        <div className="flex items-center gap-8">
          {links.length > 0 && (
            <nav aria-label={dict.footer.nav}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.contact.followUs}
              className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Facebook className="size-5" />
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/50 md:px-8">
          © {year} {siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
