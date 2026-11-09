import type { ComponentType, ReactNode, SVGProps } from "react";
import { Document, Facebook, Globe, Instagram, Mail, WhatsApp } from "@/components/icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { button, container, Paragraphs, SectionHeading } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { paragraphs, t } from "@/lib/sanity/locale";
import type { SiteSettings } from "@/lib/sanity/types";
import { whatsappHref } from "@/lib/site";

/** Contacto: WhatsApp destacado y datos con jerarquía clara. Correo y política solo si existen. */
export function Contact({ lang, dict, settings }: { lang: Locale; dict: Dictionary; settings: SiteSettings | null }) {
  const phones = [settings?.whatsappPrimary, settings?.whatsappSecondary]
    .map((phone) => ({ phone, href: whatsappHref(phone, dict.whatsapp.general) }))
    .filter((p): p is { phone: string; href: string } => !!p.phone && !!p.href);
  const languages = t(settings?.contactLanguages, lang);
  const policy = paragraphs(t(settings?.bookingPolicy, lang));
  const email = settings?.email;
  const facebook = settings?.facebook;
  const instagram = settings?.instagram;

  if (phones.length === 0 && !email && !languages && policy.length === 0) return null;

  return (
    <section id="contacto" className="tone-dark grain relative border-t border-white/10 bg-navy-950 py-section">
      <div className={`${container} grid gap-16 lg:grid-cols-2 lg:gap-24`}>
        <div>
          <SectionHeading title={dict.sections.contact} tone="light" size="xl" />
          {phones[0] && (
            <Reveal delay={0.2} className="mt-12">
              <MagneticButton>
                <a
                  href={phones[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${button.base} ${button.large} ${button.whatsapp}`}
                >
                  <WhatsApp className="size-6" />
                  {dict.buttons.contactWhatsApp}
                </a>
              </MagneticButton>
            </Reveal>
          )}
        </div>

        <Stagger as="dl" className="grid content-start gap-x-10 gap-y-10 sm:grid-cols-2">
          {phones.length > 0 && (
            <Item icon={WhatsApp} label={dict.contact.whatsapp}>
              <ul className="space-y-1 font-mono text-xl">
                {phones.map((p) => (
                  <li key={p.phone}>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="hover:text-ember-300">
                      {p.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </Item>
          )}
          {email && (
            <Item icon={Mail} label={dict.contact.email}>
              <a href={`mailto:${email}`} className="break-all hover:text-ember-300">
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
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-ember-300">
                {dict.contact.followUs}
              </a>
            </Item>
          )}
          {instagram && (
            <Item icon={Instagram} label={dict.contact.instagram}>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ember-300">
                {dict.contact.followUsInstagram}
              </a>
            </Item>
          )}
          {policy.length > 0 && (
            <Item icon={Document} label={dict.contact.bookingPolicy} wide>
              <Paragraphs items={policy} className="text-base text-white/75" />
            </Item>
          )}
        </Stagger>
      </div>
    </section>
  );
}

function Item({
  icon: Icon,
  label,
  wide,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <StaggerItem className={`border-t border-white/15 pt-5 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="label-mono flex items-center gap-2 text-ember-300">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="mt-4 text-lg leading-relaxed">{children}</dd>
    </StaggerItem>
  );
}
