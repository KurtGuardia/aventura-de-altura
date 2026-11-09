import type { ReactNode } from "react";
import { Clock, Gauge, Globe, MapPin, Mountain } from "@/components/icons";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { container } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { TourDetailView } from "@/lib/tour-detail";

type Fact = { key: string; label: string; icon: ReactNode; value: ReactNode };
type MaybeFact = Fact | false | 0 | "" | undefined;

/**
 * Franja de datos rápidos bajo la portada: ícono, etiqueta y valor en mono.
 * Cada dato vacío no se renderiza; sin datos, no hay franja.
 * Móvil: 2 columnas. Escritorio: una fila con separadores.
 */
export function TourQuickFacts({ tour, lang, dict }: { tour: TourDetailView; lang: Locale; dict: Dictionary }) {
  const { duration, difficulty, altitude, departure, languages } = tour.facts;
  const icon = "size-5 text-forest-600";

  const candidates: MaybeFact[] = [
    duration && { key: "duration", label: dict.labels.duration, icon: <Clock className={icon} />, value: duration },
    difficulty && { key: "difficulty", label: dict.labels.difficulty, icon: <Gauge className={icon} />, value: difficulty },
    altitude && {
      key: "altitude",
      label: dict.labels.altitude,
      icon: <Mountain className={icon} />,
      value: (
        <>
          <CountUp value={altitude} lang={lang} duration={1.6} /> {dict.tour.altitudeUnit}
        </>
      ),
    },
    departure && { key: "departure", label: dict.labels.departure, icon: <MapPin className={icon} />, value: departure },
    languages && { key: "languages", label: dict.labels.languages, icon: <Globe className={icon} />, value: languages },
  ];
  const facts = candidates.filter((fact): fact is Fact => !!fact);

  if (facts.length === 0) return null;

  return (
    <section aria-label={dict.tour.quickFacts} className="bg-cream pt-6 md:pt-8">
      <div className={container}>
        <Stagger
          as="dl"
          className="grid grid-cols-2 border-l border-t border-navy-950/10 lg:flex lg:border-l-0"
        >
          {facts.map((fact, i) => (
            <StaggerItem
              key={fact.key}
              className={`flex flex-col gap-3 border-b border-r border-navy-950/10 p-5 md:p-6 lg:flex-1 lg:border-r-0 lg:px-8 ${
                i > 0 ? "lg:border-l" : ""
              } ${facts.length % 2 === 1 && i === facts.length - 1 ? "col-span-2" : ""}`}
            >
              <dt className="label-mono flex items-center gap-2.5 text-sand-700">
                {fact.icon}
                {fact.label}
              </dt>
              <dd className="font-mono text-lg font-medium uppercase tracking-wide text-navy-950 md:text-xl">
                {fact.value}
              </dd>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
