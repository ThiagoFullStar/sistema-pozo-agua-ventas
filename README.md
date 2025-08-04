# SISTEMAS POZO DE AGUA JUAN MONTALVO

## 📱 Aplicación Web Móvil para Registro de Ventas de Agua

Una aplicación web moderna y responsive diseñada específicamente para gestionar las ventas de agua de pozo, optimizada para dispositivos móviles (Android e iOS) y desktop.

## 🚀 Características Principales

### ✅ **Funcionalidades Implementadas**

#### 🏠 **Dashboard Principal**
- Resumen de ventas del día en tiempo real
- Estadísticas de galones vendidos
- Ingresos recibidos y pendientes de cobro
- Acciones rápidas para navegación
- Historial de ventas recientes

#### 👥 **Gestión de Clientes**
- **Registro completo de clientes:**
  - Nombre del cliente
  - Placa del vehículo
  - Capacidad del tanque en galones
  - **Tipo de cliente:** Corriente (pago inmediato) o Crédito (pago posterior)
- Búsqueda por nombre o placa
- Edición y eliminación de clientes
- Visualización del consumo total histórico

#### 💰 **Registro de Ventas**
- **Buscador inteligente de clientes** por nombre o placa
- **Auto-llenado de galones** con la capacidad del vehículo del cliente
- **Precios sugeridos** basados en el tipo de cliente:
  - Clientes corrientes: $5 por defecto
  - Clientes a crédito: $10 por defecto
- **Gestión automática de pagos:**
  - Clientes corrientes: pueden marcar como pagado/debe
  - Clientes a crédito: automáticamente quedan como "debe"
- Validación de capacidad del vehículo
- Notas adicionales opcionales

#### 📊 **Reportes Detallados**
- **Reportes generales:**
  - Estadísticas por cliente
  - Estadísticas por trabajador
  - Ventas por día (últimos 7 días)
  - Filtros por fecha y trabajador

- **Reportes individuales por cliente:**
  - Acceso directo desde la lista de clientes
  - Filtros por período: día, semana, mes
  - **Ideal para clientes a crédito:** generar reportes para envío
  - Exportación a CSV con resumen completo
  - Detalle de cada venta con fecha, galones, precio y estado

#### 👨‍💼 **Gestión de Trabajadores**
- Múltiples trabajadores pueden usar la misma aplicación
- Selección de trabajador activo
- Registro automático del trabajador en cada venta
- **Sincronización de datos** entre trabajadores

### 📱 **Optimización Móvil (Android/iOS)**

#### 🎨 **Diseño Responsive**
- **Header móvil compacto** con selector de trabajador
- **Navegación inferior** con iconos intuitivos (🏠 📊 👥 💰)
- **Sidebar oculto** en móviles, visible en desktop
- **Formularios optimizados** para pantallas táctiles
- **Botones y campos de tamaño adecuado** para dedos

#### ⚡ **Rendimiento Móvil**
- **Almacenamiento local** (localStorage) - funciona sin internet
- **Carga rápida** y navegación fluida
- **Meta tags optimizados** para PWA
- **Viewport configurado** para dispositivos móviles
- **Prevención de zoom** no deseado

#### 🔄 **Funcionalidad Offline**
- **Datos persistentes** en el dispositivo
- **Sincronización automática** entre sesiones
- **No requiere conexión a internet** para funcionar

## 🛠️ **Tecnologías Utilizadas**

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Almacenamiento:** localStorage (sin base de datos externa)
- **Formularios:** React Hook Form + Zod
- **Notificaciones:** Sonner
- **Iconos:** Emojis (sin dependencias externas)

## 📋 **Instalación y Uso**

### **Requisitos Previos**
- Node.js 18+ 
- npm o yarn

### **Instalación**
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:8000
```

### **Construcción para Producción**
```bash
# Construir la aplicación
npm run build

# Ejecutar en producción
npm start
```

## 📖 **Guía de Uso**

### **1. Configuración Inicial**
1. **Agregar trabajador:** Haz clic en "Agregar Trabajador" en el sidebar/header móvil
2. **Seleccionar trabajador activo:** Usa el dropdown para elegir quién está trabajando

### **2. Gestión de Clientes**
1. **Agregar cliente:** Ve a "Clientes" → "Agregar Cliente"
2. **Llenar información:**
   - Nombre completo
   - Placa del vehículo
   - Capacidad del tanque en galones
   - **Tipo:** Corriente o Crédito
3. **Guardar:** El cliente aparecerá en la lista

### **3. Registrar Ventas**
1. **Ir a "Ventas"**
2. **Buscar cliente:** Escribe nombre o placa en el buscador
3. **Seleccionar cliente:** Los galones se llenan automáticamente
4. **Verificar precio:** Se sugiere según el tipo de cliente
5. **Confirmar estado de pago:** 
   - Corrientes: puedes marcar pagado/debe
   - Crédito: automáticamente queda como "debe"
6. **Registrar venta**

### **4. Generar Reportes para Clientes a Crédito**
1. **Ir a "Reportes"**
2. **Buscar el cliente** en la lista
3. **Hacer clic en "Ver Detalle"**
4. **Seleccionar período:** día, semana o mes
5. **Exportar reporte:** Botón "Exportar Reporte"
6. **Enviar al cliente:** El archivo CSV contiene todo el detalle

## 💡 **Casos de Uso Principales**

### **Escenario 1: Cliente Corriente**
- Cliente llega al pozo
- Trabajador busca por placa: "ABC123"
- Sistema auto-llena 150 galones (capacidad del vehículo)
- Precio sugerido: $5
- Cliente paga → marcar como "Pagado"
- Venta registrada ✅

### **Escenario 2: Cliente a Crédito**
- Cliente frecuente con cuenta corriente
- Trabajador registra venta normalmente
- Sistema automáticamente marca como "Debe"
- Al final del período (semana/mes):
  - Ir a Reportes → Cliente → Ver Detalle
  - Exportar reporte del período
  - Enviar resumen al cliente para cobro

### **Escenario 3: Múltiples Trabajadores**
- Trabajador A registra ventas en la mañana
- Trabajador B toma el turno en la tarde
- Trabajador B ve todas las ventas del día
- Datos sincronizados automáticamente

## 🔧 **Configuración Avanzada**

### **Precios por Defecto**
Los precios se pueden modificar en el código:
```typescript
// En src/app/ventas/page.tsx línea ~240
const precioSugerido = cliente.tipoCliente === 'credito' ? '10' : '5';
```

### **Capacidades de Vehículos Comunes**
- Camiones pequeños: 100-200 galones
- Camiones medianos: 300-500 galones  
- Camiones grandes: 800-1500 galones

## 📊 **Estructura de Datos**

### **Cliente**
```typescript
{
  id: string;
  nombre: string;
  placa: string;
  capacidadGalones: number;
  tipoCliente: 'corriente' | 'credito';
  fechaRegistro: string;
}
```

### **Venta**
```typescript
{
  id: string;
  clienteId: string;
  trabajadorId: string;
  fecha: string;
  galones: number;
  precioTotal: number;
  pagado: boolean;
  notas?: string;
}
```

## 🚀 **Próximas Mejoras Sugeridas**

- [ ] **Backup automático** a Google Drive/Dropbox
- [ ] **Modo offline** con sincronización posterior
- [ ] **Códigos QR** para clientes frecuentes
- [ ] **Calculadora de precios** por galón
- [ ] **Estadísticas avanzadas** con gráficos
- [ ] **Notificaciones push** para recordatorios de cobro
- [ ] **Integración con WhatsApp** para envío de reportes

## 🆘 **Soporte y Mantenimiento**

### **Limpiar Datos**
Para resetear la aplicación (eliminar todos los datos):
```javascript
// En la consola del navegador (F12)
localStorage.clear();
location.reload();
```

### **Backup Manual**
```javascript
// Exportar datos
const backup = {
  clientes: localStorage.getItem('pozo-agua-clientes'),
  ventas: localStorage.getItem('pozo-agua-ventas'),
  trabajadores: localStorage.getItem('pozo-agua-trabajadores')
};
console.log(JSON.stringify(backup));
```

## 🚀 **CÓMO COMPARTIR LA APLICACIÓN CON LOS TRABAJADORES**

### **Opción 1: Hosting Gratuito (RECOMENDADO) 🌐**

#### **A. Vercel (Más Fácil)**
1. **Crear cuenta gratuita en Vercel:**
   - Ve a https://vercel.com
   - Regístrate con tu email o GitHub

2. **Subir la aplicación:**
   ```bash
   # Instalar Vercel CLI
   npm install -g vercel
   
   # Desde la carpeta del proyecto
   vercel
   
   # Seguir las instrucciones (solo presionar Enter)
   ```

3. **Resultado:** Obtienes una URL como `https://tu-app.vercel.app`
4. **Compartir:** Envía esta URL a los trabajadores por WhatsApp

#### **B. Netlify (Alternativa)**
1. Ve a https://netlify.com
2. Arrastra la carpeta del proyecto a Netlify
3. Obtienes una URL como `https://tu-app.netlify.app`

### **Opción 2: Servidor Local en la Red WiFi 📶**

Si todos los trabajadores están en la misma red WiFi:

```bash
# Ejecutar en tu computadora
npm run dev

# La aplicación estará disponible en:
# http://TU-IP-LOCAL:8000
# Ejemplo: http://192.168.1.100:8000
```

**Para encontrar tu IP:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

### **Opción 3: Crear APK para Android 📱**

#### **Usando Capacitor (Recomendado)**
```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Inicializar Capacitor
npx cap init "Pozo Agua" "com.thiagoamores.pozoagua"

# Construir la app
npm run build
npx cap add android
npx cap sync

# Generar APK
npx cap open android
# En Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### **Opción 4: PWA (Progressive Web App) 📲**

La aplicación ya está optimizada como PWA. Los trabajadores pueden:

1. **Abrir la URL en el navegador móvil**
2. **Agregar a pantalla de inicio:**
   - **Android:** Chrome > Menú (⋮) > "Agregar a pantalla de inicio"
   - **iOS:** Safari > Compartir > "Agregar a pantalla de inicio"

3. **Resultado:** La app aparece como una aplicación nativa

---

## 📋 **GUÍA RÁPIDA PARA COMPARTIR**

### **🎯 Método Más Rápido (5 minutos):**

1. **Subir a Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Copiar la URL que te da Vercel**

3. **Enviar por WhatsApp a los trabajadores:**
   ```
   🚰 SISTEMA POZO DE AGUA JUAN MONTALVO
   
   Link de la aplicación:
   https://tu-app.vercel.app
   
   📱 INSTRUCCIONES:
   1. Abrir el link en el navegador del celular
   2. Tocar el menú (⋮) y "Agregar a pantalla de inicio"
   3. ¡Listo! Ya tienes la app en tu celular
   
   👨‍💼 Para empezar:
   - Agregar tu nombre como trabajador
   - Seleccionarte en el dropdown
   - ¡Comenzar a registrar ventas!
   ```

### **🔧 Configuración de Dominio Personalizado (Opcional):**

Si quieres un dominio como `pozoagua.com`:
1. Comprar dominio en Namecheap/GoDaddy (~$10/año)
2. Conectarlo a Vercel (gratis)
3. Resultado: `https://pozoagua.com`

---

## 💡 **VENTAJAS DE CADA MÉTODO**

| Método | Ventajas | Desventajas |
|--------|----------|-------------|
| **Vercel/Netlify** | ✅ Gratis<br>✅ Acceso desde cualquier lugar<br>✅ Actualizaciones automáticas | ❌ Requiere internet |
| **Servidor Local** | ✅ No requiere internet<br>✅ Datos privados | ❌ Solo funciona en la misma WiFi<br>❌ Computadora debe estar encendida |
| **APK Android** | ✅ App nativa<br>✅ Funciona offline | ❌ Solo Android<br>❌ Más complejo de crear |
| **PWA** | ✅ Funciona en todos los dispositivos<br>✅ Se ve como app nativa | ❌ Requiere internet inicial |

---

## 🎯 **RECOMENDACIÓN FINAL**

**Para empezar YA (hoy mismo):**
1. Usar **Vercel** (5 minutos)
2. Enviar link por WhatsApp
3. Los trabajadores agregan a pantalla de inicio

**Para el futuro:**
- Considerar APK si quieres distribución más profesional
- Dominio personalizado para mayor profesionalismo

## 📞 **Contacto**

Para soporte técnico o mejoras, contactar al desarrollador.

---

**SISTEMAS POZO DE AGUA JUAN MONTALVO** - Versión 1.0  
*Aplicación desarrollada con ❤️ por THIAGO AMORES para optimizar la gestión de ventas de agua*
