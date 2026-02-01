# Instrucciones para Desplegar en GitHub Pages

## Paso 1: Crear el Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `vibe_coding` (o el que prefieras)
3. Elige si será Público o Privado
4. **NO** marques "Initialize with README"
5. Click en "Create repository"

## Paso 2: Conectar el Repositorio Local con GitHub

Ejecuta estos comandos en la terminal (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
# Agregar el remoto
git remote add origin https://github.com/TU_USUARIO/vibe_coding.git

# Hacer push del código
git push -u origin main
```

## Paso 3: Configurar GitHub Pages

1. Ve a la página de configuración de tu repositorio:
   `https://github.com/TU_USUARIO/vibe_coding/settings/pages`

2. En la sección "Source":
   - Selecciona "Deploy from a branch"
   - Branch: `main`
   - Folder: `/` (root)
   - Click en "Save"

3. Espera unos minutos mientras GitHub procesa el despliegue

## Paso 4: Acceder a tu Página

Tu calculadora estará disponible en:
```
https://TU_USUARIO.github.io/vibe_coding/
```

## Notas

- GitHub Pages puede tardar unos minutos en desplegar la página
- Si haces cambios, simplemente haz `git push` y se actualizará automáticamente
- El despliegue puede tardar 1-2 minutos después de cada push
