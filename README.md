![Sin título](https://github.com/user-attachments/assets/0ed85703-5af0-4236-9364-ca95dc80b1ba)

# ChatEnLinea

**ChatEnLinea** es una aplicación de chat en tiempo real desarrollada con **Ionic + Angular**, que permite a los usuarios enviar mensajes, fotos (cámara y galería), ubicación, y mensajes especiales con Pokémon usando la **PokéAPI**. La app cuenta con autenticación, avatar de usuario, diseño moderno y soporte para modo claro/oscuro, además de despliegue en Android.

## 🚀 Características

- ✅ Autenticación de usuarios (registro y login con Firebase)
- 💬 Chat en tiempo real con Firebase y Supabase
- 🖼️ Envío de fotos desde galería o cámara (Capacitor + Supabase Storage)
- 📍 Envío de ubicación (Google Maps)
- 🎲 Envío de Pokémon aleatorio (consulta a PokéAPI con nombre, imagen y stats)
- 🧑 Avatar de usuario (subida y actualización con Supabase Storage)
- 💡 Interfaz moderna y responsive (modo claro y oscuro)
- 📱 Despliegue en Android (APK)

---

## 🛠️ Instalación y ejecución local

1. Clona el repositorio:

```bash
git clone https://github.com/tuusuario/chat-en-linea.git
cd chat-en-linea


Instala dependencias

Configura tus credenciales

Las credenciales de Firebase y Supabase están en environment.ts y environment.prod.ts.
Si usas tu propio backend, reemplaza las claves por las tuyas.
Ejecuta en modo desarrollo

Despliegue en Android (APK)
Build de la app web

Sincroniza con Capacitor

Abre en Android Studio

(Opcional) Cambia el nombre de la app

Edita strings.xml
Cambia <string name="app_name">ChatEnLinea</string> por el nombre que desees.
Agrega permisos en AndroidManifest.xml

Genera el APK

En Android Studio:
Ve a Build > Build Bundle(s) / APK(s) > Build APK(s)
El APK estará en debug
Instala la APK en tu dispositivo

Copia la APK a tu Android y ábrela para instalar (puede que debas permitir "instalar apps desconocidas").
Estructura de carpetas principal
Funcionalidades técnicas
Autenticación: Firebase Auth
Mensajes: Firestore y Supabase Realtime
Fotos: Capacitor Camera + Supabase Storage
Ubicación: Geolocalización + Google Maps
Pokémon: PokéAPI (https://pokeapi.co/)
Avatar: Subida y actualización en Supabase Storage
UI: Ionic Framework, responsive, modo oscuro/claro
Créditos y dependencias principales
Ionic Framework
Angular
Firebase
Supabase
PokéAPI
Capacitor
Ionicons
Notas
Si cambias código, recuerda ejecutar:
Y recompilar el APK en Android Studio.
Los permisos de cámara, galería y ubicación están configurados en el AndroidManifest.xml.
Si los iconos no se ven, asegúrate de importar los iconos de Ionicons en main.ts.
Capturas de pantalla
(Agrega aquí tus screenshots de la app en acción)

Licencia
MIT
