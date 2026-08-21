# GUÍA COMPLETA DE CONFIGURACIÓN PASO A PASO
## NEXSERVICE.APP-1

Esta guía contiene todas las instrucciones para dejar la aplicación 100% operativa y conectada con tu propia base de datos de Firebase Firestore y desplegarla en la web.

---

### PASO 1: Crear tu Proyecto en Firebase

1. Ingresa a [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** (o "Add project").
3. Asigna un nombre a tu proyecto, por ejemplo: `nexservice-app`.
4. (Opcional) Puedes habilitar Google Analytics o continuar sin él.
5. Haz clic en **"Crear proyecto"**.

---

### PASO 2: Habilitar Firestore Database

1. En el menú lateral izquierdo de Firebase, ve a **Compilación > Firestore Database**.
2. Haz clic en **"Crear base de datos"** (Create database).
3. Selecciona la ubicación de la base de datos (se recomienda `nam5 (us-central)` o la más cercana a Colombia).
4. Elige **"Modo de prueba"** (Test mode) inicialmente para comenzar a escribir datos inmediatamente.
5. Haz clic en **"Habilitar"**.

---

### PASO 3: Publicar las Reglas de Seguridad de Firestore

1. En la pestaña **"Reglas"** (Rules) de Firestore Database, copia y pega el contenido exacto del archivo `firestore.rules` incluido en este proyecto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /providers/{providerId} {
      allow read, write: if true;
    }
    match /products/{productId} {
      allow read, write: if true;
    }
    match /services/{serviceId} {
      allow read, write: if true;
    }
    match /bookings_orders/{orderId} {
      allow read, write: if true;
    }
    match /reviews/{reviewId} {
      allow read, write: if true;
    }
  }
}
```
2. Haz clic en **"Publicar"** (Publish).

---

### PASO 4: Obtener tus Credenciales Web de Firebase

1. En la esquina superior izquierda de Firebase Console, haz clic en el ícono de engranaje ⚙️ **"Configuración del proyecto"** (Project settings).
2. En la pestaña **"General"**, baja hasta la sección **"Tus apps"** (Your apps) y haz clic en el ícono Web `</>`.
3. Registra tu app con el nombre `NexService Web`.
4. Firebase te mostrará un bloque de código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "nexservice-app.firebaseapp.com",
  projectId: "nexservice-app",
  storageBucket: "nexservice-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

---

### PASO 5: Vincular las Claves a tu App

Tienes **dos opciones** fáciles:

#### Opción A (Directamente en la Aplicación):
1. Abre la aplicación en tu navegador.
2. En la barra superior, haz clic en el botón **"Configurar Firebase"**.
3. Pega el JSON completo o llena los campos y haz clic en **"Guardar y Conectar"**.
4. ¡Listo! La app se conectará en tiempo real.

#### Opción B (En el archivo `.env.local`):
Crea un archivo llamado `.env.local` en la raíz de `NEXSERVICE.APP-1` con tus valores:
```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=nexservice-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nexservice-app
VITE_FIREBASE_STORAGE_BUCKET=nexservice-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

---

### PASO 6: Despliegue Gratuito en Producción (Vercel o Firebase Hosting)

#### Despliegue en Vercel (Recomendado):
1. Sube tu proyecto a GitHub.
2. Entra a [Vercel](https://vercel.com/) e importa tu repositorio.
3. Agrega tus variables de entorno `VITE_FIREBASE_*`.
4. Haz clic en **"Deploy"**. Tendrás tu dominio HTTPS público en segundos.

---

### 📋 Colecciones Creadas en Firestore

- `users`: Perfiles de clientes y proveedores con sus direcciones fijas.
- `providers`: Información detallada de negocios, insignias de verificación, valoraciones y teléfonos.
- `products`: Catálogo de productos en venta con precios, imágenes, stock y garantías.
- `services`: Lista de servicios disponibles para contratación inmediata.
- `bookings_orders`: Pedidos de productos y solicitudes de servicios.
- `reviews`: Calificaciones y testimonios de clientes verificados.
