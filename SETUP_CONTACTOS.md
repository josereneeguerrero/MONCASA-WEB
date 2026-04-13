# Setup de la tabla contactos en Supabase

## 1. Crear tabla en Supabase

Ejecuta este SQL en el editor SQL de Supabase (Dashboard → SQL Editor):

```sql
CREATE TABLE contactos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  asunto TEXT,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices para búsqueda rápida
CREATE INDEX contactos_email_idx ON contactos(email);
CREATE INDEX contactos_created_at_idx ON contactos(created_at);

-- Habilitar RLS
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserts públicos (para la página de contacto)
CREATE POLICY "contactos_allow_insert"
ON contactos FOR INSERT
WITH CHECK (true);

-- Política: Permitir selects solo para usuarios autenticados (para admin)
CREATE POLICY "contactos_allow_select_authenticated"
ON contactos FOR SELECT
USING (auth.role() = 'authenticated');

-- Política: Permitir delete solo a owners/admins activos (para panel admin)
CREATE POLICY "contactos_allow_delete_admins"
ON contactos FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM admin_roles
    WHERE admin_roles.email = auth.jwt() ->> 'email'
      AND admin_roles.activo = true
      AND admin_roles.role IN ('owner', 'admin')
  )
);
```

## 2. Agregar variable de entorno (opcional)

En `.env.local`, agrega:

```
NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE=contactos
```

Si no la defines, el formulario usa por defecto `contactos`.

## 3. Ver los mensajes

En Supabase Dashboard:
- Ve a **SQL Editor**
- Ejecuta: `SELECT * FROM contactos ORDER BY created_at DESC;`
- O usa la interfaz gráfica en **Table Editor** → `contactos`

## Notas

- Los campos `telefono` y `asunto` son opcionales
- El campo `mensaje` requiere al menos 10 caracteres (validado en el frontend)
- Los mensajes se guardan automáticamente con timestamp
- La tabla está protegida por RLS:
  - **Inserts**: Públicos (para el formulario)
  - **Selects**: Solo usuarios autenticados (para admin)
  - **Deletes**: Solo owner/admin activos desde panel
  - **Updates**: No permitidos

## Opcional: Agregar notificaciones por email

Para recibir emails cuando alguien contacta:

1. En Supabase, ve a **Database** → **Webhooks**
2. Crea un nuevo webhook en la tabla `contactos`
3. Configura tu servicio (SendGrid, Resend, o una función serverless)

---

Una vez la tabla esté creada, el formulario en `/contacto` funcionará completamente.
