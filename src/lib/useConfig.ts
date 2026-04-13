import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

export type ConfiguracionType = 'texto' | 'json' | 'numero' | 'url' | 'email';

export interface ConfigItem {
  clave: string;
  valor: string;
  tipo: ConfiguracionType;
  descripcion?: string;
  updated_at?: string;
  updated_by?: string;
}

export type ConfigKey = 
  | 'hero_titulo' | 'hero_subtitulo' | 'hero_cta_text' | 'hero_cta_link'
  | 'telefono' | 'whatsapp' | 'email_contacto' | 'ubicacion'
  | 'horario_lunes_viernes' | 'horario_sabado' | 'horario_domingo'
  | 'facebook' | 'youtube' | 'instagram'
  | 'nombre_empresa' | 'slogan' | 'descripcion_corta'
  | 'banner_activo' | 'banner_texto' | 'banner_tipo';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const configCache: Record<string, string> = {};
let cacheTimestamp = 0;

export function useConfig() {
  const [config, setConfig] = useState<Map<ConfigKey, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      // Revisar si el cache sigue siendo válido
      const now = Date.now();
      if (cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
        const configMap = new Map<ConfigKey, string>();
        Object.entries(configCache).forEach(([key, value]) => {
          configMap.set(key as ConfigKey, value);
        });
        setConfig(configMap);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('configuracion_sitio')
        .select('clave, valor')
        .eq('tipo', 'texto')
        .or(`tipo.eq.url,tipo.eq.email,tipo.eq.numero`);

      if (fetchError) {
        console.error('Error loading config:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const configMap = new Map<ConfigKey, string>();
      if (data) {
        data.forEach((item: { clave: string; valor: string }) => {
          configMap.set(item.clave as ConfigKey, item.valor);
          configCache[item.clave] = item.valor;
        });
      }

      cacheTimestamp = now;
      setConfig(configMap);
      setError(null);
    } catch (err) {
      console.error('Unexpected error loading config:', err);
      setError(err instanceof Error ? err.message : 'Error unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const get = useCallback((key: ConfigKey, fallback = ''): string => {
    return config.get(key) ?? fallback;
  }, [config]);

  const refreshConfig = useCallback(() => {
    cacheTimestamp = 0;
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    get,
    loading,
    error,
    refreshConfig,
  };
}

export async function getAllConfig(): Promise<ConfigItem[]> {
  const { data, error } = await supabase
    .from('configuracion_sitio')
    .select('*')
    .order('clave');

  if (error) {
    console.error('Error fetching all config:', error);
    return [];
  }

  return data ?? [];
}

export async function updateConfigValue(clave: string, valor: string, email?: string): Promise<boolean> {
  const { error } = await supabase
    .from('configuracion_sitio')
    .update({ valor, updated_at: new Date().toISOString(), updated_by: email })
    .eq('clave', clave);

  if (error) {
    console.error('Error updating config:', error);
    return false;
  }

  // Invalidar cache
  cacheTimestamp = 0;
  return true;
}
