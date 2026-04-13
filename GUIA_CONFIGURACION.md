# 🎯 Guía: Sistema de Configuración Global

Has implementado un sistema completo para gestionar contenidos dinámicamente sin tocar código. Aquí está todo lo que necesitas saber.

---

## 📋 Paso 1: Crear la tabla en Supabase

1. Ve a tu proyecto Supabase: https://app.supabase.com
2. Abre el **SQL Editor** y ejecuta el SQL en `SETUP_CONFIGURACION.sql`

Este crear:
- Tabla `configuracion_sitio` con políticas de permisos
- Datos iniciales de ejemplo
- Índices para búsqueda rápida

---

## 🎛️ Paso 2: Usa el panel admin

1. Accede a `/admin` en tu aplicación
2. Haz clic en la tab **"Configuración"**
3. Verás todos los items editables organizados por tipo:
   - **texto**: Titulos, descripciones
   - **url**: Enlaces a redes sociales
   - **email**: Correos de contacto
   - **numero**: Valores numéricos

4. Edita los valores y haz clic en **"Guardar"**

---

## 🔑 Paso 3: Configura las APIs

## ✅ Checklist rápido antes de probar

1. Copia `.env.example` a `.env.local`.
2. Completa las 7 claves de API.
3. Reinicia `npm run dev`.
4. Abre la página principal y prueba el botón de autenticación.
5. Si entras al panel admin, prueba luego el envío de invitación.

## ⚠️ Si aparece Internal Server Error

Revisa primero estas variables en `.env.local`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Si falta una sola de estas, el servidor puede responder 500 cuando intentes usar login, admin o invitaciones.

### Supabase
1. Ve a `Project Settings > API`.
2. Copia `Project URL` en `NEXT_PUBLIC_SUPABASE_URL`.
3. Copia `anon public` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Copia `service_role` en `SUPABASE_SERVICE_ROLE_KEY` solo para servidor.

### Clerk
1. Ve a tu aplicación en Clerk.
2. Copia la clave pública en `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. Copia la clave secreta en `CLERK_SECRET_KEY`.
4. En Clerk, revisa los dominios permitidos para tu entorno local y producción.

### Resend
1. Crea una API key en Resend.
2. Guárdala en `RESEND_API_KEY`.
3. Verifica un remitente o dominio en Resend.
4. Usa ese remitente en `RESEND_FROM_EMAIL`, por ejemplo: `Ferretería Moncasa <no-reply@tu-dominio.com>`.
5. Si estás probando en local, usa un remitente que Resend acepte en modo desarrollo.

### Archivo recomendado
1. Copia `.env.example` a `.env.local`.
2. Completa todas las claves.
3. Reinicia `npm run dev` después de cambiar variables.

### Orden recomendado de configuración
1. Supabase: URL, anon key y service role.
2. Clerk: publishable key y secret key.
3. Resend: API key y remitente verificado.
4. Vuelve a probar el login.
5. Después prueba el panel admin y la invitación por correo.

---

## 💻 Paso 3: Usa la configuración en tu código

### En componentes dinamicos
```tsx
import { useConfig } from '@/lib/useConfig';

export default function HeroSection() {
  const { config, get, loading } = useConfig();
  
  if (loading) return <p>Cargando...</p>;
  
  return (
    <>
      <h1>{get('hero_titulo')}</h1>
      <p>{get('hero_subtitulo')}</p>
      <a href={get('hero_cta_link')}>
        {get('hero_cta_text')}
      </a>
    </>
  );
}
```

### Keys disponibles
```
// Hero
hero_titulo
hero_subtitulo
hero_cta_text
hero_cta_link

// Contacto
telefono
whatsapp
email_contacto
ubicacion

// Horarios
horario_lunes_viernes
horario_sabado
horario_domingo

// Redes sociales
facebook
youtube
instagram

// Sitio
nombre_empresa
slogan
descripcion_corta

// Banner
banner_activo
banner_texto
banner_tipo
```

---

## 🚀 Ejemplo: Actualizar Hero Section dinámicamente

**Antes (hardcodeado):**
```tsx
<h1 className="text-5xl font-black">
  Tu aliado confiable en construcción y hogar
</h1>
```

**Después (dinámico):**
```tsx
'use client';
import { useConfig } from '@/lib/useConfig';

export default function HeroSection() {
  const { get } = useConfig();
  
  return (
    <h1 className="text-5xl font-black">
      {get('hero_titulo', 'Valor por defecto')}
    </h1>
  );
}
```

---

## 🛠️ Agregar más configuraciones

¿Necesitas agregar una nueva configuración? Dos formas:

### Opción 1: Via Supabase (recomendada)
1. Abre la tabla `configuracion_sitio` en Supabase
2. Inserta una nueva fila:
   - `clave`: Nombre único (ej: `hero_imagen_url`)
   - `valor`: Valor inicial
   - `tipo`: texto, url, email, numero
   - `descripcion`: Para recordar qué es

3. Usa inmediatamente: `get('hero_imagen_url')`

### Opción 2: Via Admin Panel
El panel detecta automáticamente nuevas configuraciones que agregues en Supabase.

---

## ⚙️ Casos de uso

### 1. Banner de anuncio
```tsx
const { get } = useConfig();
const mostrarBanner = get('banner_activo') === 'true';

{mostrarBanner && (
  <div className={`bg-${get('banner_tipo')}`}>
    {get('banner_texto')}
  </div>
)}
```

### 2. Links dinámicos
```tsx
<a href={`tel:${get('telefono')}`}>
  {get('telefono')}
</a>

<a href={`https://wa.me/${get('whatsapp')}`}>
  Enviar WhatsApp
</a>
```

### 3. Horarios dinámicos
```tsx
<p>Lunes a viernes: {get('horario_lunes_viernes')}</p>
<p>Sábado: {get('horario_sabado')}</p>
<p>Domingo: {get('horario_domingo')}</p>
```

---

## 🔄 Caching

El hook `useConfig()` cachea los datos por **5 minutos** para mejor rendimiento.

Si necesitas actualizar en tiempo real después de guardar desde el admin:
```tsx
const { refreshConfig } = useConfig();

// Para refrescar después de guardar
await updateConfigValue(...);
refreshConfig();
```

---

## 🔒 Permisos

- **Lectura**: Todos (público)
- **Escritura**: Solo usuarios autenticados en el panel admin
- **RLS**: Habilitado en Supabase (políticas de seguridad)

---

## 📞 Soporte

Si necesitas cambios adicionales:
- Agregar más campos a la tabla
- Agregar nuevas tabs al admin
- Crear importadores CSV

Contacta al desarrollador.

---

**¡Ya puedes editar tu sitio sin tocar código! 🎉**
