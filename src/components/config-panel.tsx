'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAllConfig, updateConfigValue, type ConfigItem } from '@/lib/useConfig';

interface ConfigPanelProps {
  currentUserEmail: string;
}

export default function ConfigPanel({ currentUserEmail }: ConfigPanelProps) {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

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

  const handleChange = useCallback((clave: string, newValue: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [clave]: newValue,
    }));
  }, []);

  const filteredConfigs = configs.filter((item) => {
    const matchesSearch = item.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const types = ['all', ...new Set(configs.map((c) => c.tipo))];
  const groupedByType = filteredConfigs.reduce(
    (acc, item) => {
      if (!acc[item.tipo]) {
        acc[item.tipo] = [];
      }
      acc[item.tipo].push(item);
      return acc;
    },
    {} as Record<string, ConfigItem[]>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--color-moncasa-muted)]">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Buscar en configuración..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
        />
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-4 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'Todos los tipos' : type}
            </option>
          ))}
        </select>
      </div>

      {/* Configuraciones agrupadas por tipo */}
      {Object.entries(groupedByType).map(([type, items]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#FE9A01]">
            {type}
          </h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.clave}
                className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-moncasa-text)]">
                        {item.clave}
                      </p>
                      {item.descripcion && (
                        <p className="mt-1 text-xs text-[var(--color-moncasa-muted)]">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#FE9A01]">{item.tipo}</span>
                  </div>

                  {item.tipo === 'numero' ? (
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
                  ) : (
                    <textarea
                      value={editingValues[item.clave] ?? ''}
                      onChange={(e) => handleChange(item.clave, e.target.value)}
                      rows={item.valor.split('\n').length || 2}
                      className="rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[var(--color-moncasa-muted)]">
                      {item.updated_at && (
                        <>
                          Actualizado: {new Date(item.updated_at).toLocaleDateString('es-HN')}
                          {item.updated_by && ` por ${item.updated_by}`}
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleSave(item.clave)}
                      disabled={saving === item.clave || editingValues[item.clave] === item.valor}
                      className="rounded-lg bg-[#FE9A01] px-3 py-1 text-xs font-semibold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === item.clave ? 'Guardando...' : 'Guardar'}
                    </button>
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
    </div>
  );
}
