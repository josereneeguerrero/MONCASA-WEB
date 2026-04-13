import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conoce a Ferretería Moncasa: servicio cercano y soluciones para construcción y hogar.',
};

export default function NosotrosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
