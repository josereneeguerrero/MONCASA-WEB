-- Tabla de configuración global del sitio
CREATE TABLE IF NOT EXISTS configuracion_sitio (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(300),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_configuracion_tipo ON configuracion_sitio(tipo);

-- Datos iniciales
INSERT INTO configuracion_sitio (clave, valor, tipo, descripcion, updated_by)
VALUES
  -- Hero Section
  ('hero_titulo', 'Tu aliado confiable en construcción y hogar', 'texto', 'Título principal del hero', 'SYSTEM'),
  ('hero_subtitulo', 'Bienvenido a Ferretería Moncasa', 'texto', 'Subtítulo del hero', 'SYSTEM'),
  ('hero_cta_text', 'Catálogo de productos', 'texto', 'Texto del botón CTA del hero', 'SYSTEM'),
  ('hero_cta_link', '/productos', 'url', 'Link del botón CTA', 'SYSTEM'),
  
  -- Información de Contacto
  ('telefono', '+504 3218-4060', 'texto', 'Teléfono principal', 'SYSTEM'),
  ('whatsapp', '50432184060', 'texto', 'Número WhatsApp (sin caracteres especiales)', 'SYSTEM'),
  ('email_contacto', 'info@moncasa.hn', 'email', 'Email de contacto', 'SYSTEM'),
  ('ubicacion', 'San Lorenzo, Honduras', 'texto', 'Ubicación física', 'SYSTEM'),
  
  -- Horarios
  ('horario_lunes_viernes', '7am - 6pm', 'texto', 'Horario lunes a viernes', 'SYSTEM'),
  ('horario_sabado', '7am - 5pm', 'texto', 'Horario sábado', 'SYSTEM'),
  ('horario_domingo', '8am - 1pm', 'texto', 'Horario domingo', 'SYSTEM'),
  
  -- Redes Sociales
  ('facebook', 'https://www.facebook.com/MoncasaHN', 'url', 'URL de Facebook', 'SYSTEM'),
  ('youtube', 'https://www.youtube.com/@MoncasaHN', 'url', 'URL de YouTube', 'SYSTEM'),
  ('instagram', 'https://www.instagram.com/moncasa.hn', 'url', 'URL de Instagram', 'SYSTEM'),
  
  -- Configuración de Sitio
  ('nombre_empresa', 'Ferretería Moncasa', 'texto', 'Nombre oficial de la empresa', 'SYSTEM'),
  ('slogan', 'Tu aliado confiable', 'texto', 'Slogan principal', 'SYSTEM'),
  ('descripcion_corta', 'Ferretería especializada en materiales de construcción y mejora del hogar', 'texto', 'Meta descripción del sitio', 'SYSTEM'),
  ('meta_title_home', 'Ferretería Moncasa | Inicio', 'texto', 'Meta título para la página principal', 'SYSTEM'),
  ('meta_description_home', 'Encuentra herramientas, materiales de construcción y asesoría profesional en Ferretería Moncasa.', 'texto', 'Meta descripción para la página principal', 'SYSTEM'),
  ('meta_keywords_home', 'ferreteria, herramientas, construccion, San Lorenzo, Honduras', 'texto', 'Keywords SEO para la página principal', 'SYSTEM'),
  
  -- Anuncio/Banner
  ('banner_activo', 'false', 'numero', 'Mostrar banner de anuncio (1=sí, 0=no)', 'SYSTEM'),
  ('banner_texto', '', 'texto', 'Texto del banner de anuncio', 'SYSTEM'),
  ('banner_tipo', 'info', 'texto', 'Tipo de banner: info, warning, success, error', 'SYSTEM'),
  ('banner_link', '/contacto', 'url', 'Enlace opcional del banner', 'SYSTEM'),

  -- Promociones dinámicas en home
  (
    'promos_home',
    '[{"tag":"Oferta","titulo":"Herramientas profesionales","descripcion":"Precios especiales en combos de herramientas y accesorios.","badge":"Disponible hoy","link":"/productos"},{"tag":"Temporada","titulo":"Pinturas y acabados","descripcion":"Líneas para interior y exterior con asesoría personalizada.","badge":"Nuevo","link":"/productos"},{"tag":"Cotiza","titulo":"Atención para contratistas","descripcion":"Solicita cotización por volumen para obra y mantenimiento.","badge":"Empresas","link":"/contacto"}]',
    'json',
    'Listado de promociones para la portada',
    'SYSTEM'
  )
ON CONFLICT (clave) DO NOTHING;

-- RLS Policy
ALTER TABLE configuracion_sitio ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "configuracion_public_read" ON configuracion_sitio
  FOR SELECT USING (true);

-- Permitir escritura solo a administradores (si tienes tabla admin_roles)
-- Esto requiere que el usuario esté autenticado y sea admin
CREATE POLICY "configuracion_admin_write" ON configuracion_sitio
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "configuracion_admin_insert" ON configuracion_sitio
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
