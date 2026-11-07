import type { ComponentType, ReactNode, SVGProps } from "react";
import { Document, Facebook, Globe, Mail, WhatsApp } from "@/components/icons";
import { button, container, Paragraphs, SectionHeading, sectionY } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { paragraphs, t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { whatsappHref } from "@/lib/site";

export function Contact({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  const phones = [settings?.whatsappPrimary, settings?.whatsappSecondary]
    .map((phone) => ({ phone, href: whatsappHref(phone, dict.whatsapp.general) }))
    .filter((p): p is { phone: string; href: string } => !!p.phone && !!p.href);
  const languages = t(settings?.contactLanguages, lang);
  const policy = paragraphs(t(settings?.bookingPolicy, lang));
  const email = settings?.email;
  const facebook = settings?.facebook;

  if (phones.length === 0 && !email && !languages && policy.length === 0) return null;

  return (
    <section id="contacto" className={`bg-forest-900 text-white ${sectionY}`}>
      <div className={`${container} grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20`}>
        <div>
          <SectionHeading title={dict.sections.contact} tone="light" />
          {phones[0] && (
            <a
              href={phones[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${button.base} ${button.whatsapp} mt-10`}
            >
              <WhatsApp className="size-5" />
              {dict.buttons.contactWhatsApp}
            </a>
          )}
        </div>

        <dl className="grid gap-8 sm:grid-cols-2">
          {phones.length > 0 && (
            <Item icon={WhatsApp} label={dict.contact.whatsapp}>
              <ul className="space-y-1">
                {phones.map((p) => (
                  <li key={p.phone}>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="hover:text-sand-200">
                      {p.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </Item>
          )}
          {email && (
            <Item icon={Mail} label={dict.contact.email}>
              <a href={`mailto:${email}`} className="break-all hover:text-sand-200">
                {email}
              </a>
            </Item>
          )}
          {languages && (
            <Item icon={Globe} label={dict.contact.languages}>
              {languages}
            </Item>
          )}
          {facebook && (
            <Item icon={Facebook} label={dict.contact.facebook}>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-sand-200">
                {dict.contact.followUs}
              </a>
            </Item>
          )}
          {policy.length > 0 && (
            <div className="sm:col-span-2">
              <Item icon={Document} label={dict.contact.bookingPolicy}>
                <Paragraphs items={policy} className="text-white/75" />
              </Item>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

function Item({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-white/15 pt-5">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sand-300">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="mt-3 text-lg leading-relaxed">{children}</dd>
    </div>
  );
}
