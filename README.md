# Ferretería Moncasa Web

Sitio web para catálogo y cotizaciones de Ferretería Moncasa (Honduras) construido con Next.js, Supabase y Tailwind.

## Funcionalidades principales

- Catálogo de productos en lempiras (L)
- Filtros por texto, categoría y rango de precio
- Paginación del catálogo
- Carrito de cotización (no compras directas)
- Envío de cotización por WhatsApp
- Panel admin para crear, editar y eliminar productos
- Acción segura para vaciar catálogo (doble confirmación)
- Formulario de contacto con validación robusta
- Mapa embebido de ubicación
- Tema claro/oscuro
- SEO base (metadata + OpenGraph + Twitter)
- Google Analytics 4 (opcional por env var)
- Tests básicos con Vitest

## Requisitos

- Node.js 20+
- Proyecto Supabase configurado

## Variables de entorno

Crea `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # opcional, recomendado para operaciones administrativas servidor
NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE=productos
NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET=productos
NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE=contactos
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Ferretería Moncasa <no-reply@tu-dominio.com>"
```

Si ves un `Internal Server Error` al abrir login, admin o invitaciones, revisa primero esas cinco claves: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` y `RESEND_FROM_EMAIL`.

## Inventario (stock) en productos

Para habilitar el control de inventario en el admin y catálogo, ejecuta este SQL en Supabase:

```sql
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS productos_stock_idx ON productos(stock);

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS productos_activo_idx ON productos(activo);
CREATE INDEX IF NOT EXISTS productos_destacado_idx ON productos(destacado);
CREATE INDEX IF NOT EXISTS productos_orden_idx ON productos(orden);
```

## Auditoría, roles y respaldos del admin

Para habilitar auditoría, gestión de roles y backup/restore desde el panel, ejecuta:

```sql
CREATE TABLE IF NOT EXISTS admin_audit_logs (
	id BIGSERIAL PRIMARY KEY,
	accion TEXT NOT NULL,
	entidad TEXT NOT NULL,
	detalle TEXT NOT NULL,
	usuario_email TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_roles (
	id BIGSERIAL PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	role TEXT NOT NULL DEFAULT 'admin',
	activo BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_backups (
	id BIGSERIAL PRIMARY KEY,
	nombre TEXT NOT NULL,
	productos JSONB NOT NULL,
	created_by TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_audit_select ON admin_audit_logs;
DROP POLICY IF EXISTS admin_audit_insert ON admin_audit_logs;
DROP POLICY IF EXISTS admin_audit_delete_admins ON admin_audit_logs;
DROP POLICY IF EXISTS admin_roles_all ON admin_roles;
DROP POLICY IF EXISTS admin_backups_all ON admin_backups;

CREATE POLICY admin_audit_select
ON admin_audit_logs FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY admin_audit_insert
ON admin_audit_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY admin_audit_delete_admins
ON admin_audit_logs FOR DELETE
USING (
	EXISTS (
		SELECT 1
		FROM admin_roles
		WHERE admin_roles.email = auth.jwt() ->> 'email'
			AND admin_roles.activo = true
			AND admin_roles.role IN ('owner', 'admin')
	)
);

CREATE POLICY admin_roles_all
ON admin_roles FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY admin_backups_all
ON admin_backups FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Checklist de despliegue (Vercel)

1. Verificaciones locales

```bash
npm run lint
npm run test
npm run build
```

2. Variables de entorno en Vercel (Production)

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE=productos
- NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET=productos
- NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE=contactos
- NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
- NEXT_PUBLIC_GA_MEASUREMENT_ID (opcional)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL

3. Base de datos en Supabase

- Confirmar columnas en productos: stock, activo, destacado, orden
- Confirmar tabla contactos con RLS
- Confirmar bucket productos y políticas de Storage
- Confirmar tablas admin_audit_logs, admin_roles, admin_backups con RLS

4. Publicación

- Push al repositorio conectado a Vercel
- Ejecutar deploy Production

5. Validación post-deploy

- Login admin funcional
- Crear/editar/eliminar producto funcional
- Subida de imagen a Storage funcional
- Drag and drop + guardar orden funcional
- Filtros y métricas del panel funcionales
- Auditoría mostrando eventos
- Roles y respaldos funcionales
- Contacto guarda registros en contactos
- Catálogo muestra solo activos y respeta destacado/orden
- Productos sin stock bloquean agregar cotización
- Tema responde a preferencia del sistema
- GA4 detecta page views (si está configurado)

## Tabla de contactos (Supabase)

Ver instrucciones completas en `SETUP_CONTACTOS.md`.

## Notas de rutas UI

La visibilidad de botones flotantes se centraliza en `src/lib/ui-routes.ts`.

- Carrito flotante oculto en `/admin` y `/login`
- WhatsApp flotante oculto en `/admin`, `/login` y `/cotizacion`

## Estructura relevante

- `src/app/admin`: panel administrativo
- `src/app/productos`: catálogo con paginación
- `src/app/contacto`: formulario y mapa
- `src/components/whatsapp-float.tsx`: botón flotante de WhatsApp
- `src/components/google-analytics.tsx`: integración GA4
- `src/lib/validation.ts`: esquemas de validación
- `src/lib/ui-routes.ts`: reglas de visibilidad por rutas
