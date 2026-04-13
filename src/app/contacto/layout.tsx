import type { Metadata } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export async function generateMetadata(): Promise<Metadata> {
  const fallbackAddress = 'Barrio Mongollano, San Lorenzo, Valle 02501';

  let address = fallbackAddress;

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('configuracion_sitio')
      .select('clave,valor')
      .in('clave', ['direccion_completa']);

    address = Array.isArray(data)
      ? String(data.find((item) => item.clave === 'direccion_completa')?.valor || fallbackAddress)
      : fallbackAddress;
  }

  return {
    title: 'Contacto',
    description: `Contacta a Ferretería Moncasa en ${address}. Escríbenos para cotizaciones y asesoría.`,
  };
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
