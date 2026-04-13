import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Catálogo de Ferretería Moncasa con filtros y paginación para cotizaciones.',
};

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
