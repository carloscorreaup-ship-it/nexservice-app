# NEXSERVICE.APP-1 🚀

**Plataforma de Conexión Directa entre Proveedores Verificados de Productos y Servicios y Clientes con Mapa Interactivo (Snap Map) y Firebase Firestore.**

---

## ✨ Características Principales

1. **Catálogo Dual (Productos & Servicios Verificados):**
   - Venta de productos con control de stock, fotos, precios en COP y envíos a domicilio.
   - Tarifario y contratación de servicios profesionales (plomería, electricidad, legal, tecnología, estética, medicina).
   - Contacto directo por **WhatsApp** y llamadas telefónicas con un solo toque (sin comisiones intermedias obligatorias).

2. **Mapa Interactivo estilo Snap Map:**
   - Visualización de proveedores y clientes en un mapa dinámico con sus **direcciones fijas**.
   - Avatares personalizados con insignias de verificación oficial.
   - Cálculo automático de distancias y radar de cercanía.

3. **Backend Firebase Firestore:**
   - Base de datos en tiempo real para `providers`, `products`, `services`, `bookings_orders`, `users` y `reviews`.
   - Reglas de seguridad (`firestore.rules`) e índices listos para producción (`firestore.indexes.json`).
   - Modo de respaldo local (Offline Fallback) para pruebas inmediatas y demostración sin bloqueos.

4. **Estudio de Gestión para Proveedores:**
   - Panel para publicar productos, configurar servicios, agendar citas y fijar la ubicación exacta del negocio.

---

## 🛠️ Instalación y Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Construir para producción
npm run build
```

---

## 📄 Guía de Configuración
Consulta el archivo `GUIA_CONFIGURACION_PASO_A_PASO.md` para ver el paso a paso detallado de vinculación con Firebase Console y despliegue a producción.
