import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram } from "@/components/icons";
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
  instagram,
}: {
  dict: Dictionary;
  links: NavLink[];
  facebook?: string | null;
  instagram?: string | null;
}) {
  const year = await currentYear();

  return (
    <footer className="tone-dark bg-navy-950 text-white/70">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-8 border-t border-white/10 px-gutter py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image src="/logo-mark.png" alt="" width={64} height={64} className="size-14 rounded-full md:size-16" />
          <div>
            <p className="font-display text-3xl uppercase tracking-wide text-white">{siteName}</p>
            <p className="label-mono mt-2 text-white/55">Cochabamba, Bolivia</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {links.length > 0 && (
            <nav aria-label={dict.footer.nav}>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {(facebook || instagram) && (
            <div className="flex gap-3">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label={dict.contact.followUs} className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white">
                  <Facebook className="size-5" />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label={dict.contact.followUsInstagram} className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white">
                  <Instagram className="size-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[90rem] px-gutter py-6 text-xs text-white/55">
          © {year} {siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
