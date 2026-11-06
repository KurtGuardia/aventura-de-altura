import { NextResponse, type NextRequest } from "next/server";
import {
  TranslationNotConfiguredError,
  TranslationProviderError,
  translateTexts,
} from "@/lib/translate";

// Límite de caracteres por petición (suma de todos los textos), para
// proteger la cuota mensual del servicio de traducción.
const MAX_CHARS = 20_000;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Solo acepta peticiones del propio sitio (el Studio en /studio).
 * Bloquea el uso desde otras webs a través del navegador; no es una
 * autenticación frente a clientes que falsifiquen las cabeceras.
 */
function isSameOrigin(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin";
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return error("Origen no permitido.", 403);

  let texts: unknown;
  try {
    ({ texts } = await request.json());
  } catch {
    return error("Petición no válida.", 400);
  }
  if (!Array.isArray(texts) || texts.length === 0 || !texts.every((t) => typeof t === "string")) {
    return error("Petición no válida: se esperaba una lista de textos.", 400);
  }

  const totalChars = texts.reduce((sum: number, t: string) => sum + t.length, 0);
  if (totalChars > MAX_CHARS) {
    return error(
      `El documento tiene demasiado texto para traducirlo de una vez (${totalChars.toLocaleString("es")} caracteres; máximo ${MAX_CHARS.toLocaleString("es")}).`,
      413,
    );
  }

  try {
    const translations = await translateTexts(texts, "EN-US");
    return NextResponse.json({ translations });
  } catch (err) {
    if (err instanceof TranslationNotConfiguredError) return error(err.message, 503);
    if (err instanceof TranslationProviderError) return error(err.message, 502);
    console.error("Error al traducir:", err);
    return error("No se pudo traducir. Inténtalo más tarde.", 500);
  }
}
