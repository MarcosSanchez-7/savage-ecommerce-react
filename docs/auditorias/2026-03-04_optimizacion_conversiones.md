# Documentación de Auditoría Técnica & Optimizaciones
**Fecha:** 4 de Marzo de 2026
**Objetivo:** Optimización de Conversión, Rastreo de Meta Pixel (ROAS) y SEO Dinámico.

## Problemas Identificados y Solucionados

### 1. Incompletitud en el Embudo de Meta Pixel (Eventos Críticos)
**Problema:** La integración original de Facebook Pixel (fbq) iniciaba bien registrando el evento genérico `PageView` e incluso el `ViewContent` (al ver un producto específico), pero el embudo se cortaba justo en el clímax. Las campañas de conversión de Facebook no podían calibrarse porque carecían de retroalimentación sobre quién añadía al carrito y quién terminaba comprando.
**Solución implementada:**
- Se inyectó lógicamente el evento `fbq('track', 'AddToCart')` dentro de la función global `addToCart` (`context/ShopContext.tsx`). Ahora este evento se dispara automáticamente para todos los botones de "Agregar al carrito", enviando a Meta la moneda (`PYG`), el precio (`value`), y crucialmente el identificador correlativo usado en el catálogo web (`content_ids`).
- Se ancló el evento definitivo `fbq('track', 'Purchase')` en el botón "CONFIRMAR PEDIDO" del carrito lateral (`components/CartDrawer.tsx`), junto al disparo de Analytics. Esto le notifica a Facebook que un cliente realmente completó el flujo de manera valiosa.

### 2. Actualización de Identidad SEO (Estrategia Marketplace)
**Problema:** Los metadatos en nuestro `index.html` (los que generan las vistas previas de enlaces al enviar www.savageeepy.com por WhatsApp, Instagram o Messenger) estaban excesivamente orientados a la identidad original del negocio: "Tienda de Camisetas de Fútbol". Esto alienaba o desperdiciaba la oportunidad para atraer clientes interesados en la nueva fuerte línea de relojería, calzado sneaker y moda utilitaria/streetwear.
**Solución implementada:**
- **Reescribimos el `<head>` semántico del proyecto (`index.html`)** y el componente generador reactivo (`components/SEO.tsx`) expandiendo su panorama. 
- *Nuevos Metadatos:* Ahora somos "SAVAGE STORE | Tienda de Ropa Urbana, Camisetas de Fútbol y Accesorios en Paraguay", incluyendo explícitamente zapatillas, relojes y streetwear en las `keywords` (Open Graph tags actualizados concomitantemente).

### 3. Mejora Crítica de Rendimiento LCP en la Primera Carga Visual
**Problema:** El "Largest Contentful Paint" (LCP - el tiempo que toma pintar el bloque visual más grande de la pantalla) de nuestra app, que típicamente es el Hero Banner, estaba siendo manejado como un estilo CSS inyectado (`backgroundImage`). En conexiones 3G/4G esto causa una "pantalla negra/vacía" molesta retrasando el primer golpe de impacto visual; el navegador no prioriza la descarga de fondos en CSS.
**Solución implementada:**
- Se sustituyó en `components/Hero.tsx` el `div` con imagen en background por la etiqueta html semántica `<img>`.
- Se configuró el atributo ultra-novedoso en React `fetchPriority="high"` junto al `loading="eager"` obligatoriamente a la *primera imagen del carrusel* y `lazy/auto` a las subsiguientes. Ahora el navegador detectará y descargará el banner protagonista concurrentemente con la base de HTML, mucho antes incluso de que termine de ejecutar el Javascript pesando la App.

## Resultados Esperados
1. **Campañas más inteligentes:** Al proveer el `AddToCart` y el `Purchase`, los algoritmos automáticos de Meta Ads deberían disminuir significativamente el Costo Por Adquisición (CPA) en un plazo de maduración de 3 a 7 días.
2. **Disminución de rebote:** Mejor UX al entrar desde Instagram o Ads mediante la visualización súper veloz de la foto Hero.
3. **Mejor Click-Through Rate (CTR) orgánico:** Si un cliente comparte la web, el título multi-categoría incentivará a más tipos de clientes a curiosear por el enlace.

### 4. Implementación de Atajos Rápidos (QuickLinks) bajo el Hero
**Problema:** Se necesitaba una forma más rápida e intuitiva para que los usuarios (especialmente en móviles) puedan acceder a las categorías o promociones más destacadas inmediatamente después de ver el banner principal, simulando la experiencia de aplicaciones nativas.
**Solución implementada:**
- Se creó el componente `QuickLinks.tsx`, una botonera de accesos rápidos circulares.
- **Diseño Adaptativo y Animado:** Muestra hasta 5 íconos en PC y 3 en móviles. Se implementó un carrusel de desplazamiento automático continuo cada 3 segundos impulsado por `framer-motion` para un deslizamiento fluido y profesional.
- **Gestión desde el Admin:** Se integró completamente en el panel de `Admin.tsx` (Sección Diseño Web), permitiendo añadir, editar y eliminar los enlaces y URLs de las imágenes de los íconos de forma reactiva y almacenarlos en la tabla `store_config`.
- El componente se insertó estratégicamente en `Home.tsx` justo debajo del carrusel `Hero`.

### 5. Refinamiento Visual en Displays (Categorías y Blog)
**Problema:** Los botones de 'ver más' en la sección de banners de diseño (Bento) tapaban el protagonista y no había un correcto aprovechamiento de la tipografía. Asimismo las tarjetas de estilo de vida / blog no gozaban del "smooth scrolling" lo que las hacía ver poco amigables en iteraciones temporizadas.
**Solución implementada:**
- **Banners de Categoría (Bento):** Se bajó la tipografía del título y los botones call-to-action (CTA) a la esquina inferior izquierda. Se migró la estructura estática a un poderoso carrusel inteligente con soporte de `framer-motion`. Responde a la lógica de deslizarse cada 3 segundos en móviles y cada 5 segundos en PCs (solamente en caso de superar el número de ventanas visibles establecidas en 5).
- **Sección Lifestyle & Blog:** Se equipó toda esta sección de demostración de productos (estilo de vida) y reseñas de clientes con componentes de animación en la entrada y salida, asegurando que cuando haga la transición de nuevos posteos el deslizamiento de las tarjetas se sienta suave y notable, desplazándose armónicamente de forma horizontal, realzando una imagen de marca Premium.
