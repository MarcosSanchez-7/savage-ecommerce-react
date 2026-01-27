# Reporte de Debugging de Infraestructura Frontend

## Diagnóstico del Problema "Pantalla Blanca"
Tras analizar los archivos críticos, he identificado la **Causa Raíz** que provoca que la aplicación se congele o muestre una pantalla en blanco.

### 1. Error Crítico en Inicialización de Supabase (SOLUCIONADO COMPLETAMENTE)
**Archivo:** `services/supabase.ts`
- **Problema:** Cuando la variable de entorno `VITE_SUPABASE_ANON_KEY` no está presente (común en entornos de producción nuevos o si falla la inyección de variables), el código creaba un "cliente mock" incompleto.
- **El Crash:** Este objeto mock solo tenía `storage`, pero faltaban los métodos `auth` y `from`.
  - Cuando `AuthContext` intenta ejecutarse (`supabase.auth.getSession()`), la aplicación colapsa inmediatamente con `TypeError`.
  - Cuando `ShopContext` intenta cargar productos (`supabase.from(...)`), ocurre otro error fatal.
- **Solución Aplicada:** Se ha reescrito la lógica de inicialización en `services/supabase.ts` para proporcionar un **Cliente Mock Robusto**. Ahora, si faltan las claves, la app carga en "Modo Offline" (sin productos, pero sin crashear), permitiendo ver la interfaz y el mensaje de error en consola en lugar de una pantalla blanca.

### 2. Configuración de Vite y Variables de Entorno (SOLUCIONADO)
**Archivo:** `vite.config.ts`
- **Problema:** La definición manual de `process.env.API_KEY` podía insertar el valor `undefined` si la variable no existía al compilar, lo cual es inválido.
- **Solución Aplicada:** Se añadió un fallback (`|| ''`) para asegurar que siempre sea un string válido.

### 3. Análisis de Bucle de Carga (App.tsx & ShopContext.tsx)
- **Estado Actual:** El sistema de "Safety Timers" (Temporizadores de Seguridad) que has implementado es correcto.
  - `AuthContext`: Tiene un timeout de 3 segundos.
  - `ShopContext`: Tiene un timeout de 3 segundos.
- **Conclusión:** Con el fix de Supabase aplicado, estos timers ahora funcionarán correctamente. Antes, el error de JavaScript detenía la ejecución antes de que los timers pudieran actuar.

### 4. Riesgo de Dependencias Externas (CDN)
**Archivo:** `index.html`
- **Observación:** La aplicación carga Tailwind CSS y Google Maps desde CDNs externos.
- **Riesgo:** Si el usuario tiene una conexión inestable o un bloqueador de anuncios estricto, o si el CDN de Tailwind (`cdn.tailwindcss.com`) cae, la aplicación cargará **sin estilos** (se verá "rota" visualmente aunque funcione lógicamente).
- **Recomendación (No urgente pero importante):** Para producción, se recomienda instalar Tailwind localmente (`npm install -D tailwindcss postcss autoprefixer`) en lugar de usar el CDN de script, ya que este último penaliza el rendimiento y crea un punto de fallo crítico.

## Próximos Pasos
1. **Reinicia tu servidor de desarrollo** para aplicar los cambios en `vite.config.ts`.
2. Verifica que la aplicación cargue correctamente. Si faltan las claves de Supabase, deberías ver la app vacía pero funcional, sin pantalla blanca.
3. Asegúrate de configurar las variables de entorno en Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
