#!/bin/bash

echo "🚀 DESPLEGANDO SISTEMAS POZO DE AGUA JUAN MONTALVO"
echo "=================================================="

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🔨 Construyendo la aplicación..."
npm run build

echo "🌐 Desplegando a Vercel..."
vercel --prod

echo ""
echo "✅ ¡DESPLIEGUE COMPLETADO!"
echo ""
echo "📱 INSTRUCCIONES PARA COMPARTIR:"
echo "1. Copia la URL que aparece arriba"
echo "2. Envía este mensaje por WhatsApp a los trabajadores:"
echo ""
echo "🚰 SISTEMA POZO DE AGUA JUAN MONTALVO"
echo ""
echo "Link de la aplicación:"
echo "[PEGAR_URL_AQUÍ]"
echo ""
echo "📱 INSTRUCCIONES:"
echo "1. Abrir el link en el navegador del celular"
echo "2. Tocar el menú (⋮) y 'Agregar a pantalla de inicio'"
echo "3. ¡Listo! Ya tienes la app en tu celular"
echo ""
echo "👨‍💼 Para empezar:"
echo "- Agregar tu nombre como trabajador"
echo "- Seleccionarte en el dropdown"
echo "- ¡Comenzar a registrar ventas!"
echo ""
echo "=================================================="
