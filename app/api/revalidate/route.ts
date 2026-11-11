import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { TAGS, tourTag } from "@/lib/sanity/fetch";

/**
 * Revalidación on-demand desde el webhook de Sanity (ver
 * docs/05-despliegue.md). Sanity firma cada llamada con
 * SANITY_REVALIDATE_SECRET; sin firma válida no se revalida nada.
 *
 * Proyección del webhook: `{_type, "slug": slug.current}`.
 *
 * Cada consulta de lib/sanity/fetch.ts lleva el tag de los tipos que lee, así
 * que basta con invalidar el tag del tipo que cambió:
 * - tour → `tour` (home, galería, todas las páginas de tour) y `tour:<slug>`.
 * - tourCategory → `tourCategory` (tarjetas y páginas de tour).
 * - siteSettings, testimonial, gallery → su tag (home, galería y, en el caso
 *   de siteSettings, también el layout y las páginas de tour).
 */

type WebhookBody = { _type?: string; slug?: string | null };

// `expire: 0`: la siguiente visita espera al contenido nuevo en lugar de
// recibir una vez la versión anterior. El cliente publica y, al recargar, ya
// ve el cambio.
const PROFILE = { expire: 0 } as const;

function tagsFor({ _type, slug }: WebhookBody): string[] {
  switch (_type) {
    case "tour":
      return slug ? [TAGS.tour, tourTag(slug)] : [TAGS.tour];
    case "tourCategory":
    case "siteSettings":
    case "testimonial":
    case "gallery":
      return [TAGS[_type]];
    default:
      return [];
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  // Sin secreto, parseBody no valida la firma: se rechaza siempre.
  if (!secret) {
    return NextResponse.json({ message: "Falta SANITY_REVALIDATE_SECRET en el servidor." }, { status: 500 });
  }

  try {
    // true: espera a que el Content Lake tenga el cambio antes de seguir.
    const { isValidSignature, body } = await parseBody<WebhookBody>(request, secret, true);
    if (!isValidSignature) {
      return NextResponse.json({ message: "Firma inválida." }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Falta _type en el cuerpo." }, { status: 400 });
    }

    const tags = tagsFor(body);
    for (const tag of tags) revalidateTag(tag, PROFILE);

    return NextResponse.json({ revalidated: tags.length > 0, type: body._type, tags, now: Date.now() });
  } catch (error) {
    console.error("[revalidate]", error);
    return NextResponse.json({ message: "No se pudo procesar el webhook." }, { status: 500 });
  }
}
