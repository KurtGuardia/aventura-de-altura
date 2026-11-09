/**
 * Separador con el perfil de una cordillera. Se coloca al borde de una sección
 * y se pinta con el color de la sección vecina (`className` con `text-*`),
 * así la sección siguiente "muerde" la anterior con la silueta de los picos.
 *
 * - `position="bottom"` (por defecto): pegado al borde inferior, picos hacia arriba.
 * - `position="top"`: pegado al borde superior, invertido.
 * - `flip`: espejo horizontal, para no repetir el mismo perfil.
 *
 * El padre debe tener `position: relative`.
 */
export function MountainDivider({
  className = "text-cream",
  position = "bottom",
  flip = false,
}: {
  className?: string;
  position?: "top" | "bottom";
  flip?: boolean;
}) {
  const transform = [position === "top" ? "scaleY(-1)" : "", flip ? "scaleX(-1)" : ""].join(" ").trim();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 h-[clamp(2.5rem,7vw,6.5rem)] ${
        position === "top" ? "-top-px" : "-bottom-px"
      } ${className}`}
      style={transform ? { transform } : undefined}
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="size-full" fill="currentColor">
        {/* Cordón trasero, más tenue. */}
        <path
          opacity="0.35"
          d="M0 120V78l70-22 58 18 92-46 64 30 78-38 96 52 70-26 88 34 104-62 74 40 66-20 98 48 82-30 74 20 96-44 86 36 72-18 72 26V120Z"
        />
        {/* Cordón delantero. */}
        <path d="M0 120V96l84-18 62 14 88-36 70 28 92-24 80 32 64-12 110 26 84-40 76 30 92-10 68 20 102-34 86 26 90-14 192 22V120Z" />
      </svg>
    </div>
  );
}
