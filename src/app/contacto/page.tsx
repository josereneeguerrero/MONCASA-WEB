'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BrandLogo from '@/components/brand-logo';
import Footer from '@/components/footer';
import { contactSchema } from '@/lib/validation';

type FormData = {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
};

const emptyForm: FormData = {
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: '',
};

export default function ContactoPage() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const parsed = contactSchema.safeParse(form);

    if (!parsed.success) {
      setMessage(`Revisa los datos del formulario: ${parsed.error.issues[0]?.message ?? 'Hay un error.'}`);
      setSubmitting(false);
      return;
    }

    try {
      // Intentar guardar en Supabase
      const contactosTable = process.env.NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE ?? 'contactos';

      const { error } = await supabase.from(contactosTable).insert({
        nombre: parsed.data.nombre.trim(),
        email: parsed.data.email.trim(),
        telefono: parsed.data.telefono?.trim() || null,
        asunto: parsed.data.asunto?.trim() || null,
        mensaje: parsed.data.mensaje.trim(),
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('Error al guardar contacto en DB:', error);
        // Continuamos de todas formas, mostraremos éxito al usuario
      }

      // Éxito
      setForm(emptyForm);
      setMessage('Mensaje recibido. Nos pondremos en contacto pronto.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error:', err);
      setMessage('Hubo un error. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_60px_var(--color-moncasa-shadow)]">
        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
              <p className="text-[10px] font-bold tracking-[0.35em] text-[#FE9A01]">FERRETERIA MONCASA</p>
            </Link>

            <nav aria-label="Principal" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Link href="/" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">INICIO</Link>
              <Link href="/productos" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">PRODUCTOS</Link>
              <Link href="/nosotros" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">NOSOTROS</Link>
              <Link href="/contacto" className="rounded-full bg-[#FE9A01] px-4 py-2 text-[#0A1116]">CONTACTO</Link>
            </nav>
          </div>
        </header>

        {/* CONTENIDO */}
        <section className="px-5 py-8 sm:px-8 sm:py-10">
          <div className="moncasa-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01]">Contacto</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--color-moncasa-text)] sm:text-5xl">Estamos aquí para ayudarte</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-moncasa-muted)]">
              Envíanos tu consulta y nos comunicaremos contigo a la brevedad. También puedes contactarnos directamente vía WhatsApp.
            </p>
          </div>

          {/* GRID: FORMULARIO + INFO */}
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* FORMULARIO */}
            <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-[var(--color-moncasa-text)]">Formulario de contacto</h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-moncasa-text)]">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-moncasa-text)]">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-moncasa-text)]">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+504 XXXX XXXX"
                    className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-moncasa-text)]">Asunto</label>
                  <select
                    name="asunto"
                    value={form.asunto}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="Consulta de productos">Consulta de productos</option>
                    <option value="Presupuesto">Solicitud de presupuesto</option>
                    <option value="Entregas">Entregas y envíos</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-moncasa-text)]">Mensaje *</label>
                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    placeholder="Cuéntanos qué necesitas..."
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#FE9A01] px-4 py-3 font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>

                {message && (
                  <p className={`-mt-2 text-sm font-semibold ${message.includes('Mensaje recibido') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>

            {/* INFORMACIÓN DE CONTACTO */}
            <div className="space-y-6">
              {/* TARJETA: UBICACIÓN */}
              <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 p-6">
                <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">Ubicación</h3>
                <p className="mt-3 text-[var(--color-moncasa-muted)]">
                  San Lorenzo, Cortés
                  <br />
                  Honduras
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-moncasa-border)]">
                  <iframe
                    title="Mapa Ferretería Moncasa"
                    src="https://www.google.com/maps?q=San+Lorenzo,+Cortes,+Honduras&output=embed"
                    width="100%"
                    height="220"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block"
                  />
                </div>
                <a
                  href="https://maps.google.com/?q=San+Lorenzo+Cortes+Honduras"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center rounded-lg bg-[#FE9A01]/20 px-4 py-2 text-sm font-semibold text-[#FE9A01] transition hover:bg-[#FE9A01]/30"
                >
                  Ver en mapa →
                </a>
              </div>

              {/* TARJETA: TELÉFONO */}
              <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 p-6">
                <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">Teléfono</h3>
                <p className="mt-3 text-[var(--color-moncasa-muted)]">Lunes a viernes: 9am - 6pm</p>
                <a
                  href="tel:+50432184060"
                  className="mt-4 inline-flex items-center rounded-lg bg-[#FE9A01]/20 px-4 py-2 text-sm font-semibold text-[#FE9A01] transition hover:bg-[#FE9A01]/30"
                >
                  +504 32184060
                </a>
              </div>

              {/* TARJETA: WHATSAPP */}
              <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 p-6">
                <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">WhatsApp</h3>
                <p className="mt-3 text-[var(--color-moncasa-muted)]">Respuestas inmediatas a tu consulta</p>
                <a
                  href="https://wa.me/50432184060?text=Hola%20Ferretería%20Moncasa,%20tengo%20una%20consulta"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center rounded-lg bg-green-600/20 px-4 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-600/30"
                >
                  Enviar WhatsApp →
                </a>
              </div>

              {/* TARJETA: HORARIOS */}
              <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 p-6">
                <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">Horarios</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-moncasa-muted)]">
                  <li>Lunes - Viernes: 7am - 6pm</li>
                  <li>Sábados: 7am - 5pm</li>
                  <li>Domingos: 8am - 1pm</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
