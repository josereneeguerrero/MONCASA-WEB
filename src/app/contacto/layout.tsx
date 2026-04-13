import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contacta a Ferretería Moncasa en San Lorenzo, Cortés. Escríbenos para cotizaciones y asesoría.',
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
