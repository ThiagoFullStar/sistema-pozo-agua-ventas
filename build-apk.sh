#!/bin/bash

echo "📱 GENERANDO APK - SISTEMAS POZO DE AGUA JUAN MONTALVO"
echo "====================================================="

# Paso 1: Construir la aplicación Next.js
echo "🔨 Paso 1: Construyendo aplicación Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build de Next.js"
    exit 1
fi

# Paso 2: Agregar plataforma Android
echo "📱 Paso 2: Agregando plataforma Android..."
npx cap add android

# Paso 3: Sincronizar archivos
echo "🔄 Paso 3: Sincronizando archivos..."
npx cap sync android

# Paso 4: Copiar archivos web
echo "📋 Paso 4: Copiando archivos web..."
npx cap copy android

echo ""
echo "✅ ¡CONFIGURACIÓN COMPLETADA!"
echo ""
echo "📋 PRÓXIMOS PASOS PARA GENERAR EL APK:"
echo ""
echo "OPCIÓN A - Usando Android Studio (Recomendado):"
echo "1. Ejecutar: npx cap open android"
echo "2. En Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "3. El APK se generará en: android/app/build/outputs/apk/debug/"
echo ""
echo "OPCIÓN B - Usando línea de comandos:"
echo "1. cd android"
echo "2. ./gradlew assembleDebug"
echo "3. El APK estará en: app/build/outputs/apk/debug/"
echo ""
echo "📱 COMPARTIR EL APK:"
echo "1. Localizar el archivo .apk generado"
echo "2. Enviarlo por WhatsApp/Email a los trabajadores"
echo "3. Los trabajadores deben habilitar 'Fuentes desconocidas' en Android"
echo "4. Instalar el APK tocándolo"
echo ""
echo "====================================================="
