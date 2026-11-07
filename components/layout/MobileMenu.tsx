"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Close, Menu } from "@/components/icons";

type Props = {
  links: { href: string; label: string }[];
  labels: { open: string; close: string; nav: string };
};

export function MobileMenu({ links, labels }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        className="-mr-2 flex size-11 items-center justify-center text-white"
      >
        {open ? <Close className="size-6" /> : <Menu className="size-6" />}
      </button>

      <nav
        id={panelId}
        aria-label={labels.nav}
        hidden={!open}
        className="absolute inset-x-0 top-full border-t border-white/10 bg-forest-950 px-5 pb-8 pt-4 shadow-xl"
      >
        <ul className="flex flex-col">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-white/10 py-4 font-display text-2xl text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
