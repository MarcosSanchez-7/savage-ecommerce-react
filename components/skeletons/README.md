# Skeleton Screens System

## Descripción

Este directorio contiene los componentes de **Skeleton Screens** para la aplicación Savage E-commerce. Los skeleton screens reemplazan el sistema de pre-carga tradicional (spinner/loading) para proporcionar una mejor experiencia de usuario mostrando una vista previa de la estructura de la página mientras se cargan los datos.

## Beneficios

- **Mejor percepción de velocidad**: Los usuarios ven contenido inmediatamente, incluso si es un placeholder
- **Reducción de la ansiedad**: Los usuarios saben qué esperar y dónde aparecerá el contenido
- **Experiencia más fluida**: Transición suave del skeleton al contenido real
- **Aspecto más profesional**: Sensación de aplicación moderna y pulida

## Componentes Disponibles

### 1. ProductCardSkeleton
Skeleton para tarjetas de productos individuales.

**Uso:**
```tsx
import { ProductCardSkeleton } from './components/skeletons';

<ProductCardSkeleton />
```

### 2. HeroSkeleton
Skeleton para la sección hero de la página principal.

**Uso:**
```tsx
import { HeroSkeleton } from './components/skeletons';

<HeroSkeleton />
```

### 3. ProductSectionSkeleton
Skeleton para secciones completas de productos (incluye título y grid de productos).

**Props:**
- `title?: string` - Título de la sección (default: "Cargando...")
- `itemCount?: number` - Número de productos a mostrar (default: 4)

**Uso:**
```tsx
import { ProductSectionSkeleton } from './components/skeletons';

<ProductSectionSkeleton title="Destacados" itemCount={8} />
```

### 4. HomePageSkeleton
Skeleton completo para la página principal. Incluye navbar, hero, múltiples secciones de productos y footer.

**Uso:**
```tsx
import { HomePageSkeleton } from './components/skeletons';

<HomePageSkeleton />
```

### 5. ProductDetailSkeleton
Skeleton para la página de detalle de producto. Incluye galería, información del producto, selector de tallas, etc.

**Uso:**
```tsx
import { ProductDetailSkeleton } from './components/skeletons';

<ProductDetailSkeleton />
```

### 6. CategoryPageSkeleton
Skeleton para páginas de categorías. Incluye filtros y grid de productos.

**Uso:**
```tsx
import { CategoryPageSkeleton } from './components/skeletons';

<CategoryPageSkeleton />
```

## Características Técnicas

### Animación Shimmer
Todos los skeletons incluyen una animación de "shimmer" (brillo) que simula el efecto de carga:

```css
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

### Diseño Responsive
Los skeletons están diseñados para adaptarse a diferentes tamaños de pantalla, igual que los componentes reales.

### Consistencia Visual
Los skeletons mantienen la misma estructura y proporciones que los componentes reales para una transición suave.

## Implementación en App.tsx

El sistema de skeleton se implementa en `App.tsx` reemplazando el `LoadingScreen` tradicional:

```tsx
// Antes
if (loading) {
    return <LoadingScreen />;
}

// Después
if (loading) {
    return <HomePageSkeleton />;
}
```

## Mejores Prácticas

1. **Usar el skeleton apropiado**: Cada página debe tener su propio skeleton que coincida con su estructura
2. **Mantener la consistencia**: Los skeletons deben reflejar fielmente la estructura del contenido real
3. **Optimizar el tiempo de carga**: Los skeletons son más efectivos cuando el tiempo de carga es de 1-3 segundos
4. **No abusar de la animación**: La animación shimmer debe ser sutil y no distraer

## Próximos Pasos

- [ ] Implementar skeletons específicos para otras páginas (Blog, About, etc.)
- [ ] Agregar skeletons para componentes individuales (Navbar, Footer, etc.)
- [ ] Optimizar las animaciones para mejor rendimiento
- [ ] Agregar tests para los componentes skeleton

## Notas de Desarrollo

- Los skeletons utilizan las mismas clases de Tailwind que los componentes reales
- Los colores base son `gray-800/50` y `gray-900/50` para mantener el tema oscuro
- La animación shimmer se define inline en cada componente para evitar conflictos de CSS
