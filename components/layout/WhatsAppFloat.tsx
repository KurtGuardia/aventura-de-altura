import { WhatsApp } from "@/components/icons";

/**
 * Botón flotante de WhatsApp, solo en móvil (en escritorio el contacto está
 * en el header, la sección Contacto y el footer). Se incluye por página, no en
 * el layout: la página de tour tendrá su propio CTA fijo y no deben solaparse.
 */
export function WhatsAppFloat({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/25 transition-transform active:scale-95 md:hidden"
    >
      <WhatsApp className="size-7" />
    </a>
  );
}
