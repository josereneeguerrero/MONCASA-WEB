# Go Live Checklist - Moncasa Web v1

Fecha objetivo: ____/____/______
Responsable de lanzamiento: __________________

## 1) Congelar version para release
- [ ] No hacer cambios funcionales nuevos durante la ventana de salida.
- [ ] Confirmar rama de release y commit final aprobado.
- [ ] Registrar version en PROJECT_STATUS.md.

Criterio de salida:
- Build final aprobado y sin cambios pendientes criticos.

## 2) Verificacion tecnica local
- [ ] Ejecutar build de produccion.
- [ ] Ejecutar lint.
- [ ] Ejecutar tests.

Criterio de salida:
- Todo en verde sin errores bloqueantes.

## 3) Variables de entorno en produccion
- [ ] Revisar variables de Clerk en Vercel (public y secret).
- [ ] Revisar variables de Supabase (URL, publishable key, service role key).
- [ ] Revisar variables de Resend (api key y from email).
- [ ] Confirmar que no hay variables vacias o mal escritas.

Criterio de salida:
- App inicia y rutas protegidas responden correctamente en entorno Production.

## 4) Smoke test web principal
- [ ] Home carga en modo claro y oscuro.
- [ ] Navbar funciona (Inicio, Productos, Nosotros, Contacto).
- [ ] Promociones se ven coherentes en ambos temas.
- [ ] Botones Iniciar sesion y Crear cuenta visibles y alineados.
- [ ] Newsletter (footer y popup) guarda correos correctamente.

Criterio de salida:
- Flujo principal completo sin bloqueos.

## 5) Smoke test panel admin
- [ ] Login admin correcto.
- [ ] Crear, editar y eliminar producto.
- [ ] Modal de edicion responsive en movil/tablet/desktop.
- [ ] Configuracion rapida y avanzada guardan cambios.
- [ ] Mensajes y auditoria cargan y filtran.

Criterio de salida:
- Operacion diaria de administracion sin errores criticos.

## 6) Validacion de base de datos
- [ ] Tabla productos actualizada y consistente.
- [ ] Tabla contactos recibe formularios y newsletter.
- [ ] Tabla configuracion_sitio persiste cambios desde admin.
- [ ] Revisar duplicados de newsletter y politicas de limpieza.

Criterio de salida:
- Datos persistidos correctamente y consultables para operacion.

## 7) Seguridad minima de lanzamiento
- [ ] Confirmar que rutas admin exigen sesion valida.
- [ ] Verificar roles admin activos correctos.
- [ ] Revisar que no se expongan secretos en cliente.
- [ ] Confirmar CORS y permisos esperados en APIs.

Criterio de salida:
- No hay huecos evidentes de acceso en admin.

## 8) Monitoreo y alertas
- [ ] Activar logs de Vercel para revisar errores 4xx y 5xx.
- [ ] Definir correo o canal para alertas de incidentes.
- [ ] Validar eventos clave en analytics.

Criterio de salida:
- Equipo puede detectar y responder incidentes rapidamente.

## 9) Plan de respaldo y rollback
- [ ] Crear respaldo de productos y configuracion antes de salir.
- [ ] Definir ultimo deployment estable para rollback rapido.
- [ ] Documentar pasos de rollback en caso de falla.

Criterio de salida:
- Recuperacion posible en minutos si algo falla.

## 10) Verificacion post-lanzamiento (primeras 24 horas)
- [ ] Revisar errores en logs cada 2-4 horas.
- [ ] Probar flujo principal desde movil Android y iPhone.
- [ ] Confirmar que admin puede operar sin bloqueos.
- [ ] Confirmar captacion de correos newsletter en produccion.

Criterio de salida:
- Sin incidentes de severidad alta en las primeras 24 horas.

---

## Comandos de control rapido
- npm run build
- npm run lint
- npm test

## Decision de salida
- [ ] GO (aprobado para lanzamiento)
- [ ] NO GO (postergar y corregir)

Observaciones finales:

____________________________________________________________
____________________________________________________________
