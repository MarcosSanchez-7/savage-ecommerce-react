# Guía de Implementación de Skeleton Screens

## Objetivo
Esta guía te ayudará a implementar skeleton screens en páginas adicionales de la aplicación Savage E-commerce.

## ¿Cuándo usar Skeleton Screens?

Usa skeleton screens cuando:
- La página necesita cargar datos desde una API o base de datos
- El tiempo de carga esperado es de 1-3 segundos
- Quieres mejorar la percepción de velocidad de la aplicación
- Necesitas reducir la ansiedad del usuario durante la carga

## Pasos para Implementar

### 1. Crear el Componente Skeleton

Crea un nuevo archivo en `components/skeletons/` con el nombre de tu página seguido de `Skeleton.tsx`.

Ejemplo para una página de blog:

```tsx
import React from 'react';

const BlogPageSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Navbar Skeleton */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10 animate-pulse">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <div className="h-8 bg-gray-800/50 rounded w-32" />
                    <div className="flex gap-4">
                        <div className="h-8 w-8 bg-gray-800/50 rounded-full" />
                        <div className="h-8 w-8 bg-gray-800/50 rounded-full" />
                    </div>
                </div>
            </nav>

            <main className="pt-32 px-6 lg:px-12 max-w-[1400px] mx-auto animate-pulse">
                {/* Page Title */}
                <div className="mb-12 space-y-4">
                    <div className="h-12 bg-gray-800/50 rounded w-64" />
                    <div className="h-6 bg-gray-800/50 rounded w-96" />
                </div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="space-y-4">
                            {/* Image */}
                            <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
                                     style={{
                                         backgroundSize: '200% 100%',
                                         animation: 'shimmer 2s infinite'
                                     }}
                                />
                            </div>
                            {/* Content */}
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-800/50 rounded w-3/4" />
                                <div className="h-4 bg-gray-800/50 rounded w-full" />
                                <div className="h-4 bg-gray-800/50 rounded w-5/6" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <style>{\`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            \`}</style>
        </div>
    );
};

export default BlogPageSkeleton;
```

### 2. Exportar el Skeleton

Agrega tu nuevo skeleton al archivo `components/skeletons/index.ts`:

```tsx
export { default as BlogPageSkeleton } from './BlogPageSkeleton';
```

### 3. Implementar en la Página

Hay dos formas de implementar el skeleton en tu página:

#### Opción A: Usando el estado de loading del contexto

```tsx
import React from 'react';
import { useShop } from '../context/ShopContext';
import { BlogPageSkeleton } from '../components/skeletons';

const BlogPage: React.FC = () => {
    const { blogPosts, loading } = useShop();

    if (loading) {
        return <BlogPageSkeleton />;
    }

    return (
        <div>
            {/* Tu contenido real aquí */}
        </div>
    );
};
```

#### Opción B: Usando un estado local de loading

```tsx
import React, { useState, useEffect } from 'react';
import { BlogPageSkeleton } from '../components/skeletons';

const BlogPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Tu lógica de carga de datos
            const result = await fetch('/api/blog');
            setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <BlogPageSkeleton />;
    }

    return (
        <div>
            {/* Tu contenido real aquí */}
        </div>
    );
};
```

## Mejores Prácticas

### 1. Mantén la Consistencia Visual
El skeleton debe reflejar la estructura exacta del contenido real:
- Mismas proporciones
- Mismo número de elementos (o aproximado)
- Misma disposición (grid, flex, etc.)

### 2. Usa Animaciones Sutiles
```tsx
// Animación de pulso para elementos estáticos
className="animate-pulse"

// Animación shimmer para elementos más dinámicos
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
```

### 3. Colores Apropiados
Usa colores que combinen con tu tema:
```tsx
// Para tema oscuro
bg-gray-800/50
bg-gray-900/50

// Para bordes
border-white/5
border-gray-800
```

### 4. Responsive Design
Asegúrate de que tu skeleton sea responsive:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 5. Tiempo de Carga Máximo
Siempre implementa un timeout para evitar que el skeleton se muestre indefinidamente:

```tsx
useEffect(() => {
    const timeout = setTimeout(() => {
        setLoading(false);
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timeout);
}, []);
```

## Componentes Reutilizables

Puedes crear componentes skeleton más pequeños y reutilizables:

```tsx
// components/skeletons/SkeletonCard.tsx
export const SkeletonCard: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="aspect-video bg-gray-800/50 rounded-lg" />
        <div className="h-4 bg-gray-800/50 rounded w-3/4" />
        <div className="h-4 bg-gray-800/50 rounded w-1/2" />
    </div>
);

// Uso en tu página
<div className="grid grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
    ))}
</div>
```

## Testing

Prueba tu skeleton:
1. Simula una conexión lenta en DevTools (Network → Slow 3G)
2. Verifica que el skeleton aparezca inmediatamente
3. Confirma que la transición al contenido real sea suave
4. Asegúrate de que no haya "saltos" visuales

## Próximas Páginas a Implementar

- [ ] BlogPage
- [ ] AboutUs
- [ ] Contact
- [ ] FavoritesPage
- [ ] OrdersPage
- [ ] ProfilePage
- [ ] SeasonPage

## Recursos Adicionales

- [Skeleton Screens Best Practices](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a)
- [React Loading Skeleton](https://github.com/dvtng/react-loading-skeleton)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
