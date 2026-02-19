# 🔀 Instrucciones para Merge - Skeleton Screens

## ⚠️ Antes de Hacer Merge

### 1. Verificar que todo funciona correctamente

```bash
# Asegúrate de estar en la rama feature/skeleton-loading
git branch

# Inicia el servidor de desarrollo
npm run dev:web

# Abre http://localhost:5175 en tu navegador
# Verifica que los skeleton screens aparezcan durante la carga
```

### 2. Revisar los cambios

```bash
# Ver todos los commits de la rama
git log --oneline main..feature/skeleton-loading

# Ver los archivos modificados
git diff main --name-only

# Ver los cambios específicos
git diff main
```

---

## 🚀 Proceso de Merge

### Opción 1: Merge Directo (Recomendado para equipos pequeños)

```bash
# 1. Asegúrate de que todos los cambios estén commiteados
git status

# 2. Cambia a la rama main
git checkout main

# 3. Actualiza main con los últimos cambios del remoto (si trabajas en equipo)
git pull origin main

# 4. Haz merge de la rama feature
git merge feature/skeleton-loading

# 5. Si hay conflictos, resuélvelos y luego:
git add .
git commit -m "Merge feature/skeleton-loading into main"

# 6. Push a origin
git push origin main

# 7. (Opcional) Elimina la rama feature local
git branch -d feature/skeleton-loading

# 8. (Opcional) Elimina la rama feature remota
git push origin --delete feature/skeleton-loading
```

### Opción 2: Pull Request (Recomendado para equipos grandes)

```bash
# 1. Push de la rama feature al remoto
git push origin feature/skeleton-loading

# 2. Ve a GitHub/GitLab/Bitbucket
# 3. Crea un Pull Request de feature/skeleton-loading hacia main
# 4. Solicita revisión de código
# 5. Una vez aprobado, haz merge desde la interfaz web
```

---

## 📋 Checklist Pre-Merge

- [ ] Todos los tests pasan (si existen)
- [ ] No hay errores de compilación
- [ ] La aplicación funciona correctamente en desarrollo
- [ ] Los skeleton screens se muestran correctamente
- [ ] La transición de skeleton a contenido real es suave
- [ ] Responsive design funciona en mobile, tablet y desktop
- [ ] Documentación está completa
- [ ] Commits están bien organizados y con mensajes descriptivos

---

## 🔍 Verificación Post-Merge

Después de hacer merge a main:

```bash
# 1. Verifica que estás en main
git branch

# 2. Verifica que los cambios están presentes
ls components/skeletons

# 3. Inicia el servidor
npm run dev:web

# 4. Prueba la aplicación
# - Abre http://localhost:5175
# - Simula conexión lenta (DevTools → Network → Slow 3G)
# - Verifica que los skeletons aparezcan
# - Verifica que el contenido real se cargue correctamente
```

---

## 🐛 Resolución de Conflictos

Si encuentras conflictos durante el merge:

### 1. Identifica los archivos en conflicto
```bash
git status
```

### 2. Abre cada archivo y busca las marcas de conflicto
```
<<<<<<< HEAD
// Código de main
=======
// Código de feature/skeleton-loading
>>>>>>> feature/skeleton-loading
```

### 3. Resuelve manualmente
- Decide qué código mantener
- Elimina las marcas de conflicto
- Guarda el archivo

### 4. Marca como resuelto
```bash
git add <archivo-resuelto>
```

### 5. Completa el merge
```bash
git commit -m "Resolve merge conflicts"
```

---

## 🔄 Rollback (Si algo sale mal)

Si necesitas revertir el merge:

```bash
# Encuentra el hash del commit antes del merge
git log --oneline

# Revierte al commit anterior
git reset --hard <hash-del-commit-anterior>

# Si ya hiciste push, necesitarás force push (¡CUIDADO!)
git push origin main --force
```

---

## 📊 Archivos Afectados

### Modificados:
- `App.tsx` - Reemplaza LoadingScreen con HomePageSkeleton

### Creados:
- `components/skeletons/ProductCardSkeleton.tsx`
- `components/skeletons/HeroSkeleton.tsx`
- `components/skeletons/ProductSectionSkeleton.tsx`
- `components/skeletons/HomePageSkeleton.tsx`
- `components/skeletons/ProductDetailSkeleton.tsx`
- `components/skeletons/CategoryPageSkeleton.tsx`
- `components/skeletons/index.ts`
- `components/skeletons/README.md`
- `components/skeletons/IMPLEMENTATION_GUIDE.md`
- `SKELETON_CHANGELOG.md`
- `SKELETON_SUMMARY.md`
- `MERGE_INSTRUCTIONS.md` (este archivo)

---

## 🎯 Después del Merge

### 1. Comunica al equipo
Informa a tu equipo que se ha implementado el nuevo sistema de skeleton screens.

### 2. Actualiza la documentación del proyecto
Si tienes un README principal, actualízalo mencionando el nuevo sistema.

### 3. Monitorea errores
Revisa los logs y reportes de errores en los próximos días.

### 4. Planifica próximas implementaciones
Revisa la lista de páginas pendientes en `SKELETON_SUMMARY.md`.

---

## 📞 Soporte

Si encuentras problemas durante el merge:

1. Revisa la documentación en `components/skeletons/README.md`
2. Consulta el changelog en `SKELETON_CHANGELOG.md`
3. Revisa los commits individuales para entender cada cambio
4. Si el problema persiste, considera revertir el merge temporalmente

---

## ✅ Merge Exitoso

Una vez completado el merge exitosamente:

```bash
# Verifica que todo funciona
npm run dev:web

# Haz un build de producción para asegurar que no hay errores
npm run build

# Si todo está bien, celebra! 🎉
```

---

**¡Buena suerte con el merge!** 🚀
