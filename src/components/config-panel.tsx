'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAllConfig, updateConfigValue, type ConfigItem } from '@/lib/useConfig';

interface ConfigPanelProps {
  currentUserEmail: string;
}

type ConfigSectionKey =
  | 'all'
  | 'general'
  | 'contacto'
  | 'mapa'
  | 'horarios'
  | 'redes'
  | 'banner'
  | 'promociones'
  | 'seo'
  | 'sistema';

const SECTION_META: Record<Exclude<ConfigSectionKey, 'all'>, { title: string; hint: string }> = {
  general: {
    title: 'General',
    hint: 'Textos base de portada e identidad de la empresa.',
  },
  contacto: {
    title: 'Contacto',
    hint: 'Datos para llamadas, WhatsApp y dirección comercial.',
  },
  mapa: {
    title: 'Mapa y Ubicación',
    hint: 'URL embebida de Google Maps y enlace público del mapa.',
  },
  horarios: {
    title: 'Horarios',
    hint: 'Horarios de atención que se muestran al cliente.',
  },
  redes: {
    title: 'Redes Sociales',
    hint: 'Enlaces públicos de Facebook, YouTube e Instagram.',
  },
  banner: {
    title: 'Banner',
    hint: 'Avisos destacados para promociones o comunicados.',
  },
  promociones: {
    title: 'Promociones',
    hint: 'Bloques promocionales de la home en formato JSON.',
  },
  seo: {
    title: 'SEO',
    hint: 'Metadatos para buscadores y redes sociales.',
  },
  sistema: {
    title: 'Sistema',
    hint: 'Campos avanzados o sin categoría definida.',
  },
};

const FRIENDLY_LABELS: Record<string, string> = {
  hero_titulo: 'Título principal (Home)',
  hero_subtitulo: 'Subtítulo (Home)',
  hero_cta_text: 'Texto botón principal (Home)',
  hero_cta_link: 'Enlace botón principal (Home)',
  telefono: 'Teléfono principal',
  whatsapp: 'WhatsApp',
  email_contacto: 'Correo de contacto',
  ubicacion: 'Ubicación corta',
  direccion_completa: 'Dirección completa',
  maps_embed_url: 'URL iframe del mapa',
  maps_link_url: 'URL pública del mapa',
  horario_lunes_viernes: 'Horario lunes a viernes',
  horario_sabado: 'Horario sábado',
  horario_domingo: 'Horario domingo',
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  nombre_empresa: 'Nombre de empresa',
  slogan: 'Slogan',
  descripcion_corta: 'Descripción corta',
  banner_activo: 'Banner activo',
  banner_texto: 'Texto del banner',
  banner_tipo: 'Tipo de banner',
  banner_link: 'Enlace del banner',
  promos_home: 'Promociones en home (JSON)',
  meta_title_home: 'Meta title Home',
  meta_description_home: 'Meta description Home',
  meta_keywords_home: 'Meta keywords Home',
};

function getSectionFromKey(key: string): Exclude<ConfigSectionKey, 'all'> {
  if (key.startsWith('hero_') || ['nombre_empresa', 'slogan', 'descripcion_corta'].includes(key)) {
    return 'general';
  }

  if (['telefono', 'whatsapp', 'email_contacto', 'ubicacion', 'direccion_completa'].includes(key)) {
    return 'contacto';
  }

  if (key.startsWith('maps_')) {
    return 'mapa';
  }

  if (key.startsWith('horario_')) {
    return 'horarios';
  }

  if (['facebook', 'youtube', 'instagram'].includes(key)) {
    return 'redes';
  }

  if (key.startsWith('banner_')) {
    return 'banner';
  }

  if (key === 'promos_home') {
    return 'promociones';
  }

  if (key.startsWith('meta_')) {
    return 'seo';
  }

  return 'sistema';
}

export default function ConfigPanel({ currentUserEmail }: ConfigPanelProps) {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<ConfigSectionKey>('all');
  const [savingAll, setSavingAll] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const quickKeys = [
    'hero_titulo',
    'hero_subtitulo',
    'telefono',
    'whatsapp',
    'direccion_completa',
    'banner_activo',
    'banner_texto',
    'maps_link_url',
  ];

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    const data = await getAllConfig();
    setConfigs(data);
    
    // Inicializar valores para edición
    const initial: Record<string, string> = {};
    data.forEach((item) => {
      initial[item.clave] = item.valor;
    });
    setEditingValues(initial);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConfigs();
  }, [loadConfigs]);

  const handleSave = useCallback(
    (clave: string) => {
      setSaving(clave);
      void updateConfigValue(clave, editingValues[clave], currentUserEmail).then((success) => {
        if (success) {
          // Actualizar en la lista local
          setConfigs((prev) =>
            prev.map((item) =>
              item.clave === clave
                ? { ...item, valor: editingValues[clave], updated_at: new Date().toISOString(), updated_by: currentUserEmail }
                : item
            )
          );
        }
        setSaving(null);
      });
    },
    [editingValues, currentUserEmail]
  );

  const handleSaveAll = useCallback(async () => {
    const changed = configs.filter((item) => editingValues[item.clave] !== item.valor);

    if (!changed.length) {
      return;
    }

    setSavingAll(true);

    for (const item of changed) {
      await updateConfigValue(item.clave, editingValues[item.clave], currentUserEmail);
    }

    setConfigs((prev) =>
      prev.map((item) =>
        changed.some((changedItem) => changedItem.clave === item.clave)
          ? {
              ...item,
              valor: editingValues[item.clave],
              updated_at: new Date().toISOString(),
              updated_by: currentUserEmail,
            }
          : item,
      ),
    );

    setSavingAll(false);
  }, [configs, currentUserEmail, editingValues]);

  const handleChange = useCallback((clave: string, newValue: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [clave]: newValue,
    }));
  }, []);

  const resetValue = useCallback((clave: string, original: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [clave]: original,
    }));
  }, []);

  const filteredConfigs = configs.filter((item) => {
    const matchesSearch = item.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.tipo === filterType;
    const section = getSectionFromKey(item.clave);
    const matchesSection = activeSection === 'all' || section === activeSection;
    return matchesSearch && matchesType && matchesSection;
  });

  const types = ['all', ...new Set(configs.map((c) => c.tipo))];

  const groupedBySection = filteredConfigs.reduce((acc, item) => {
    const section = getSectionFromKey(item.clave);

    if (!acc[section]) {
      acc[section] = [];
    }

    acc[section].push(item);
    return acc;
  }, {} as Record<Exclude<ConfigSectionKey, 'all'>, ConfigItem[]>);

  const sectionCounts = configs.reduce((acc, item) => {
    const section = getSectionFromKey(item.clave);
    acc[section] = (acc[section] ?? 0) + 1;
    return acc;
  }, {} as Record<Exclude<ConfigSectionKey, 'all'>, number>);

  const changedCount = configs.filter((item) => editingValues[item.clave] !== item.valor).length;
  const quickItems = quickKeys
    .map((key) => configs.find((item) => item.clave === key))
    .filter((item): item is ConfigItem => Boolean(item));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--color-moncasa-muted)]">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--color-moncasa-text)]">
            Configuración editable del sitio
          </p>
          <span className="rounded-full border border-[#FE9A01]/30 bg-[#FE9A01]/10 px-3 py-1 text-xs font-semibold text-[#FE9A01]">
            {changedCount} cambios sin guardar
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
          />

          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as ConfigSectionKey)}
            className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
          >
            <option value="all">Todas las secciones</option>
            {Object.entries(SECTION_META).map(([key, section]) => (
              <option key={key} value={key}>
                {section.title}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'Todos los tipos' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(SECTION_META).map(([key, section]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key as ConfigSectionKey)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                activeSection === key
                  ? 'border-[#FE9A01]/60 bg-[#FE9A01]/15 text-[#FE9A01]'
                  : 'border-[var(--color-moncasa-border)] text-[var(--color-moncasa-muted)] hover:bg-[var(--color-moncasa-hover)]'
              }`}
            >
              {section.title} ({sectionCounts[key as Exclude<ConfigSectionKey, 'all'>] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">Editor rápido</h3>
            <p className="text-sm text-[var(--color-moncasa-muted)]">
              Campos clave para editar el sitio sin entrar en configuraciones avanzadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSaveAll()}
            disabled={savingAll || changedCount === 0}
            className="rounded-full bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAll ? 'Guardando todo...' : 'Guardar todos los cambios'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {quickItems.map((item) => (
            <div key={item.clave} className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-moncasa-text)]">
                  {FRIENDLY_LABELS[item.clave] ?? item.clave}
                </p>
                {editingValues[item.clave] !== item.valor ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-400">Pendiente</span>
                ) : null}
              </div>

              {item.clave === 'banner_activo' ? (
                <select
                  value={editingValues[item.clave] ?? ''}
                  onChange={(e) => handleChange(item.clave, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                >
                  <option value="false">Desactivado</option>
                  <option value="true">Activado</option>
                </select>
              ) : item.tipo === 'url' ? (
                <input
                  type="url"
                  value={editingValues[item.clave] ?? ''}
                  onChange={(e) => handleChange(item.clave, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                />
              ) : (
                <textarea
                  value={editingValues[item.clave] ?? ''}
                  onChange={(e) => handleChange(item.clave, e.target.value)}
                  rows={item.clave === 'direccion_completa' ? 3 : 2}
                  className="w-full rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">Editor avanzado</h3>
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="rounded-full border border-[var(--color-moncasa-border)] px-3 py-1 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]"
        >
          {advancedOpen ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {advancedOpen ? (
        <>
          {Object.entries(groupedBySection).map(([sectionKey, items]) => (
        <div key={sectionKey} className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[var(--color-moncasa-text)]">
                {SECTION_META[sectionKey as Exclude<ConfigSectionKey, 'all'>].title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">
                {SECTION_META[sectionKey as Exclude<ConfigSectionKey, 'all'>].hint}
              </p>
            </div>
            <span className="rounded-full border border-[var(--color-moncasa-border)] px-3 py-1 text-xs font-semibold text-[var(--color-moncasa-muted)]">
              {items.length} campo(s)
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((item) => (
              <div key={item.clave} className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-moncasa-text)]">{FRIENDLY_LABELS[item.clave] ?? item.clave}</p>
                      <p className="mt-0.5 text-[11px] font-mono text-[var(--color-moncasa-muted)]">{item.clave}</p>
                      {item.descripcion && (
                        <p className="mt-1 text-xs text-[var(--color-moncasa-muted)]">{item.descripcion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingValues[item.clave] !== item.valor ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-400">Pendiente</span>
                      ) : null}
                      <span className="text-xs font-mono text-[#FE9A01]">{item.tipo}</span>
                    </div>
                  </div>

                  {item.clave === 'banner_activo' ? (
                    <select
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    >
                      <option value="false">Desactivado</option>
                      <option value="true">Activado</option>
                    </select>
                  ) : item.clave === 'banner_tipo' ? (
                    <select
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  ) : item.tipo === 'numero' ? (
                    <input
                      type="number"
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    />
                  ) : item.tipo === 'email' ? (
                    <input
                      type="email"
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    />
                  ) : item.tipo === 'url' ? (
                    <input
                      type="url"
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      placeholder="https://..."
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    />
                  ) : item.tipo === 'json' || item.clave === 'promos_home' ? (
                    <textarea
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      rows={8}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-xs text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    />
                  ) : (
                    <textarea
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      rows={item.valor.split('\n').length || 2}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    />
                  )}

                  {item.clave === 'promos_home' ? (
                    <p className="text-xs text-[var(--color-moncasa-muted)]">
                      Tip: usa un array JSON con objetos que tengan `tag`, `titulo`, `descripcion`, `badge`, `link`.
                    </p>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[var(--color-moncasa-muted)]">
                      {item.updated_at && (
                        <>
                          Actualizado: {new Date(item.updated_at).toLocaleDateString('es-HN')}
                          {item.updated_by && ` por ${item.updated_by}`}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => resetValue(item.clave, item.valor)}
                        disabled={editingValues[item.clave] === item.valor}
                        className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-1 text-xs font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Deshacer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(item.clave)}
                        disabled={saving === item.clave || editingValues[item.clave] === item.valor}
                        className="rounded-lg bg-[#FE9A01] px-3 py-1 text-xs font-semibold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving === item.clave ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          ))}

          {filteredConfigs.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--color-moncasa-border)] py-8 text-center">
              <p className="text-[var(--color-moncasa-muted)]">
                {searchTerm || filterType !== 'all'
                  ? 'No hay configuraciones que coincidan'
                  : 'No hay configuraciones disponibles'}
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
