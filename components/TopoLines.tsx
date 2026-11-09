/**
 * Curvas de nivel (mapa topográfico) como textura de fondo. Decorativo; se
 * pinta con `currentColor`. El padre debe tener `position: relative`.
 */
const BLOB = "M0,-300 C170,-290 330,-170 320,0 C310,170 160,300 -20,290 C-200,280 -340,150 -330,-10 C-320,-180 -170,-310 0,-300Z";
const RINGS = [1, 0.84, 0.68, 0.52, 0.36, 0.2];

export function TopoLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
      fill="none"
      stroke="currentColor"
    >
      <defs>
        <path id="topo-blob" d={BLOB} />
      </defs>
      {RINGS.map((s, i) => (
        <use
          key={`a${s}`}
          href="#topo-blob"
          transform={`translate(930 330) rotate(${i * 7}) scale(${s})`}
          vectorEffect="non-scaling-stroke"
          strokeWidth="1"
        />
      ))}
      {RINGS.slice(0, 4).map((s, i) => (
        <use
          key={`b${s}`}
          href="#topo-blob"
          transform={`translate(140 760) rotate(${-20 - i * 9}) scale(${s * 0.85})`}
          vectorEffect="non-scaling-stroke"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
