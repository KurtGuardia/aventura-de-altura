/**
 * Solo para el servidor: lee DEEPL_API_KEY, que nunca debe llegar al navegador.
 *
 * Traducción automática de textos. Todo lo específico del proveedor (DeepL)
 * vive en este archivo: para cambiar de proveedor basta con reescribir
 * `translateTexts` manteniendo su firma y los errores que lanza.
 */

export type TargetLanguage = "EN-US";

/** Falta la configuración del proveedor (por ejemplo, la API key). */
export class TranslationNotConfiguredError extends Error {
  constructor() {
    super("Traducción no configurada todavía");
    this.name = "TranslationNotConfiguredError";
  }
}

/** El proveedor respondió con un error. El mensaje es apto para el usuario. */
export class TranslationProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslationProviderError";
  }
}

// DeepL acepta como máximo 50 textos por petición.
const DEEPL_MAX_TEXTS_PER_REQUEST = 50;

type DeepLResponse = { translations: { text: string }[] };

/** Traduce del español al idioma indicado, conservando el orden de `texts`. */
export async function translateTexts(texts: string[], target: TargetLanguage): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey) throw new TranslationNotConfiguredError();
  if (texts.length === 0) return [];

  // Las claves del plan gratuito terminan en ":fx" y usan otro dominio.
  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const results: string[] = [];
  for (let i = 0; i < texts.length; i += DEEPL_MAX_TEXTS_PER_REQUEST) {
    const chunk = texts.slice(i, i + DEEPL_MAX_TEXTS_PER_REQUEST);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: chunk,
        source_lang: "ES",
        target_lang: target,
        preserve_formatting: true,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new TranslationProviderError(deeplErrorMessage(response.status));
    }

    const data = (await response.json()) as DeepLResponse;
    if (data.translations?.length !== chunk.length) {
      throw new TranslationProviderError("El servicio de traducción devolvió una respuesta inesperada.");
    }
    results.push(...data.translations.map((t) => t.text));
  }
  return results;
}

function deeplErrorMessage(status: number): string {
  switch (status) {
    case 403:
      return "La clave del servicio de traducción no es válida.";
    case 429:
      return "Demasiadas traducciones seguidas. Espera un momento y vuelve a intentarlo.";
    case 456:
      return "Se agotó el límite mensual de traducción gratuita.";
    default:
      return `El servicio de traducción falló (código ${status}). Inténtalo más tarde.`;
  }
}
