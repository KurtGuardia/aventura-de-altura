// Layout raíz propio del Studio: queda fuera de app/[lang] y no carga
// los estilos ni fuentes del sitio público.
export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
