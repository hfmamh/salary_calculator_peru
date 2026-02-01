#!/bin/bash
# Script para desplegar en GitHub Pages
# Reemplaza TU_USUARIO con tu usuario de GitHub

echo "Configurando GitHub Pages..."

# Agregar el remoto (reemplaza TU_USUARIO con tu usuario)
git remote add origin https://github.com/TU_USUARIO/vibe_coding.git

# Hacer push del código
git push -u origin main

echo ""
echo "✅ Código subido a GitHub"
echo ""
echo "Ahora configura GitHub Pages:"
echo "1. Ve a https://github.com/TU_USUARIO/vibe_coding/settings/pages"
echo "2. En 'Source', selecciona 'Deploy from a branch'"
echo "3. Selecciona 'main' como branch"
echo "4. Selecciona '/' (root) como folder"
echo "5. Click en 'Save'"
echo ""
echo "Tu página estará disponible en:"
echo "https://TU_USUARIO.github.io/vibe_coding/"
